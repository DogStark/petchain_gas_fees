export class AnalyticsRecord {
  id: number;
  timestamp: Date;
  gasPrice: number;
  breedId?: number;
  breedName?: string;
  gasModifier: number;
  adjustedGasPrice: number;
  transactionType: string;
  network: string;
  metadata: Record<string, any>;
}

export class TimeSeriesData {
  timestamp: Date;
  value: number;
  category: string;
} 