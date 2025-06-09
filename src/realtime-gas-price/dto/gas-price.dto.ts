import { IsString, IsNumber, IsOptional, IsDate, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GasPriceUpdateDto {
  @ApiProperty({ description: 'Network identifier (e.g., ethereum)' })
  @IsString()
  network: string;

  @ApiProperty({ description: 'Gas price in wei', required: true })
  @IsNumber()
  gasPrice: number;

  @ApiProperty({ description: 'Pet ID for pet-specific calculations', required: false })
  @IsOptional()
  @IsString()
  petId?: string;

  @ApiProperty({ description: 'Timestamp of the update' })
  @IsDate()
  timestamp: Date;

  @ApiProperty({ description: 'Source of the update (realtime/database)' })
  @IsString()
  source: 'realtime' | 'database';
}

export class GasPriceSubscriptionDto {
  @ApiProperty({ description: 'Network identifier (e.g., ethereum)' })
  @IsString()
  network: string;

  @ApiProperty({ description: 'Pet ID for pet-specific calculations', required: false })
  @IsOptional()
  @IsString()
  petId?: string;
}

export class GasPriceHistoryDto {
  @ApiProperty({ description: 'Network identifier' })
  @IsString()
  network: string;

  @ApiProperty({ description: 'Start date for history query' })
  @IsDate()
  startDate: Date;

  @ApiProperty({ description: 'End date for history query' })
  @IsDate()
  endDate: Date;

  @ApiProperty({ description: 'Pet ID for pet-specific history', required: false })
  @IsOptional()
  @IsString()
  petId?: string;
} 