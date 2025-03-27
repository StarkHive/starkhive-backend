import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateMessagesTable1711300661000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create messages table
    await queryRunner.query(`
      CREATE TABLE messages (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        content TEXT NOT NULL,
        sender_id UUID NOT NULL REFERENCES users(id),
        recipient_id UUID NOT NULL REFERENCES users(id),
        is_archived BOOLEAN NOT NULL DEFAULT FALSE,
        search_vector TSVECTOR,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
        deleted_at TIMESTAMP WITH TIME ZONE,
        metadata JSONB
      );
    `);

    // Create indexes for performance
    await queryRunner.query(`
      CREATE INDEX idx_messages_sender ON messages(sender_id);
      CREATE INDEX idx_messages_recipient ON messages(recipient_id);
      CREATE INDEX idx_messages_created_at ON messages(created_at);
      CREATE INDEX idx_messages_search_vector ON messages USING GIN(search_vector);
    `);

    // Create trigger for automatic search vector updates
    await queryRunner.query(`
      CREATE TRIGGER messages_vector_update
        BEFORE INSERT OR UPDATE ON messages
        FOR EACH ROW
        EXECUTE FUNCTION tsvector_update_trigger(search_vector, 'pg_catalog.english', content);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TRIGGER IF EXISTS messages_vector_update ON messages');
    await queryRunner.query('DROP INDEX IF EXISTS idx_messages_search_vector');
    await queryRunner.query('DROP INDEX IF EXISTS idx_messages_created_at');
    await queryRunner.query('DROP INDEX IF EXISTS idx_messages_recipient');
    await queryRunner.query('DROP INDEX IF EXISTS idx_messages_sender');
    await queryRunner.query('DROP TABLE IF EXISTS messages');
  }
}
