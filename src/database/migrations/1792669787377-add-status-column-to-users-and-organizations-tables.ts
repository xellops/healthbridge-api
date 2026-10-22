import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddStatusColumnToUsersAndOrganizationsTables1792669787377 implements MigrationInterface {
  name = 'AddStatusColumnToUsersAndOrganizationsTables1792669787377';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TYPE "public"."users_status_enum" AS ENUM('active', 'inactive')
        `);
    await queryRunner.query(`
            ALTER TABLE "users"
            ADD "status" "public"."users_status_enum" NOT NULL DEFAULT 'active'
        `);
    await queryRunner.query(`
            ALTER TABLE "users"
            ADD "passwordResetRequired" boolean NOT NULL DEFAULT true
        `);
    await queryRunner.query(`
            CREATE TYPE "public"."organizations_status_enum" AS ENUM('active', 'inactive')
        `);
    await queryRunner.query(`
            ALTER TABLE "organizations"
            ADD "status" "public"."organizations_status_enum" NOT NULL DEFAULT 'inactive'
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_3676155292d72c67cd4e090514" ON "users" ("status")
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_f3770f157bd77d83ab022e92fc" ON "organizations" ("status")
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            DROP INDEX "public"."IDX_f3770f157bd77d83ab022e92fc"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."IDX_3676155292d72c67cd4e090514"
        `);
    await queryRunner.query(`
            ALTER TABLE "organizations" DROP COLUMN "status"
        `);
    await queryRunner.query(`
            DROP TYPE "public"."organizations_status_enum"
        `);
    await queryRunner.query(`
            ALTER TABLE "users" DROP COLUMN "passwordResetRequired"
        `);
    await queryRunner.query(`
            ALTER TABLE "users" DROP COLUMN "status"
        `);
    await queryRunner.query(`
            DROP TYPE "public"."users_status_enum"
        `);
  }
}
