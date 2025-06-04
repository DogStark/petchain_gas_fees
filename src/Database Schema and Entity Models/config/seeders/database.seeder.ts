import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Pet, PetType, PetStatus } from '../entities/pet.entity';
import { 
  GasFeeCalculation, 
  TransactionType, 
  GasCalculationStatus 
} from '../entities/gas-fee-calculation.entity';

@Injectable()
export class DatabaseSeeder {
  constructor(
    @InjectRepository(Pet)
    private petRepository: Repository<Pet>,
    @InjectRepository(GasFeeCalculation)
    private gasFeeRepository: Repository<GasFeeCalculation>,
  ) {}

  async seed() {
    console.log('Starting database seeding...');

    // Clear existing data
    await this.gasFeeRepository.delete({});
    await this.petRepository.delete({});

    // Create sample pets
    const pets = await this.createSamplePets();
    console.log(`Created ${pets.length} sample pets`);

    // Create sample gas fee calculations
    const gasFees = await this.createSampleGasFeeCalculations(pets);
    console.log(`Created ${gasFees.length} sample gas fee calculations`);

    console.log('Database seeding completed!');
  }

  private async createSamplePets(): Promise<Pet[]> {
    const petData = [
      {
        name: 'Buddy',
        type: PetType.DOG,
        breed: 'Golden Retriever',
        age: 3,
        weight: 25.5,
        description: 'Friendly and energetic dog',
        status: PetStatus.ACTIVE,
        ownerId: 'owner-123',
        microchipId: 'MC001234567890',
      },
      {
        name: 'Whiskers',
        type: PetType.CAT,
        breed: 'Persian',
        age: 2,
        weight: 4.2,
        description: 'Calm and affectionate cat',
        status: PetStatus.ACTIVE,
        ownerId: 'owner-456',
        microchipId: 'MC001234567891',
      },
      {
        name: 'Charlie',
        type: PetType.BIRD,
        breed: 'Parakeet',
        age: 1,
        weight: 0.3,
        description: 'Colorful and talkative bird',
        status: PetStatus.ADOPTED,
        ownerId: 'owner-789',
        microchipId: 'MC001234567892',
      },
      {
        name: 'Nemo',
        type: PetType.FISH,
        breed: 'Clownfish',
        age: 1,
        weight: 0.1,
        description: 'Beautiful aquarium fish',
        status: PetStatus.ACTIVE,
        ownerId: 'owner-101',
      },
    ];

    const pets: Pet[] = [];
    for (const data of petData) {
      const pet = this.petRepository.create(data);
      pets.push(await this.petRepository.save(pet));
    }

    return pets;
  }

  private async createSampleGasFeeCalculations(pets: Pet[]): Promise<GasFeeCalculation[]> {
    const gasFeeData: Partial<GasFeeCalculation>[] = [];

    pets.forEach((pet, index) => {
      // Create multiple gas fee calculations per pet
      for (let i = 0; i < 3; i++) {
        gasFeeData.push({
          petId: pet.id,
          transactionType: Object.values(TransactionType)[i % Object.values(TransactionType).length],
          baseFee: Math.random() * 0.001 + 0.001, // Random base fee
          priorityFee: Math.random() * 0.0005 + 0.0001, // Random priority fee
          totalGasFee: 0, // Will be calculated
          gasLimit: (21000 + Math.floor(Math.random() * 50000)).toString(),
          gasUsed: (18000 + Math.floor(Math.random() * 30000)).toString(),
          transactionValue: Math.random() * 1 + 0.1,
          transactionHash: `0x${Math.random().toString(16).substr(2, 64)}`,
          fromAddress: `0x${Math.random().toString(16).substr(2, 40)}`,
          toAddress: `0x${Math.random().toString(16).substr(2, 40)}`,
          chainId: 1, // Ethereum mainnet
          status: GasCalculationStatus.COMPLETED,
          calculatedAt: new Date(),
        });
      }
    });

    const gasFeeCalculations: GasFeeCalculation[] = [];
    for (const data of gasFeeData) {
      // Calculate total gas fee
      data.totalGasFee = data.baseFee + data.priorityFee;
      
      const gasFee = this.gasFeeRepository.create(data);
      gasFeeCalculations.push(await this.gasFeeRepository.save(gasFee));
    }

    return gasFeeCalculations;
  }
}
