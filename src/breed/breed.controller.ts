import { Controller, Get, Post, Body, Param, Patch, Delete, Query } from '@nestjs/common';
import { BreedService } from './breed.service';
import { CreateBreedDto, UpdateBreedDto } from './dto/breed.dto';

@Controller('breeds')
export class BreedController {
  constructor(private readonly breedService: BreedService) {}

  @Post()
  create(@Body() createBreedDto: CreateBreedDto) {
    return this.breedService.create(createBreedDto);
  }

  @Get()
  findAll() {
    return this.breedService.findAll();
  }

  @Get('stats')
  getStatistics() {
    return this.breedService.getStatistics();
  }

  @Get('classify')
  classify(@Query('name') name: string) {
    return this.breedService.classifyByName(name);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.breedService.findOne(Number(id));
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateBreedDto: UpdateBreedDto) {
    return this.breedService.update(Number(id), updateBreedDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.breedService.remove(Number(id));
  }
} 