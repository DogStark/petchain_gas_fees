import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { CacheModule } from '@nestjs/cache-manager';
import { GasPriceService } from './services/gas-price.service';
import { GasPriceController } from './controllers/gas-price.controller';
import { GasPrice } from './entities/gas-price.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([GasPrice]),
    ConfigModule,
    CacheModule.register({
      ttl: 60, // 1 minute cache TTL
      max: 100, // Maximum number of items in cache
    }),
  ],
  controllers: [GasPriceController],
  providers: [GasPriceService],
  exports: [GasPriceService],
})
export class GasPriceModule {} 