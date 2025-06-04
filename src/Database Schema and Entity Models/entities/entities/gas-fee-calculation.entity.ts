import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Pet } from './pet.entity';

export enum TransactionType {
  ADOPTION = 'adoption',
  MEDICAL = 'medical',
  FOOD = 'food',
  GROOMING = 'grooming',
  BOARDING = 'boarding',
  OTHER = 'other',
}

export enum GasCalculationStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

@Entity('gas_fee_calculations')
@Index(['petId', 'createdAt'])
@Index(['transactionType', 'status'])
@Index(['createdAt'])
@Index(['status'])
export class GasFeeCalculation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'pet_id' })
  @Index()
  petId: string;

  @Column({
    type: 'enum',
    enum: TransactionType,
    default: TransactionType.OTHER,
  })
  transactionType: TransactionType;

  @Column({ type: 'decimal', precision: 18, scale: 8 })
  baseFee: number;

  @Column({ type: 'decimal', precision: 18, scale: 8 })
  priorityFee: number;

  @Column({ type: 'decimal', precision: 18, scale: 8 })
  totalGasFee: number;

  @Column({ type: 'bigint' })
  gasLimit: string;

  @Column({ type: 'bigint' })
  gasUsed: string;

  @Column({ type: 'decimal', precision: 18, scale: 8, nullable: true })
  transactionValue: number;

  @Column({ length: 66, nullable: true })
  @Index()
  transactionHash: string;

  @Column({ length: 42, nullable: true })
  @Index()
  fromAddress: string;

  @Column({ length: 42, nullable: true })
  @Index()
  toAddress: string;

  @Column({ type: 'int', default: 1 })
  chainId: number;

  @Column({
    type: 'enum',
    enum: GasCalculationStatus,
    default: GasCalculationStatus.PENDING,
  })
  status: GasCalculationStatus;

  @Column({ type: 'text', nullable: true })
  errorMessage: string;

  @Column({ type: 'json', nullable: true })
  rawData: Record<string, any>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Column({ name: 'calculated_at', type: 'timestamp', nullable: true })
  calculatedAt: Date;

  // Foreign key relationship
  @ManyToOne(() => Pet, (pet) => pet.gasFeeCalculations, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'pet_id' })
  pet: Pet;
}