import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';

export const getDatabaseConfig = (configService: ConfigService): TypeOrmModuleOptions => ({
  type: 'postgres',
  host: configService.get('DB_HOST', 'localhost'),
  port: configService.get('DB_PORT', 5432),
  username: configService.get('DB_USERNAME', 'postgres'),
  password: configService.get('DB_PASSWORD', 'password'),
  database: configService.get('DB_NAME', 'pet_gas_db'),
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  migrations: [__dirname + '/../migrations/*{.ts,.js}'],
  synchronize: configService.get('NODE_ENV') === 'development',
  logging: configService.get('NODE_ENV') === 'development',
  
  // Connection pooling configuration
  extra: {
    connectionLimit: configService.get('DB_CONNECTION_LIMIT', 10),
    acquireConnectionTimeout: 60000,
    timeout: 60000,
    reconnect: true,
    pool: {
      min: configService.get('DB_POOL_MIN', 2),
      max: configService.get('DB_POOL_MAX', 10),
      acquire: 30000,
      idle: 10000,
    },
  },
  
  // Connection retry configuration
  retryAttempts: 5,
  retryDelay: 3000,
  autoLoadEntities: true,
});
