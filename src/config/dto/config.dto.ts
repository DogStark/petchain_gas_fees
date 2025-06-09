import { IsString, IsNumber, IsOptional, IsObject, IsEnum } from 'class-validator';

export class CreateConfigDto {
  @IsString()
  key: string;

  @IsObject()
  value: any;

  @IsString()
  environment: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;
}

export class UpdateConfigDto {
  @IsObject()
  value: any;

  @IsString()
  @IsOptional()
  description?: string;

  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;

  @IsString()
  @IsOptional()
  comment?: string;
}

export class ConfigQueryDto {
  @IsString()
  @IsOptional()
  environment?: string;

  @IsString()
  @IsOptional()
  key?: string;
}

export class ConfigVersionDto {
  @IsNumber()
  version: number;

  @IsString()
  @IsOptional()
  comment?: string;
}

export class ConfigBackupDto {
  @IsString()
  environment: string;

  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;
}

export class ConfigRestoreDto {
  @IsNumber()
  backupId: number;
} 