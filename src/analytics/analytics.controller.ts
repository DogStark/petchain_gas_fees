import { Controller, Get, Post, Body, Query, Res, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { AnalyticsService } from './analytics.service';
import { AnalyticsQueryDto, ExportOptionsDto } from './dto/analytics.dto';

@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get()
  async getAnalytics(@Query() query: AnalyticsQueryDto) {
    return this.analyticsService.getAnalytics(query);
  }

  @Post('export')
  async exportData(
    @Body() options: ExportOptionsDto,
    @Res() res: Response,
  ) {
    const data = await this.analyticsService.exportData(options);
    
    res.setHeader('Content-Type', options.format === 'csv' ? 'text/csv' : 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=analytics-export.${options.format}`,
    );
    
    return res.status(HttpStatus.OK).send(data);
  }

  @Post('record')
  async addRecord(@Body() record: any) {
    return this.analyticsService.addRecord(record);
  }
} 