import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MulterModule } from '@nestjs/platform-express';
import { DataTransferService } from './data-transfer.service';
import { ImportExportProcessor } from './processors/import-export.processor';
import { DataTransferController } from './data-transfer.controller';

@Module({
  imports: [
    ConfigModule,
    BullModule.registerQueue({
      name: 'import-export',
    }),
    MulterModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        dest: configService.get('UPLOAD_DIR', 'uploads'),
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [DataTransferController],
  providers: [DataTransferService, ImportExportProcessor],
  exports: [DataTransferService],
})
export class DataTransferModule {} 