export class AnalyticsQueryDto {
  startDate?: Date;
  endDate?: Date;
  breedId?: number;
  network?: string;
  transactionType?: string;
  interval?: 'hour' | 'day' | 'week' | 'month';
  groupBy?: string[];
}

export class AnalyticsResponseDto {
  timeSeries: {
    timestamp: Date;
    value: number;
    category: string;
  }[];
  summary: {
    averageGasPrice: number;
    totalTransactions: number;
    uniqueBreeds: number;
    highestGasPrice: number;
    lowestGasPrice: number;
  };
  breakdown: Record<string, any>;
}

export class ExportOptionsDto {
  format: 'csv' | 'pdf';
  filters?: AnalyticsQueryDto;
} 