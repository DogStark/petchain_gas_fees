import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from './config.service';
import {
  CreateConfigDto,
  UpdateConfigDto,
  ConfigQueryDto,
  ConfigVersionDto,
  ConfigBackupDto,
  ConfigRestoreDto,
} from './dto/config.dto';

@Controller('config')
export class ConfigController {
  constructor(private readonly configService: ConfigService) {}

  @Post()
  create(@Body() createConfigDto: CreateConfigDto) {
    return this.configService.create(createConfigDto);
  }

  @Get()
  findAll(@Query() query: ConfigQueryDto) {
    return this.configService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.configService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateConfigDto: UpdateConfigDto,
  ) {
    return this.configService.update(+id, updateConfigDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.configService.remove(+id);
  }

  @Get(':id/versions')
  getVersions(@Param('id') id: string) {
    return this.configService.getVersions(+id);
  }

  @Get(':id/versions/:version')
  getVersion(
    @Param('id') id: string,
    @Param('version') version: string,
  ) {
    return this.configService.getVersion(+id, +version);
  }

  @Post('backup')
  createBackup(@Body() backupDto: ConfigBackupDto) {
    return this.configService.createBackup(backupDto);
  }

  @Get('backup')
  getBackups(@Query('environment') environment?: string) {
    return this.configService.getBackups(environment);
  }

  @Post('restore')
  restoreBackup(@Body() restoreDto: ConfigRestoreDto) {
    return this.configService.restoreBackup(restoreDto);
  }

  @Get('value/:key')
  getConfigValue(
    @Param('key') key: string,
    @Query('environment') environment: string,
  ) {
    return this.configService.getConfigValue(key, environment);
  }
} 