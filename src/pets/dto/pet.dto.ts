import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEnum, IsOptional, IsNumber, Min, Max, IsObject } from 'class-validator';
import { Type } from 'class-transformer';
import { PetType, PetStatus } from '../entities/pet.entity';

export class CreatePetDto {
  @ApiProperty({ description: 'Name of the pet' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Type of pet', enum: PetType })
  @IsEnum(PetType)
  type: PetType;

  @ApiProperty({ description: 'Breed of the pet', required: false })
  @IsString()
  @IsOptional()
  breed?: string;

  @ApiProperty({ description: 'Weight of the pet in kg', required: false })
  @IsNumber()
  @Min(0)
  @Max(1000)
  @IsOptional()
  @Type(() => Number)
  weight?: number;

  @ApiProperty({ description: 'Age of the pet in years', required: false })
  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  @Type(() => Number)
  age?: number;

  @ApiProperty({ description: 'Additional notes about the pet', required: false })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiProperty({ description: 'Additional metadata about the pet', required: false })
  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;
}

export class UpdatePetDto extends CreatePetDto {
  @ApiProperty({ description: 'Current status of the pet', enum: PetStatus, required: false })
  @IsEnum(PetStatus)
  @IsOptional()
  status?: PetStatus;
}

export class PetResponseDto {
  @ApiProperty({ description: 'Unique identifier for the pet' })
  id: string;

  @ApiProperty({ description: 'Name of the pet' })
  name: string;

  @ApiProperty({ description: 'Type of pet', enum: PetType })
  type: PetType;

  @ApiProperty({ description: 'Current status of the pet', enum: PetStatus })
  status: PetStatus;

  @ApiProperty({ description: 'Breed of the pet', required: false })
  breed?: string;

  @ApiProperty({ description: 'Weight of the pet in kg', required: false })
  weight?: number;

  @ApiProperty({ description: 'Age of the pet in years', required: false })
  age?: number;

  @ApiProperty({ description: 'Additional notes about the pet', required: false })
  notes?: string;

  @ApiProperty({ description: 'Additional metadata about the pet', required: false })
  metadata?: Record<string, any>;

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  updatedAt: Date;
}

export class PetQueryDto {
  @ApiProperty({ description: 'Page number', required: false })
  @IsNumber()
  @Min(1)
  @IsOptional()
  @Type(() => Number)
  page?: number = 1;

  @ApiProperty({ description: 'Items per page', required: false })
  @IsNumber()
  @Min(1)
  @Max(100)
  @IsOptional()
  @Type(() => Number)
  limit?: number = 10;

  @ApiProperty({ description: 'Filter by pet type', enum: PetType, required: false })
  @IsEnum(PetType)
  @IsOptional()
  type?: PetType;

  @ApiProperty({ description: 'Filter by pet status', enum: PetStatus, required: false })
  @IsEnum(PetStatus)
  @IsOptional()
  status?: PetStatus;

  @ApiProperty({ description: 'Search by name or breed', required: false })
  @IsString()
  @IsOptional()
  search?: string;
} 