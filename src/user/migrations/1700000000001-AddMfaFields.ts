import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddMfaFields1700000000001 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumns('users', [
      new TableColumn({
        name: 'mfaEnabled',
        type: 'boolean',
        default: false,
      }),
      new TableColumn({
        name: 'mfaSecret',
        type: 'varchar',
        isNullable: true,
      }),
    ]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('users', 'mfaEnabled');
    await queryRunner.dropColumn('users', 'mfaSecret');
  }
} 