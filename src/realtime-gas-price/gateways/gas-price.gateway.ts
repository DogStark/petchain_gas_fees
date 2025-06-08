import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { GasPriceService } from '../services/gas-price.service';
import { GasPriceUpdateDto } from '../dto/gas-price.dto';
import { WsJwtGuard } from '../guards/ws-jwt.guard';
import { UseGuards } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: 'gas-price',
})
export class GasPriceGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(GasPriceGateway.name);
  private readonly connectedClients: Map<string, Socket> = new Map();
  private readonly userRooms: Map<string, Set<string>> = new Map();

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly gasPriceService: GasPriceService,
  ) {}

  afterInit() {
    this.logger.log('Gas Price WebSocket Gateway initialized');
  }

  async handleConnection(client: Socket) {
    try {
      const token = this.extractTokenFromSocket(client);
      if (!token) {
        client.disconnect();
        return;
      }

      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get('JWT_SECRET'),
      });

      // Attach user info to socket
      client.data.user = payload;
      this.connectedClients.set(client.id, client);
      this.userRooms.set(client.id, new Set());

      this.logger.log(`Client connected: ${client.id} (User: ${payload.sub})`);
    } catch (error) {
      this.logger.error(`Connection error: ${error.message}`);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    const rooms = this.userRooms.get(client.id);
    if (rooms) {
      rooms.forEach(room => {
        client.leave(room);
      });
      this.userRooms.delete(client.id);
    }
    this.connectedClients.delete(client.id);
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('subscribe')
  async handleSubscribe(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { network: string; petId?: string },
  ) {
    try {
      const { network, petId } = data;
      const room = this.getRoomName(network, petId);
      
      // Join room
      await client.join(room);
      this.userRooms.get(client.id)?.add(room);

      // Send initial gas price
      const gasPrice = await this.gasPriceService.getCurrentGasPrice(network, petId);
      client.emit('gasPriceUpdate', gasPrice);

      this.logger.log(`Client ${client.id} subscribed to ${room}`);
      return { success: true, room };
    } catch (error) {
      this.logger.error(`Subscription error: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('unsubscribe')
  async handleUnsubscribe(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { network: string; petId?: string },
  ) {
    try {
      const { network, petId } = data;
      const room = this.getRoomName(network, petId);
      
      await client.leave(room);
      this.userRooms.get(client.id)?.delete(room);

      this.logger.log(`Client ${client.id} unsubscribed from ${room}`);
      return { success: true, room };
    } catch (error) {
      this.logger.error(`Unsubscription error: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  async broadcastGasPriceUpdate(update: GasPriceUpdateDto) {
    const room = this.getRoomName(update.network, update.petId);
    this.server.to(room).emit('gasPriceUpdate', update);
  }

  private getRoomName(network: string, petId?: string): string {
    return petId ? `${network}:${petId}` : network;
  }

  private extractTokenFromSocket(client: Socket): string | null {
    const auth = client.handshake.auth;
    return auth?.token || null;
  }
} 