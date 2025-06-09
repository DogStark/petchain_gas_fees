import { Controller, Post, Body, Get, Put, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { UserRole } from '../../auth/entities/user.entity';
import { GasPriceService } from '../services/gas-price.service';
import {
  GasPriceCalculationDto,
  GasPriceConfigDto,
  GasPriceResponseDto,
} from '../dto/gas-price.dto';

@ApiTags('gas-price')
@Controller('gas-price')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class GasPriceController {
  constructor(private readonly gasPriceService: GasPriceService) {}

  @Post('calculate')
  @ApiOperation({ summary: 'Calculate gas price based on pet characteristics' })
  @ApiResponse({
    status: 200,
    description: 'Gas price calculated successfully',
    type: GasPriceResponseDto,
  })
  async calculateGasPrice(
    @Body() dto: GasPriceCalculationDto,
  ): Promise<GasPriceResponseDto> {
    return this.gasPriceService.calculateGasPrice(dto);
  }

  @Put('config')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update gas price calculation configuration' })
  @ApiResponse({
    status: 200,
    description: 'Configuration updated successfully',
  })
  async updateConfig(@Body() dto: GasPriceConfigDto): Promise<void> {
    return this.gasPriceService.updateCalculationConfig(dto);
  }

  @Get('networks')
  @ApiOperation({ summary: 'Get supported networks' })
  @ApiResponse({
    status: 200,
    description: 'List of supported networks',
  })
  async getSupportedNetworks() {
    return {
      networks: [
        { id: 'ethereum', name: 'Ethereum' },
        { id: 'polygon', name: 'Polygon' },
        { id: 'bsc', name: 'Binance Smart Chain' },
        { id: 'arbitrum', name: 'Arbitrum' },
      ],
    };
  }

  @Get('calculation-methods')
  @ApiOperation({ summary: 'Get available calculation methods' })
  @ApiResponse({
    status: 200,
    description: 'List of available calculation methods',
  })
  async getCalculationMethods() {
    return {
      methods: [
        { id: 'weight_based', name: 'Weight Based' },
        { id: 'breed_based', name: 'Breed Based' },
        { id: 'activity_based', name: 'Activity Based' },
        { id: 'hybrid', name: 'Hybrid' },
      ],
    };
  }
} 