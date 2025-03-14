import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class CreateContractsAndPayments1710600000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'contract',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, generationStrategy: 'uuid', default: 'uuid_generate_v4()' },
          { name: 'terms', type: 'text' },
          { name: 'startDate', type: 'timestamp' },
          { name: 'endDate', type: 'timestamp' },
          { name: 'isCompleted', type: 'boolean', default: false },
          { name: 'status', type: 'varchar', length: '255' },
          { name: 'userId', type: 'uuid' },
          { name: 'jobPostingId', type: 'uuid' },
          { name: 'createdAt', type: 'timestamp', default: 'now()' },
          { name: 'updatedAt', type: 'timestamp', default: 'now()' },
        ],
      }),
    );

    await queryRunner.createTable(
      new Table({
        name: 'payment',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, generationStrategy: 'uuid', default: 'uuid_generate_v4()' },
          { name: 'amount', type: 'decimal', precision: 10, scale: 2 },
          { name: 'currency', type: 'varchar', length: '10' },
          { name: 'status', type: 'varchar', length: '50', default: "'pending'" },
          { name: 'transactionHash', type: 'varchar', length: '255', isNullable: true },
          { name: 'contractId', type: 'uuid' },
          { name: 'userId', type: 'uuid' },
          { name: 'createdAt', type: 'timestamp', default: 'now()' },
          { name: 'updatedAt', type: 'timestamp', default: 'now()' },
        ],
      }),
    );

    await queryRunner.createForeignKeys('contract', [
      new TableForeignKey({ columnNames: ['userId'], referencedTableName: 'user', referencedColumnNames: ['id'], onDelete: 'CASCADE' }),
      new TableForeignKey({ columnNames: ['jobPostingId'], referencedTableName: 'job_posting', referencedColumnNames: ['id'], onDelete: 'CASCADE' }),
    ]);

    await queryRunner.createForeignKeys('payment', [
      new TableForeignKey({ columnNames: ['contractId'], referencedTableName: 'contract', referencedColumnNames: ['id'], onDelete: 'CASCADE' }),
      new TableForeignKey({ columnNames: ['userId'], referencedTableName: 'user', referencedColumnNames: ['id'], onDelete: 'CASCADE' }),
    ]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('payment');
    await queryRunner.dropTable('contract');
  }
}