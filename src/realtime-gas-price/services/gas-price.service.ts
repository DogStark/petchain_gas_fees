import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GasPriceHistory } from '../entities/gas-price.entity';
import { GasPriceUpdateDto } from '../dto/gas-price.dto';
import { Cron, CronExpression } from '@nestjs/schedule';
import { GasPriceGateway } from '../gateways/gas-price.gateway';
import axios from 'axios';

@Injectable()
export class GasPriceService {
  private readonly logger = new Logger(GasPriceService.name);
  private readonly networks: Map<string, any> = new Map();

  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(GasPriceHistory)
    private readonly gasPriceRepository: Repository<GasPriceHistory>,
    private readonly gasPriceGateway: GasPriceGateway,
  ) {
    this.initializeNetworks();
  }

  private initializeNetworks() {
    // Initialize network configurations
    this.networks.set('ethereum', {
      rpcUrl: this.configService.get('ETH_RPC_URL'),
      gasPriceEndpoint: this.configService.get('ETH_GAS_PRICE_ENDPOINT'),
      multiplier: 1.0,
    });
    // Add more networks as needed
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async updateGasPrices() {
    try {
      for (const [network, config] of this.networks) {
        const gasPrice = await this.fetchGasPrice(network, config);
        await this.saveGasPrice(network, gasPrice);
        await this.broadcastUpdate(network, gasPrice);
      }
    } catch (error) {
      this.logger.error(`Failed to update gas prices: ${error.message}`);
    }
  }

  async getCurrentGasPrice(network: string, petId?: string): Promise<GasPriceUpdateDto> {
    try {
      const latestPrice = await this.gasPriceRepository.findOne({
        where: { network },
        order: { timestamp: 'DESC' },
      });

      if (!latestPrice) {
        throw new Error(`No gas price data available for network: ${network}`);
      }

      const gasPrice = this.calculatePetSpecificPrice(latestPrice, petId);

      return {
        network,
        petId,
        gasPrice,
        timestamp: new Date(),
        source: 'database',
      };
    } catch (error) {
      this.logger.error(`Failed to get current gas price: ${error.message}`);
      throw error;
    }
  }

  private async fetchGasPrice(network: string, config: any): Promise<number> {
    try {
      if (config.gasPriceEndpoint) {
        const response = await axios.get(config.gasPriceEndpoint);
        return response.data.gasPrice * config.multiplier;
      }

      // Fallback to RPC call
      const response = await axios.post(config.rpcUrl, {
        jsonrpc: '2.0',
        method: 'eth_gasPrice',
        params: [],
        id: 1,
      });

      return parseInt(response.data.result, 16) * config.multiplier;
    } catch (error) {
      this.logger.error(`Failed to fetch gas price for ${network}: ${error.message}`);
      throw error;
    }
  }

  private async saveGasPrice(network: string, gasPrice: number): Promise<void> {
    try {
      const gasPriceHistory = new GasPriceHistory();
      gasPriceHistory.network = network;
      gasPriceHistory.gasPrice = gasPrice;
      gasPriceHistory.timestamp = new Date();

      await this.gasPriceRepository.save(gasPriceHistory);
    } catch (error) {
      this.logger.error(`Failed to save gas price: ${error.message}`);
      throw error;
    }
  }

  private async broadcastUpdate(network: string, gasPrice: number): Promise<void> {
    try {
      const update: GasPriceUpdateDto = {
        network,
        gasPrice,
        timestamp: new Date(),
        source: 'realtime',
      };

      await this.gasPriceGateway.broadcastGasPriceUpdate(update);
    } catch (error) {
      this.logger.error(`Failed to broadcast gas price update: ${error.message}`);
    }
  }

  private calculatePetSpecificPrice(gasPrice: GasPriceHistory, petId?: string): number {
    if (!petId) {
      return gasPrice.gasPrice;
    }

    // Implement pet-specific gas price calculation logic
    // This is a placeholder - implement actual calculation based on pet characteristics
    const petMultiplier = 1.0; // Get from pet service
    return gasPrice.gasPrice * petMultiplier;
  }
} 