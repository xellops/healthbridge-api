import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateDepartmentsTable1792788041754 implements MigrationInterface {
  name = 'CreateDepartmentsTable1792788041754';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TYPE "public"."departments_status_enum" AS ENUM('active', 'inactive')
        `);
    await queryRunner.query(`
            CREATE TABLE "departments" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "name" character varying(100) NOT NULL,
                "description" text,
                "roleId" uuid,
                "organizationId" uuid,
                "status" "public"."departments_status_enum" NOT NULL DEFAULT 'active',
                "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                CONSTRAINT "PK_839517a681a86bb84cbcc6a1e9d" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_d8bf1d67f46a855634cca51866" ON "departments" ("roleId")
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_9c12b32b01521c1c3595a55b10" ON "departments" ("organizationId")
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_38f94d07e939713133cb6458e2" ON "departments" ("status")
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            DROP INDEX "public"."IDX_38f94d07e939713133cb6458e2"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."IDX_9c12b32b01521c1c3595a55b10"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."IDX_d8bf1d67f46a855634cca51866"
        `);
    await queryRunner.query(`
            DROP TABLE "departments"
        `);
    await queryRunner.query(`
            DROP TYPE "public"."departments_status_enum"
        `);
  }
}
