import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSearchFields1711526423000 implements MigrationInterface {
  name = 'AddSearchFields1711526423000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create enum type for experience level
    await queryRunner.query(`
      CREATE TYPE "public"."freelancer_profile_experience_level_enum" AS ENUM (
        'entry',
        'intermediate',
        'expert'
      )
    `);

    // Add new columns
    await queryRunner.query(`
      ALTER TABLE "freelancer_profiles"
      ADD COLUMN "experienceLevel" "public"."freelancer_profile_experience_level_enum" NOT NULL DEFAULT 'entry',
      ADD COLUMN "location" text,
      ADD COLUMN "rating" decimal(3,2) NOT NULL DEFAULT 0,
      ADD COLUMN "languages" text[] NOT NULL DEFAULT '{}',
      ADD COLUMN "hourlyRate" decimal(10,2)
    `);

    // Create indexes for search optimization
    await queryRunner.query(`
      CREATE INDEX "idx_freelancer_profiles_skills" ON "freelancer_profiles" USING gin ("skills");
      CREATE INDEX "idx_freelancer_profiles_experience_level" ON "freelancer_profiles" ("experienceLevel");
      CREATE INDEX "idx_freelancer_profiles_location" ON "freelancer_profiles" ("location");
      CREATE INDEX "idx_freelancer_profiles_rating" ON "freelancer_profiles" ("rating");
      CREATE INDEX "idx_freelancer_profiles_hourly_rate" ON "freelancer_profiles" ("hourlyRate");
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes
    await queryRunner.query(`
      DROP INDEX "idx_freelancer_profiles_skills";
      DROP INDEX "idx_freelancer_profiles_experience_level";
      DROP INDEX "idx_freelancer_profiles_location";
      DROP INDEX "idx_freelancer_profiles_rating";
      DROP INDEX "idx_freelancer_profiles_hourly_rate";
    `);

    // Drop columns
    await queryRunner.query(`
      ALTER TABLE "freelancer_profiles"
      DROP COLUMN "experienceLevel",
      DROP COLUMN "location",
      DROP COLUMN "rating",
      DROP COLUMN "languages",
      DROP COLUMN "hourlyRate"
    `);

    // Drop enum type
    await queryRunner.query(`
      DROP TYPE "public"."freelancer_profile_experience_level_enum"
    `);
  }
}
