import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateTenantTable1684140000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'tenants',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
          },
          {
            name: 'identifier',
            type: 'varchar',
            isUnique: true,
          },
          {
            name: 'name',
            type: 'varchar',
          },
          {
            name: 'subdomain',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'is_active',
            type: 'boolean',
            default: true,
          },
          {
            name: 'settings',
            type: 'jsonb',
            default: '{}',
          },
          {
            name: 'schema_name',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'database_url',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'uses_separate_database',
            type: 'boolean',
            default: false,
          },
          {
            name: 'table_prefix',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'logo_url',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'primary_color',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'now()',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'now()',
          },
        ],
      }),
      true,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('tenants');
  }
}