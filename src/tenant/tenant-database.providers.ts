import { Provider } from '@nestjs/common';
import { DataSource, DataSourceOptions } from 'typeorm';
import { ConfigService } from '@nestjs/config';

/**
 * This is an alternative approach to create tenant-specific database connections
 * Using a factory pattern for creating connections based on tenant configuration
 */
export const tenantDatabaseProviders: Provider[] = [
  {
    provide: 'TENANT_DATA_SOURCE_FACTORY',
    useFactory: (configService: ConfigService) => {
      return async (tenantId: string): Promise<DataSource> => {
        // This is a mock implementation - in a real app, you'd fetch tenant database config
        // from a repository or service
        const defaultOptions = {
          type: 'postgres',
          host: configService.get('DB_HOST'),
          port: configService.get('DB_PORT'),
          username: configService.get('DB_USERNAME'),
          password: configService.get('DB_PASSWORD'),
          database: `${configService.get('DB_DATABASE')}_${tenantId}`,
          entities: [__dirname + '/../**/*.entity{.ts,.js}'],
          synchronize: false,
        };
        
        const dataSource = new DataSource(defaultOptions as DataSourceOptions);
        await dataSource.initialize();
        return dataSource;
      };
    },
    inject: [ConfigService],
  },
];
