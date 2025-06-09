import { Injectable, NotFoundException } from '@nestjs/common';
import { Breed } from './entities/breed.entity';
import { CreateBreedDto, UpdateBreedDto } from './dto/breed.dto';

@Injectable()
export class BreedService {
  private breeds: Breed[] = [];
  private idCounter = 1;

  create(createBreedDto: CreateBreedDto): Breed {
    const breed: Breed = {
      id: this.idCounter++,
      ...createBreedDto,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.breeds.push(breed);
    return breed;
  }

  findAll(): Breed[] {
    return this.breeds;
  }

  findOne(id: number): Breed {
    const breed = this.breeds.find((b) => b.id === id);
    if (!breed) throw new NotFoundException('Breed not found');
    return breed;
  }

  update(id: number, updateBreedDto: UpdateBreedDto): Breed {
    const breed = this.findOne(id);
    Object.assign(breed, updateBreedDto, { updatedAt: new Date() });
    return breed;
  }

  remove(id: number): void {
    const index = this.breeds.findIndex((b) => b.id === id);
    if (index === -1) throw new NotFoundException('Breed not found');
    this.breeds.splice(index, 1);
  }

  classifyByName(name: string): Breed | null {
    return this.breeds.find((b) => b.name.toLowerCase() === name.toLowerCase()) || null;
  }

  getModifierForBreed(name: string): number {
    const breed = this.classifyByName(name);
    return breed ? breed.gasModifier : 1;
  }

  getStatistics() {
    const total = this.breeds.length;
    const bySpecies = this.breeds.reduce((acc, b) => {
      acc[b.species] = (acc[b.species] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const avgModifier =
      total > 0 ? this.breeds.reduce((sum, b) => sum + b.gasModifier, 0) / total : 0;
    return { total, bySpecies, avgModifier };
  }
} 