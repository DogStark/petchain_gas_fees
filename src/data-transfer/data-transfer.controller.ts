import {
  Controller,
  Post,
  Get,
  UseInterceptors,
  UploadedFile,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiConsumes, ApiBody, ApiOperation } from '@nestjs/swagger';
import { DataTransferService } from './data-transfer.service';
import { ImportFileDto, ExportRequestDto, ImportValidationDto, ImportProgressDto } from './dto/import-export.dto';
import { ImportJob } from './entities/import-job.entity';

@ApiTags('Data Transfer')
@Controller('data-transfer')
export class DataTransferController {
  constructor(private readonly dataTransferService: DataTransferService) {}

  @Post('import')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
        type: {
          type: 'string',
          enum: ['PET_DATA', 'BREED_DATA', 'HEALTH_RECORDS', 'USER_DATA'],
        },
        metadata: {
          type: 'object',
          additionalProperties: true,
        },
      },
    },
  })
  @ApiOperation({ summary: 'Import data from file' })
  async importFile(
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: ImportFileDto,
  ): Promise<ImportJob> {
    return this.dataTransferService.importFile(file, dto);
  }

  @Post('export')
  @ApiOperation({ summary: 'Export data to file' })
  async exportData(@Body() dto: ExportRequestDto): Promise<{ jobId: string }> {
    const jobId = await this.dataTransferService.exportData(dto);
    return { jobId };
  }

  @Post('validate')
  @ApiOperation({ summary: 'Validate import file' })
  async validateImport(@Body() dto: ImportValidationDto) {
    return this.dataTransferService.validateImport(dto.jobId, dto.validationRules);
  }

  @Get('progress/:jobId')
  @ApiOperation({ summary: 'Get import/export job progress' })
  async getProgress(@Param('jobId') jobId: string): Promise<ImportJob> {
    return this.dataTransferService.getImportProgress(jobId);
  }

  @Post('rollback/:jobId')
  @ApiOperation({ summary: 'Rollback failed import' })
  async rollbackImport(@Param('jobId') jobId: string): Promise<void> {
    await this.dataTransferService.rollbackImport(jobId);
  }
} 