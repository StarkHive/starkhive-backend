import { PartialType } from '@nestjs/mapped-types';
import { CreateTenantDto } from './create-tenant.dto';

export class UpdateTenantDto extends PartialType(CreateTenantDto) {}

// src/tenant/tenant.service.ts
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, EntityManager } from 'typeorm';
import { Tenant } from './entities/tenant.entity';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class TenantService {
  private readonly logger = new Logger(TenantService.name);
  private tenantSchemaMap: Map<string, boolean> = new Map();

  constructor(
    @InjectRepository(Tenant)
    private tenantRepository: Repository<Tenant>,
    private dataSource: DataSource,
    private configService: ConfigService,
  ) {}

  async onModuleInit() {
    // Initialize tenant schemas on application start
    const tenants = await this.tenantRepository.find();
    for (const tenant of tenants) {
      if (tenant.schemaName) {
        await this.ensureTenantSchema(tenant.schemaName);
        this.tenantSchemaMap.set(tenant.schemaName, true);
      }
    }
  }

  async create(createTenantDto: CreateTenantDto): Promise<Tenant> {
    const tenant = this.tenantRepository.create(createTenantDto);
    
    // If schema name is provided, ensure it exists
    if (tenant.schemaName) {
      await this.ensureTenantSchema(tenant.schemaName);
      this.tenantSchemaMap.set(tenant.schemaName, true);
    }
    
    return this.tenantRepository.save(tenant);
  }

  async findAll(): Promise<Tenant[]> {
    return this.tenantRepository.find();
  }

  async findOne(id: string): Promise<Tenant> {
    const tenant = await this.tenantRepository.findOne({ where: { id } });
    if (!tenant) {
      throw new NotFoundException(`Tenant with ID ${id} not found`);
    }
    return tenant;
  }

  async findByIdentifier(identifier: string): Promise<Tenant> {
    const tenant = await this.tenantRepository.findOne({ where: { identifier } });
    if (!tenant) {
      throw new NotFoundException(`Tenant with identifier ${identifier} not found`);
    }
    return tenant;
  }

  async findBySubdomain(subdomain: string): Promise<Tenant> {
    const tenant = await this.tenantRepository.findOne({ where: { subdomain } });
    if (!tenant) {
      throw new NotFoundException(`Tenant with subdomain ${subdomain} not found`);
    }
    return tenant;
  }

  async update(id: string, updateTenantDto: UpdateTenantDto): Promise<Tenant> {
    const tenant = await this.findOne(id);
    const updatedTenant = { ...tenant, ...updateTenantDto };
    
    // If schema name is updated, ensure it exists
    if (updateTenantDto.schemaName && updateTenantDto.schemaName !== tenant.schemaName) {
      await this.ensureTenantSchema(updateTenantDto.schemaName);
      this.tenantSchemaMap.set(updateTenantDto.schemaName, true);
    }
    
    return this.tenantRepository.save(updatedTenant);
  }

  async remove(id: string): Promise<void> {
    const tenant = await this.findOne(id);
    await this.tenantRepository.remove(tenant);
  }

  async ensureTenantSchema(schemaName: string): Promise<void> {
    // Skip if schema already exists in our cache
    if (this.tenantSchemaMap.has(schemaName)) {
      return;
    }

    try {
      // Create schema if it doesn't exist
      await this.dataSource.query(`CREATE SCHEMA IF NOT EXISTS "${schemaName}"`);
      this.logger.log(`Ensured schema exists: ${schemaName}`);
      
      // Run migrations for tenant schema
      // This is a simplified version - you might want to use a more structured approach
      const entities = this.dataSource.options.entities || [];
      for (const entity of entities) {
        if (typeof entity === 'function') {
          const metadata = this.dataSource.getMetadata(entity);
          if (metadata.schema !== 'public' && metadata.schema !== schemaName) {
            // Skip entities that belong to other schemas
            continue;
          }
          
          const tableName = metadata.tableName;
          const schemaTableName = `${schemaName}.${tableName}`;
          
          // Check if table exists in schema
          const tableExists = await this.dataSource.query(`
            SELECT EXISTS (
              SELECT FROM information_schema.tables 
              WHERE table_schema = '${schemaName}'
              AND table_name = '${tableName}'
            );
          `);
          
          if (!tableExists[0].exists) {
            this.logger.log(`Creating table ${schemaTableName}`);
            // Create table in tenant schema - this is a simple approach
            // In a real-world scenario, you'd want to use TypeORM migrations
            await this.dataSource.query(`
              CREATE TABLE ${schemaTableName} (
                LIKE public.${tableName} INCLUDING ALL
              );
            `);
          }
        }
      }
      
      this.tenantSchemaMap.set(schemaName, true);
    } catch (error) {
      this.logger.error(`Failed to ensure schema for tenant: ${schemaName}`, error.stack);
      throw error;
    }
  }

  /**
   * Get EntityManager for specific tenant
   * This is used to perform database operations in the context of a specific tenant
   */
  getEntityManagerForTenant(tenant: Tenant): EntityManager {
    const manager = this.dataSource.createEntityManager();
    
    if (tenant.schemaName) {
      // If using schema-based isolation, set the schema for this transaction
      // Note: This works for PostgreSQL
      manager.query(`SET search_path TO "${tenant.schemaName}"`);
    }
    
    return manager;
  }

  /**
   * Get the table name for an entity in the context of a tenant
   * This is useful when using table prefix strategy
   */
  getTenantTableName(entityName: string, tenant: Tenant): string {
    if (tenant.tablePrefix) {
      return `${tenant.tablePrefix}_${entityName}`;
    }
    return entityName;
  }

  /**
   * Creates a connection options object that can be used to create a tenant-specific connection
   * This is useful when using separate database strategy
   */
  getTenantConnectionOptions(tenant: Tenant) {
    if (tenant.usesSeparateDatabase && tenant.databaseUrl) {
      // Return configuration for separate database
      return {
        url: tenant.databaseUrl,
        // Copy other connection options from main connection
        type: this.dataSource.options.type,
        entities: this.dataSource.options.entities,
        synchronize: false, // Always be careful with synchronize in production
      };
    }
    
    // If not using separate database, return null
    return null;
  }
}