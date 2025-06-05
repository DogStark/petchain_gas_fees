import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { GasFeeCalculation } from './gas-fee-calculation.entity';

export enum PetType {
  DOG = 'dog',
  CAT = 'cat',
  BIRD = 'bird',
  FISH = 'fish',
  RABBIT = 'rabbit',
  OTHER = 'other',
}

export enum PetStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  ADOPTED = 'adopted',
  DECEASED = 'deceased',
}

@Entity('pets')
@Index(['ownerId', 'status'])
@Index(['type', 'status'])
@Index(['createdAt'])
export class Pet {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  @Index()
  name: string;

  @Column({
    type: 'enum',
    enum: PetType,
    default: PetType.OTHER,
  })
  type: PetType;

  @Column({ length: 50, nullable: true })
  breed: string;

  @Column({ type: 'int', nullable: true })
  age: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  weight: number;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: PetStatus,
    default: PetStatus.ACTIVE,
  })
  @Index()
  status: PetStatus;

  @Column({ name: 'owner_id', nullable: true })
  @Index()
  ownerId: string;

  @Column({ name: 'microchip_id', unique: true, nullable: true })
  microchipId: string;

  @Column({ type: 'json', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Self-referencing relationship for pet families
  @ManyToOne(() => Pet, (pet) => pet.children, { nullable: true })
  @JoinColumn({ name: 'parent_id' })
  parent: Pet;

  @OneToMany(() => Pet, (pet) => pet.parent)
  children: Pet[];

  // Relationship with gas fee calculations
  @OneToMany(() => GasFeeCalculation, (gasFee) => gasFee.pet)
  gasFeeCalculations: GasFeeCalculation[];
}