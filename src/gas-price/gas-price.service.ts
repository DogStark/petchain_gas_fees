import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { firstValueFrom } from 'rxjs';
import { AxiosError } from 'axios';

interface GasPriceResponse {
  safeLow: number;
  standard: number;
  fast: number;
  fastest: number;
  timestamp: number;
  source: string;
}

@Injectable()
export class GasPriceService {
  private readonly logger = new Logger(GasPriceService.name);
  private readonly apiEndpoints = {
    etherscan: process.env.ETHERSCAN_API_URL,
    gasStation: process.env.GAS_STATION_API_URL,
    ethGasWatch: process.env.ETH_GAS_WATCH_API_URL,
  };

  constructor(
    private readonly httpService: HttpService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async getGasPrice(): Promise<GasPriceResponse> {
    try {
      // Try to get from cache first
      const cachedPrice = await this.cacheManager.get<GasPriceResponse>('gasPrice');
      if (cachedPrice) {
        return cachedPrice;
      }

      // Try each API in sequence until one succeeds
      const apis = [
        this.fetchEtherscanGasPrice,
        this.fetchGasStationPrice,
        this.fetchEthGasWatchPrice,
      ];

      for (const api of apis) {
        try {
          const result = await api();
          if (result) {
            // Cache the successful result
            await this.cacheManager.set('gasPrice', result, 60000); // Cache for 1 minute
            return result;
          }
        } catch (error) {
          this.logger.error(`API call failed: ${error.message}`);
          continue;
        }
      }

      throw new Error('All gas price APIs failed');
    } catch (error) {
      this.logger.error(`Failed to fetch gas price: ${error.message}`);
      throw error;
    }
  }

  private async fetchEtherscanGasPrice(): Promise<GasPriceResponse | null> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(this.apiEndpoints.etherscan, {
          params: {
            module: 'gastracker',
            action: 'gasoracle',
            apikey: process.env.ETHERSCAN_API_KEY,
          },
        }),
      );

      const data = response.data.result;
      return {
        safeLow: parseInt(data.SafeGasPrice),
        standard: parseInt(data.ProposeGasPrice),
        fast: parseInt(data.FastGasPrice),
        fastest: parseInt(data.FastGasPrice),
        timestamp: Date.now(),
        source: 'etherscan',
      };
    } catch (error) {
      if (error instanceof AxiosError) {
        this.logger.error(`Etherscan API error: ${error.message}`);
      }
      return null;
    }
  }

  private async fetchGasStationPrice(): Promise<GasPriceResponse | null> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(this.apiEndpoints.gasStation),
      );

      const data = response.data;
      return {
        safeLow: data.safe_low,
        standard: data.average,
        fast: data.fast,
        fastest: data.fastest,
        timestamp: data.block_time,
        source: 'gasstation',
      };
    } catch (error) {
      if (error instanceof AxiosError) {
        this.logger.error(`Gas Station API error: ${error.message}`);
      }
      return null;
    }
  }

  private async fetchEthGasWatchPrice(): Promise<GasPriceResponse | null> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(this.apiEndpoints.ethGasWatch),
      );

      const data = response.data;
      return {
        safeLow: data.safeLow,
        standard: data.standard,
        fast: data.fast,
        fastest: data.fastest,
        timestamp: Date.now(),
        source: 'ethgaswatch',
      };
    } catch (error) {
      if (error instanceof AxiosError) {
        this.logger.error(`Eth Gas Watch API error: ${error.message}`);
      }
      return null;
    }
  }
} 