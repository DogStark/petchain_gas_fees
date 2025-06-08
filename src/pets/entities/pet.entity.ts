import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, DeleteDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

export enum PetStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  PENDING = 'pending',
}

export enum PetType {
  DOG = 'dog',
  CAT = 'cat',
  BIRD = 'bird',
  OTHER = 'other',
}

@Entity('pets')
export class Pet {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty({ description: 'Unique identifier for the pet' })
  id: string;

  @Column()
  @ApiProperty({ description: 'Name of the pet' })
  name: string;

  @Column({
    type: 'enum',
    enum: PetType,
    default: PetType.DOG,
  })
  @ApiProperty({ description: 'Type of pet', enum: PetType })
  type: PetType;

  @Column({
    type: 'enum',
    enum: PetStatus,
    default: PetStatus.ACTIVE,
  })
  @ApiProperty({ description: 'Current status of the pet', enum: PetStatus })
  status: PetStatus;

  @Column({ nullable: true })
  @ApiProperty({ description: 'Breed of the pet', required: false })
  breed?: string;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  @ApiProperty({ description: 'Weight of the pet in kg', required: false })
  weight?: number;

  @Column({ nullable: true })
  @ApiProperty({ description: 'Age of the pet in years', required: false })
  age?: number;

  @Column({ type: 'text', nullable: true })
  @ApiProperty({ description: 'Additional notes about the pet', required: false })
  notes?: string;

  @Column({ type: 'jsonb', nullable: true })
  @ApiProperty({ description: 'Additional metadata about the pet', required: false })
  metadata?: Record<string, any>;

  @CreateDateColumn()
  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: Date;

  @UpdateDateColumn()
  @ApiProperty({ description: 'Last update timestamp' })
  updatedAt: Date;

  @DeleteDateColumn()
  @ApiProperty({ description: 'Deletion timestamp' })
  deletedAt?: Date;
} 