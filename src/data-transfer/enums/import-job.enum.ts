export enum ImportJobType {
  PET_DATA = 'PET_DATA',
  BREED_DATA = 'BREED_DATA',
  HEALTH_RECORDS = 'HEALTH_RECORDS',
  USER_DATA = 'USER_DATA',
}

export enum ImportJobStatus {
  PENDING = 'PENDING',
  VALIDATING = 'VALIDATING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  ROLLED_BACK = 'ROLLED_BACK',
}

export enum ExportFormat {
  CSV = 'CSV',
  JSON = 'JSON',
  EXCEL = 'EXCEL',
  PDF = 'PDF',
} 