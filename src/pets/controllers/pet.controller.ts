import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  Query,
  HttpStatus,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { PetService } from '../services/pet.service';
import {
  CreatePetDto,
  UpdatePetDto,
  PetResponseDto,
  PetQueryDto,
} from '../dto/pet.dto';

@ApiTags('pets')
@Controller('pets')
export class PetController {
  constructor(private readonly petService: PetService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new pet' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'The pet has been successfully created.',
    type: PetResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data.',
  })
  async create(@Body() createPetDto: CreatePetDto): Promise<PetResponseDto> {
    return this.petService.create(createPetDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all pets with pagination and filtering' })
  @ApiQuery({ type: PetQueryDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of pets retrieved successfully.',
    type: [PetResponseDto],
  })
  async findAll(@Query() query: PetQueryDto) {
    return this.petService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a pet by ID' })
  @ApiParam({ name: 'id', description: 'Pet ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'The pet has been successfully retrieved.',
    type: PetResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Pet not found.',
  })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<PetResponseDto> {
    return this.petService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a pet' })
  @ApiParam({ name: 'id', description: 'Pet ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'The pet has been successfully updated.',
    type: PetResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Pet not found.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data.',
  })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updatePetDto: UpdatePetDto,
  ): Promise<PetResponseDto> {
    return this.petService.update(id, updatePetDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a pet' })
  @ApiParam({ name: 'id', description: 'Pet ID' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'The pet has been successfully deleted.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Pet not found.',
  })
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.petService.remove(id);
  }
} 