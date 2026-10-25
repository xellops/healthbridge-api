import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateServicesTable1792819608284 implements MigrationInterface {
  name = 'CreateServicesTable1792819608284';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TYPE "public"."services_status_enum" AS ENUM('active', 'inactive')
        `);
    await queryRunner.query(`
            CREATE TABLE "services" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "organizationId" uuid,
                "isSystemGenerated" boolean NOT NULL DEFAULT false,
                "name" character varying(100) NOT NULL,
                "description" text,
                "status" "public"."services_status_enum" NOT NULL DEFAULT 'active',
                "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                CONSTRAINT "CHK_46e38eda983a4826d15f7ac4aa" CHECK (
                    (
                        "isSystemGenerated"
                        AND "organizationId" IS NULL
                    )
                    OR (
                        NOT "isSystemGenerated"
                        AND "organizationId" IS NOT NULL
                    )
                ),
                CONSTRAINT "PK_ba2d347a3168a296416c6c5ccb2" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_e8e52dffc3bcbf5d3a90364c7c" ON "services" ("organizationId")
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_2cccf82456cd1ddc4fb64960e5" ON "services" ("isSystemGenerated")
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_8acaf7b489ffd8187b5cdd504c" ON "services" ("status")
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            DROP INDEX "public"."IDX_8acaf7b489ffd8187b5cdd504c"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."IDX_2cccf82456cd1ddc4fb64960e5"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."IDX_e8e52dffc3bcbf5d3a90364c7c"
        `);
    await queryRunner.query(`
            DROP TABLE "services"
        `);
    await queryRunner.query(`
            DROP TYPE "public"."services_status_enum"
        `);
  }
}
