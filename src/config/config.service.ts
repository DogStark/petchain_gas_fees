import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigEntry, ConfigVersion, ConfigBackup } from './entities/config.entity';
import {
  CreateConfigDto,
  UpdateConfigDto,
  ConfigQueryDto,
  ConfigVersionDto,
  ConfigBackupDto,
  ConfigRestoreDto,
} from './dto/config.dto';

@Injectable()
export class ConfigService {
  private readonly logger = new Logger(ConfigService.name);
  private configs: ConfigEntry[] = [];
  private versions: ConfigVersion[] = [];
  private backups: ConfigBackup[] = [];
  private idCounter = 1;
  private versionCounter = 1;
  private backupCounter = 1;

  // CRUD Operations
  async create(createConfigDto: CreateConfigDto, user?: string): Promise<ConfigEntry> {
    const config: ConfigEntry = {
      id: this.idCounter++,
      version: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: user,
      updatedBy: user,
      ...createConfigDto,
    };

    this.configs.push(config);
    this.createVersion(config, user);
    return config;
  }

  async findAll(query: ConfigQueryDto): Promise<ConfigEntry[]> {
    return this.configs.filter(config => {
      if (query.environment && config.environment !== query.environment) return false;
      if (query.key && config.key !== query.key) return false;
      return true;
    });
  }

  async findOne(id: number): Promise<ConfigEntry> {
    const config = this.configs.find(c => c.id === id);
    if (!config) throw new NotFoundException('Config not found');
    return config;
  }

  async update(id: number, updateConfigDto: UpdateConfigDto, user?: string): Promise<ConfigEntry> {
    const config = await this.findOne(id);
    const newVersion = config.version + 1;

    Object.assign(config, {
      ...updateConfigDto,
      version: newVersion,
      updatedAt: new Date(),
      updatedBy: user,
    });

    this.createVersion(config, user, updateConfigDto.comment);
    return config;
  }

  async remove(id: number): Promise<void> {
    const index = this.configs.findIndex(c => c.id === id);
    if (index === -1) throw new NotFoundException('Config not found');
    this.configs.splice(index, 1);
  }

  // Version Management
  private createVersion(config: ConfigEntry, user?: string, comment?: string): ConfigVersion {
    const version: ConfigVersion = {
      id: this.versionCounter++,
      configId: config.id,
      version: config.version,
      value: config.value,
      createdAt: new Date(),
      createdBy: user,
      comment,
    };
    this.versions.push(version);
    return version;
  }

  async getVersions(configId: number): Promise<ConfigVersion[]> {
    return this.versions.filter(v => v.configId === configId);
  }

  async getVersion(configId: number, version: number): Promise<ConfigVersion> {
    const configVersion = this.versions.find(
      v => v.configId === configId && v.version === version,
    );
    if (!configVersion) throw new NotFoundException('Config version not found');
    return configVersion;
  }

  // Backup and Restore
  async createBackup(backupDto: ConfigBackupDto, user?: string): Promise<ConfigBackup> {
    const configs = this.configs.filter(c => c.environment === backupDto.environment);
    const backup: ConfigBackup = {
      id: this.backupCounter++,
      timestamp: new Date(),
      configs,
      createdBy: user,
      ...backupDto,
    };
    this.backups.push(backup);
    return backup;
  }

  async getBackups(environment?: string): Promise<ConfigBackup[]> {
    return this.backups.filter(b => !environment || b.environment === environment);
  }

  async restoreBackup(restoreDto: ConfigRestoreDto): Promise<void> {
    const backup = this.backups.find(b => b.id === restoreDto.backupId);
    if (!backup) throw new NotFoundException('Backup not found');

    // Remove existing configs for the environment
    this.configs = this.configs.filter(c => c.environment !== backup.environment);

    // Restore configs from backup
    this.configs.push(...backup.configs);
  }

  // Utility Methods
  async getConfigValue(key: string, environment: string): Promise<any> {
    const config = this.configs.find(c => c.key === key && c.environment === environment);
    if (!config) throw new NotFoundException(`Config not found for key: ${key}`);
    return config.value;
  }

  async validateConfig(key: string, value: any): Promise<boolean> {
    // Implement your validation logic here
    // This could include schema validation, type checking, etc.
    return true;
  }
} 