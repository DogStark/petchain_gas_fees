import { GasFeeResponse } from '../models/gas-fee-response.model';
import { GasFeeHistory } from '../models/gas-fee-history.model';

export interface GasDataProvider {
    getCurrentFees(): Promise<GasFeeResponse>;
    getHistoricalFees(range: string): Promise<GasFeeHistory>;
  }