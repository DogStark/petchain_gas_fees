import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('gas_price_history')
export class GasPriceHistory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  network: string;

  @Column('decimal', { precision: 18, scale: 8 })
  gasPrice: number;

  @Column({ nullable: true })
  petId?: string;

  @Column('decimal', { precision: 18, scale: 8, nullable: true })
  petSpecificPrice?: number;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;

  @CreateDateColumn()
  timestamp: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
} 