import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PredictionService } from './prediction.service';
import { PredictionProcessor } from './processors/prediction.processor';
import { GasPrediction, ModelVersion, TrainingMetrics, ABTestResult } from './entities/prediction.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      GasPrediction,
      ModelVersion,
      TrainingMetrics,
      ABTestResult,
    ]),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        redis: {
          host: configService.get('REDIS_HOST', 'localhost'),
          port: configService.get('REDIS_PORT', 6379),
        },
      }),
      inject: [ConfigService],
    }),
    BullModule.registerQueue({
      name: 'prediction',
    }),
  ],
  providers: [PredictionService, PredictionProcessor],
  exports: [PredictionService],
})
export class PredictionModule {} 