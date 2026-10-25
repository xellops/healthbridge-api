import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateBranchesTable1792817383107 implements MigrationInterface {
  name = 'CreateBranchesTable1792817383107';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE "branches" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "organizationId" uuid NOT NULL,
                "name" character varying(100) NOT NULL,
                "address" character varying(255) NOT NULL,
                "phoneNumber" character varying(18) NOT NULL,
                "email" character varying(80),
                "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                CONSTRAINT "PK_7f37d3b42defea97f1df0d19535" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_50d4200557c21103ae29b7985a" ON "branches" ("organizationId")
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            DROP INDEX "public"."IDX_50d4200557c21103ae29b7985a"
        `);
    await queryRunner.query(`
            DROP TABLE "branches"
        `);
  }
}
