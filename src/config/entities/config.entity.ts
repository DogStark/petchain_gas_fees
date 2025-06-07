export class ConfigEntry {
  id: number;
  key: string;
  value: any;
  version: number;
  environment: string;
  description?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string;
  updatedBy?: string;
}

export class ConfigVersion {
  id: number;
  configId: number;
  version: number;
  value: any;
  createdAt: Date;
  createdBy?: string;
  comment?: string;
}

export class ConfigBackup {
  id: number;
  timestamp: Date;
  environment: string;
  configs: ConfigEntry[];
  metadata?: Record<string, any>;
  createdBy?: string;
} 