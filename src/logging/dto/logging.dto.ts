import { IsString, IsOptional, IsObject, IsEnum, IsDate } from 'class-validator';

export class LogQueryDto {
  @IsString()
  @IsOptional()
  level?: 'error' | 'warn' | 'info' | 'debug';

  @IsString()
  @IsOptional()
  context?: string;

  @IsString()
  @IsOptional()
  requestId?: string;

  @IsString()
  @IsOptional()
  userId?: string;

  @IsDate()
  @IsOptional()
  startDate?: Date;

  @IsDate()
  @IsOptional()
  endDate?: Date;

  @IsString()
  @IsOptional()
  search?: string;
}

export class AlertConfigDto {
  @IsString()
  name: string;

  @IsString()
  condition: string;

  @IsString()
  severity: 'critical' | 'warning' | 'info';

  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;
}

export class MetricQueryDto {
  @IsString()
  name: string;

  @IsObject()
  @IsOptional()
  labels?: Record<string, string>;

  @IsDate()
  @IsOptional()
  startTime?: Date;

  @IsDate()
  @IsOptional()
  endTime?: Date;
} 