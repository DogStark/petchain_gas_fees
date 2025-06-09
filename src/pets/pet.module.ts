import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PetController } from './controllers/pet.controller';
import { PetService } from './services/pet.service';
import { Pet } from './entities/pet.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Pet])],
  controllers: [PetController],
  providers: [PetService],
  exports: [PetService],
})
export class PetModule {} 