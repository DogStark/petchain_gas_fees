import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { GasPriceService } from './gas-price.service';
import { GasPriceController } from './gas-price.controller';
import { CacheModule } from '@nestjs/cache-manager';

@Module({
  imports: [
    HttpModule,
    CacheModule.register({
      ttl: 60, // Cache for 60 seconds
      max: 100, // Maximum number of items in cache
    }),
  ],
  controllers: [GasPriceController],
  providers: [GasPriceService],
  exports: [GasPriceService],
})
export class GasPriceModule {} 