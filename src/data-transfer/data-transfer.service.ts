import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { ImportJob, ImportError, ImportValidationResult } from './entities/import-job.entity';
import { ImportJobType, ImportJobStatus, ExportFormat } from './enums/import-job.enum';
import { ImportFileDto, ExportRequestDto } from './dto/import-export.dto';
import { v4 as uuidv4 } from 'uuid';
import * as csv from 'csv-parse';
import * as ExcelJS from 'exceljs';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class DataTransferService {
  private readonly logger = new Logger(DataTransferService.name);
  private readonly uploadDir: string;

  constructor(
    private readonly configService: ConfigService,
    @InjectQueue('import-export') private readonly importExportQueue: Queue,
  ) {
    this.uploadDir = this.configService.get('UPLOAD_DIR', 'uploads');
    this.ensureUploadDirectory();
  }

  private ensureUploadDirectory() {
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  async importFile(file: Express.Multer.File, dto: ImportFileDto): Promise<ImportJob> {
    const jobId = uuidv4();
    const job: ImportJob = {
      id: jobId,
      type: dto.type,
      status: ImportJobStatus.PENDING,
      fileName: file.originalname,
      fileSize: file.size,
      totalRecords: 0,
      processedRecords: 0,
      successfulRecords: 0,
      failedRecords: 0,
      errors: [],
      metadata: dto.metadata || {},
      startedAt: new Date(),
      createdBy: 'system', // Replace with actual user ID
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Save file to upload directory
    const filePath = path.join(this.uploadDir, `${jobId}-${file.originalname}`);
    await fs.promises.writeFile(filePath, file.buffer);

    // Add job to queue
    await this.importExportQueue.add('import', {
      jobId,
      filePath,
      type: dto.type,
      metadata: dto.metadata,
    });

    return job;
  }

  async exportData(dto: ExportRequestDto): Promise<string> {
    const jobId = uuidv4();
    const exportPath = path.join(this.uploadDir, `${jobId}-export.${dto.format.toLowerCase()}`);

    // Add export job to queue
    await this.importExportQueue.add('export', {
      jobId,
      format: dto.format,
      type: dto.type,
      filters: dto.filters,
      options: dto.options,
      exportPath,
    });

    return jobId;
  }

  async validateImport(jobId: string, filePath: string): Promise<ImportValidationResult> {
    const result: ImportValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
      metadata: {},
    };

    try {
      const fileExtension = path.extname(filePath).toLowerCase();
      const records = await this.readFile(filePath, fileExtension);

      for (const [index, record] of records.entries()) {
        const validationErrors = await this.validateRecord(record, index + 1);
        if (validationErrors.length > 0) {
          result.errors.push(...validationErrors);
          result.isValid = false;
        }
      }
    } catch (error) {
      this.logger.error(`Validation failed for job ${jobId}: ${error.message}`);
      result.isValid = false;
      result.errors.push({
        row: 0,
        field: 'system',
        value: null,
        message: error.message,
        timestamp: new Date(),
      });
    }

    return result;
  }

  private async readFile(filePath: string, extension: string): Promise<any[]> {
    switch (extension) {
      case '.csv':
        return await this.readCsvFile(filePath);
      case '.json':
        return await this.readJsonFile(filePath);
      case '.xlsx':
      case '.xls':
        return await this.readExcelFile(filePath);
      default:
        throw new Error(`Unsupported file format: ${extension}`);
    }
  }

  private async readCsvFile(filePath: string): Promise<any[]> {
    return new Promise((resolve, reject) => {
      const records: any[] = [];
      fs.createReadStream(filePath)
        .pipe(csv.parse({ columns: true, skip_empty_lines: true }))
        .on('data', (data) => records.push(data))
        .on('end', () => resolve(records))
        .on('error', reject);
    });
  }

  private async readJsonFile(filePath: string): Promise<any[]> {
    const content = await fs.promises.readFile(filePath, 'utf-8');
    const data = JSON.parse(content);
    return Array.isArray(data) ? data : [data];
  }

  private async readExcelFile(filePath: string): Promise<any[]> {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(filePath);
    const worksheet = workbook.getWorksheet(1);
    const records: any[] = [];

    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return; // Skip header row
      const record: any = {};
      row.eachCell((cell, colNumber) => {
        record[worksheet.getRow(1).getCell(colNumber).value] = cell.value;
      });
      records.push(record);
    });

    return records;
  }

  private async validateRecord(record: any, rowNumber: number): Promise<ImportError[]> {
    const errors: ImportError[] = [];
    // Implement validation logic based on record type
    // This is a placeholder - implement actual validation rules
    return errors;
  }

  async getImportProgress(jobId: string): Promise<ImportJob> {
    const job = await this.importExportQueue.getJob(jobId);
    if (!job) {
      throw new Error(`Job ${jobId} not found`);
    }
    return job.data;
  }

  async rollbackImport(jobId: string): Promise<void> {
    const job = await this.importExportQueue.getJob(jobId);
    if (!job) {
      throw new Error(`Job ${jobId} not found`);
    }

    // Add rollback job to queue
    await this.importExportQueue.add('rollback', {
      jobId,
      originalJob: job.data,
    });
  }
} 