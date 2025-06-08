import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Pet } from '../entities/pet.entity';
import { CreatePetDto, UpdatePetDto, PetQueryDto } from '../dto/pet.dto';

@Injectable()
export class PetService {
  constructor(
    @InjectRepository(Pet)
    private readonly petRepository: Repository<Pet>,
  ) {}

  async create(createPetDto: CreatePetDto): Promise<Pet> {
    const pet = this.petRepository.create(createPetDto);
    return this.petRepository.save(pet);
  }

  async findAll(query: PetQueryDto): Promise<{ data: Pet[]; total: number }> {
    const { page = 1, limit = 10, type, status, search } = query;
    const skip = (page - 1) * limit;

    const queryBuilder = this.petRepository.createQueryBuilder('pet');

    if (type) {
      queryBuilder.andWhere('pet.type = :type', { type });
    }

    if (status) {
      queryBuilder.andWhere('pet.status = :status', { status });
    }

    if (search) {
      queryBuilder.andWhere(
        '(pet.name ILIKE :search OR pet.breed ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    const [data, total] = await queryBuilder
      .skip(skip)
      .take(limit)
      .orderBy('pet.createdAt', 'DESC')
      .getManyAndCount();

    return { data, total };
  }

  async findOne(id: string): Promise<Pet> {
    const pet = await this.petRepository.findOne({ where: { id } });
    if (!pet) {
      throw new NotFoundException(`Pet with ID ${id} not found`);
    }
    return pet;
  }

  async update(id: string, updatePetDto: UpdatePetDto): Promise<Pet> {
    const pet = await this.findOne(id);
    Object.assign(pet, updatePetDto);
    return this.petRepository.save(pet);
  }

  async remove(id: string): Promise<void> {
    const pet = await this.findOne(id);
    await this.petRepository.softRemove(pet);
  }
} 