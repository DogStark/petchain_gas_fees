import { ImportJobStatus, ImportJobType } from '../enums/import-job.enum';

export class ImportJob {
  id: string;
  type: ImportJobType;
  status: ImportJobStatus;
  fileName: string;
  fileSize: number;
  totalRecords: number;
  processedRecords: number;
  successfulRecords: number;
  failedRecords: number;
  errors: ImportError[];
  metadata: Record<string, any>;
  startedAt: Date;
  completedAt?: Date;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export class ImportError {
  row: number;
  field: string;
  value: any;
  message: string;
  timestamp: Date;
}

export class ImportValidationResult {
  isValid: boolean;
  errors: ImportError[];
  warnings: ImportError[];
  metadata: Record<string, any>;
} 