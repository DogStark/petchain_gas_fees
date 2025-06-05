import { GasDataProvider } from '../interfaces/gas-data-provider.interface';

@Injectable()
export class GasAnalyticsService {
  constructor(
    @Inject('GAS_DATA_PROVIDER') 
    private readonly provider: GasDataProvider
  ) {}

  async getCurrentFees() {
    return this.provider.getCurrentFees();
  }
}

function Injectable(): (target: typeof GasAnalyticsService) => void {
    return function (target: typeof GasAnalyticsService): void {
        // This is a placeholder implementation for the Injectable decorator.
        // register the class with a dependency injection container.
        console.log(`Injectable decorator applied to: ${target.name}`);
    };
}