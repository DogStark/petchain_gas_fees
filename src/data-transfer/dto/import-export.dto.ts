import { IsEnum, IsOptional, IsString, IsObject } from 'class-validator';
import { ImportJobType, ExportFormat } from '../enums/import-job.enum';

export class ImportFileDto {
  @IsEnum(ImportJobType)
  type: ImportJobType;

  @IsString()
  fileName: string;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}

export class ExportRequestDto {
  @IsEnum(ExportFormat)
  format: ExportFormat;

  @IsString()
  type: string;

  @IsOptional()
  @IsObject()
  filters?: Record<string, any>;

  @IsOptional()
  @IsObject()
  options?: Record<string, any>;
}

export class ImportValidationDto {
  @IsString()
  jobId: string;

  @IsOptional()
  @IsObject()
  validationRules?: Record<string, any>;
}

export class ImportProgressDto {
  @IsString()
  jobId: string;
} 