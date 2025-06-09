import { Injectable, Logger } from '@nestjs/common';
import { AnalyticsRecord, TimeSeriesData } from './entities/analytics.entity';
import { AnalyticsQueryDto, AnalyticsResponseDto, ExportOptionsDto } from './dto/analytics.dto';
import { createObjectCsvWriter } from 'csv-writer';
import * as PDFDocument from 'pdfkit';
import { Readable } from 'stream';

@Injectable()
export class AnalyticsService {
  private readonly logger = new Logger(AnalyticsService.name);
  private analyticsData: AnalyticsRecord[] = [];
  private idCounter = 1;

  // Add a new analytics record
  async addRecord(record: Omit<AnalyticsRecord, 'id'>): Promise<AnalyticsRecord> {
    const newRecord: AnalyticsRecord = {
      id: this.idCounter++,
      ...record,
    };
    this.analyticsData.push(newRecord);
    return newRecord;
  }

  // Get analytics with filtering and aggregation
  async getAnalytics(query: AnalyticsQueryDto): Promise<AnalyticsResponseDto> {
    let filteredData = this.filterData(query);
    const timeSeries = this.generateTimeSeries(filteredData, query.interval);
    const summary = this.calculateSummary(filteredData);
    const breakdown = this.generateBreakdown(filteredData, query.groupBy);

    return {
      timeSeries,
      summary,
      breakdown,
    };
  }

  // Export data to CSV or PDF
  async exportData(options: ExportOptionsDto): Promise<Buffer> {
    const filteredData = this.filterData(options.filters);

    if (options.format === 'csv') {
      return this.exportToCsv(filteredData);
    } else {
      return this.exportToPdf(filteredData);
    }
  }

  // Private helper methods
  private filterData(query: AnalyticsQueryDto): AnalyticsRecord[] {
    return this.analyticsData.filter(record => {
      if (query.startDate && record.timestamp < query.startDate) return false;
      if (query.endDate && record.timestamp > query.endDate) return false;
      if (query.breedId && record.breedId !== query.breedId) return false;
      if (query.network && record.network !== query.network) return false;
      if (query.transactionType && record.transactionType !== query.transactionType) return false;
      return true;
    });
  }

  private generateTimeSeries(
    data: AnalyticsRecord[],
    interval: 'hour' | 'day' | 'week' | 'month' = 'day',
  ): TimeSeriesData[] {
    const groupedData = new Map<string, number[]>();

    data.forEach(record => {
      const timestamp = this.roundTimestamp(record.timestamp, interval);
      const key = timestamp.toISOString();
      
      if (!groupedData.has(key)) {
        groupedData.set(key, []);
      }
      groupedData.get(key).push(record.adjustedGasPrice);
    });

    return Array.from(groupedData.entries()).map(([timestamp, values]) => ({
      timestamp: new Date(timestamp),
      value: values.reduce((a, b) => a + b, 0) / values.length,
      category: 'average',
    }));
  }

  private calculateSummary(data: AnalyticsRecord[]) {
    if (data.length === 0) {
      return {
        averageGasPrice: 0,
        totalTransactions: 0,
        uniqueBreeds: 0,
        highestGasPrice: 0,
        lowestGasPrice: 0,
      };
    }

    const gasPrices = data.map(d => d.adjustedGasPrice);
    const uniqueBreeds = new Set(data.map(d => d.breedId)).size;

    return {
      averageGasPrice: gasPrices.reduce((a, b) => a + b, 0) / gasPrices.length,
      totalTransactions: data.length,
      uniqueBreeds,
      highestGasPrice: Math.max(...gasPrices),
      lowestGasPrice: Math.min(...gasPrices),
    };
  }

  private generateBreakdown(data: AnalyticsRecord[], groupBy?: string[]) {
    if (!groupBy || groupBy.length === 0) return {};

    const breakdown: Record<string, any> = {};
    
    groupBy.forEach(field => {
      const grouped = data.reduce((acc, record) => {
        const key = record[field];
        if (!acc[key]) acc[key] = [];
        acc[key].push(record);
        return acc;
      }, {});

      breakdown[field] = Object.entries(grouped).map(([key, records]) => ({
        key,
        count: records.length,
        averageGasPrice: records.reduce((sum, r) => sum + r.adjustedGasPrice, 0) / records.length,
      }));
    });

    return breakdown;
  }

  private roundTimestamp(date: Date, interval: string): Date {
    const d = new Date(date);
    switch (interval) {
      case 'hour':
        d.setMinutes(0, 0, 0);
        break;
      case 'day':
        d.setHours(0, 0, 0, 0);
        break;
      case 'week':
        d.setDate(d.getDate() - d.getDay());
        d.setHours(0, 0, 0, 0);
        break;
      case 'month':
        d.setDate(1);
        d.setHours(0, 0, 0, 0);
        break;
    }
    return d;
  }

  private async exportToCsv(data: AnalyticsRecord[]): Promise<Buffer> {
    const csvWriter = createObjectCsvWriter({
      path: 'temp.csv',
      header: Object.keys(data[0]).map(key => ({ id: key, title: key })),
    });

    await csvWriter.writeRecords(data);
    // Read the file and return as buffer
    return Buffer.from(data.map(record => 
      Object.values(record).join(',')
    ).join('\n'));
  }

  private async exportToPdf(data: AnalyticsRecord[]): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const chunks: Buffer[] = [];
      const doc = new PDFDocument();
      
      doc.on('data', chunk => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // Add content to PDF
      doc.fontSize(16).text('Gas Fee Analytics Report', { align: 'center' });
      doc.moveDown();
      
      const summary = this.calculateSummary(data);
      doc.fontSize(12).text('Summary:');
      doc.fontSize(10).text(`Total Transactions: ${summary.totalTransactions}`);
      doc.text(`Average Gas Price: ${summary.averageGasPrice}`);
      doc.text(`Unique Breeds: ${summary.uniqueBreeds}`);
      
      doc.end();
    });
  }
} 