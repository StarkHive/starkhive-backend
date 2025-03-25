import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class CreateFreelancerProfile1700000000001 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'freelancer_profiles',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'user_id',
            type: 'uuid',
            isUnique: true,
            isNullable: false, // Ensuring referential integrity
          },
          {
            name: 'experience',
            type: 'text',
          },
          {
            name: 'skills',
            type: 'text',
            isArray: true,
            default: "'{}'::text[]", // Using PostgreSQL array syntax
          },
          {
            name: 'portfolio_links',
            type: 'text',
            isArray: true,
            default: "'{}'::text[]", // Consistency in naming and syntax
          },
          {
            name: 'created_at',
            type: 'timestamp with time zone',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamp with time zone',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
          },
        ],
        foreignKeys: [
          new TableForeignKey({
            columnNames: ['user_id'],
            referencedColumnNames: ['id'],
            referencedTableName: 'users',
            onDelete: 'CASCADE',
          }),
        ],
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop foreign key explicitly before dropping the table
    const table = await queryRunner.getTable('freelancer_profiles');
    const foreignKey = table.foreignKeys.find((fk) => fk.columnNames.includes('user_id'));
    if (foreignKey) {
      await queryRunner.dropForeignKey('freelancer_profiles', foreignKey);
    }

    await queryRunner.dropTable('freelancer_profiles');
  }
}
