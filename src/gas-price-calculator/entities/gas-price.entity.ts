import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum CalculationMethod {
  WEIGHT_BASED = 'weight_based',
  BREED_BASED = 'breed_based',
  ACTIVITY_BASED = 'activity_based',
  HYBRID = 'hybrid',
}

export enum NetworkType {
  ETHEREUM = 'ethereum',
  POLYGON = 'polygon',
  BSC = 'bsc',
  ARBITRUM = 'arbitrum',
}

@Entity('gas_prices')
export class GasPrice {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: NetworkType,
  })
  network: NetworkType;

  @Column('decimal', { precision: 18, scale: 8 })
  basePrice: number;

  @Column('decimal', { precision: 18, scale: 8 })
  priorityFee: number;

  @Column('decimal', { precision: 18, scale: 8 })
  maxFee: number;

  @Column({
    type: 'enum',
    enum: CalculationMethod,
    default: CalculationMethod.HYBRID,
  })
  calculationMethod: CalculationMethod;

  @Column('decimal', { precision: 18, scale: 8, nullable: true })
  weightMultiplier?: number;

  @Column('decimal', { precision: 18, scale: 8, nullable: true })
  breedMultiplier?: number;

  @Column('decimal', { precision: 18, scale: 8, nullable: true })
  activityMultiplier?: number;

  @Column('decimal', { precision: 18, scale: 8 })
  finalPrice: number;

  @Column({ type: 'jsonb', nullable: true })
  metadata: {
    blockNumber?: number;
    timestamp?: number;
    gasUsed?: number;
    baseFeePerGas?: number;
    maxPriorityFeePerGas?: number;
    maxFeePerGas?: number;
  };

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
} 