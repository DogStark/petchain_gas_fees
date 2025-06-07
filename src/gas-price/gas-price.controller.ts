import { Controller, Get, UseInterceptors, CacheInterceptor } from '@nestjs/common';
import { GasPriceService } from './gas-price.service';

@Controller('gas-price')
@UseInterceptors(CacheInterceptor)
export class GasPriceController {
  constructor(private readonly gasPriceService: GasPriceService) {}

  @Get()
  async getGasPrice() {
    return this.gasPriceService.getGasPrice();
  }
} 