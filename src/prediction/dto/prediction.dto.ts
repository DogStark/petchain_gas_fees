import { IsEnum, IsOptional, IsString, IsNumber, IsObject, IsArray, Min, Max } from 'class-validator';
import { ModelType, FeatureType } from '../enums/prediction.enum';

export class PredictionRequestDto {
  @IsString()
  network: string;

  @IsOptional()
  @IsObject()
  features?: Record<string, any>;

  @IsOptional()
  @IsString()
  modelVersion?: string;
}

export class ModelTrainingDto {
  @IsEnum(ModelType)
  type: ModelType;

  @IsArray()
  @IsString({ each: true })
  features: string[];

  @IsObject()
  hyperparameters: Record<string, any>;

  @IsOptional()
  @IsString()
  baseModelVersion?: string;
}

export class ABTestDto {
  @IsString()
  modelA: string;

  @IsString()
  modelB: string;

  @IsNumber()
  @Min(0)
  @Max(100)
  trafficSplit: number;

  @IsOptional()
  @IsObject()
  criteria?: Record<string, any>;
}

export class FeatureExtractionDto {
  @IsEnum(FeatureType)
  type: FeatureType;

  @IsObject()
  parameters: Record<string, any>;
}

export class ModelEvaluationDto {
  @IsString()
  modelVersion: string;

  @IsOptional()
  @IsObject()
  testData?: Record<string, any>;

  @IsOptional()
  @IsObject()
  metrics?: Record<string, any>;
} 