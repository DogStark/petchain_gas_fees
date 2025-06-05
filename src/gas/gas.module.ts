import { Module, DynamicModule } from '@nestjs/common';
import { GasAnalyticsService } from './services/gas-analytics.service';
import { StarkNetRpcProvider } from './providers/starknet-rpc.provider';
import { MockProvider } from './providers/mock.provider';
import { ProviderConfig } from './interfaces/provider-config.interface';

@Module({})
export class GasModule {
  static forRoot(providerConfig: ProviderConfig): DynamicModule {
    const provider = this.getProvider(providerConfig);
    
    return {
      module: GasModule,
      providers: [
        {
          provide: 'GAS_DATA_PROVIDER',
          useClass: provider,
        },
        GasAnalyticsService,
      ],
      exports: [GasAnalyticsService],
    };
  }

  private static getProvider(config: ProviderConfig) {
    switch(config.provider) {
      case 'mock': return MockProvider;
      default: return StarkNetRpcProvider;
    }
  }
}