import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { GasPriceGateway } from './gateways/gas-price.gateway';
import { GasPriceService } from './services/gas-price.service';
import { GasPriceHistory } from './entities/gas-price.entity';
import { WsJwtGuard } from './guards/ws-jwt.guard';

@Module({
  imports: [
    TypeOrmModule.forFeature([GasPriceHistory]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get('JWT_EXPIRATION', '1d'),
        },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [GasPriceGateway, GasPriceService, WsJwtGuard],
  exports: [GasPriceService],
})
export class RealtimeGasPriceModule {} 