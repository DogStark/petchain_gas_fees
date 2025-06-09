import { IsEnum, IsNumber, IsOptional, IsString, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { CalculationMethod, NetworkType } from '../entities/gas-price.entity';

export class PetCharacteristicsDto {
  @ApiProperty({ example: 10.5 })
  @IsNumber()
  @Min(0)
  weight: number;

  @ApiProperty({ example: 'golden_retriever' })
  @IsString()
  breed: string;

  @ApiProperty({ example: 0.8 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  activityLevel?: number;
}

export class GasPriceCalculationDto {
  @ApiProperty({ enum: NetworkType })
  @IsEnum(NetworkType)
  network: NetworkType;

  @ApiProperty({ type: PetCharacteristicsDto })
  @ValidateNested()
  @Type(() => PetCharacteristicsDto)
  petCharacteristics: PetCharacteristicsDto;

  @ApiProperty({ enum: CalculationMethod, required: false })
  @IsEnum(CalculationMethod)
  @IsOptional()
  calculationMethod?: CalculationMethod;

  @ApiProperty({ required: false })
  @IsNumber()
  @Min(0)
  @IsOptional()
  customMultiplier?: number;
}

export class GasPriceConfigDto {
  @ApiProperty({ enum: NetworkType })
  @IsEnum(NetworkType)
  network: NetworkType;

  @ApiProperty({ enum: CalculationMethod })
  @IsEnum(CalculationMethod)
  calculationMethod: CalculationMethod;

  @ApiProperty({ required: false })
  @IsNumber()
  @Min(0)
  @IsOptional()
  weightMultiplier?: number;

  @ApiProperty({ required: false })
  @IsNumber()
  @Min(0)
  @IsOptional()
  breedMultiplier?: number;

  @ApiProperty({ required: false })
  @IsNumber()
  @Min(0)
  @IsOptional()
  activityMultiplier?: number;
}

export class GasPriceResponseDto {
  @ApiProperty()
  basePrice: number;

  @ApiProperty()
  priorityFee: number;

  @ApiProperty()
  maxFee: number;

  @ApiProperty()
  finalPrice: number;

  @ApiProperty()
  calculationMethod: CalculationMethod;

  @ApiProperty()
  network: NetworkType;

  @ApiProperty()
  timestamp: Date;
} 