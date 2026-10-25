import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateBranchServicesTable1792819608285 implements MigrationInterface {
  name = 'CreateBranchServicesTable1792819608285';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TYPE "public"."branch_services_status_enum" AS ENUM('active', 'inactive')
        `);
    await queryRunner.query(`
            CREATE TABLE "branch_services" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "organizationId" uuid NOT NULL,
                "branchId" uuid NOT NULL,
                "serviceId" uuid NOT NULL,
                "price" numeric(12, 2) NOT NULL,
                "status" "public"."branch_services_status_enum" NOT NULL DEFAULT 'active',
                "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                CONSTRAINT "UQ_d8afe60ec1c72eb3c60607f75c1" UNIQUE ("branchId", "serviceId"),
                CONSTRAINT "PK_8fc6b76c8682d0241a9baac878a" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_14038c5c99d8dc05f253ea468f" ON "branch_services" ("organizationId")
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_162b14b5d05c0698b6a12c6fff" ON "branch_services" ("serviceId")
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_5d645789e265d663d68d03b62c" ON "branch_services" ("status")
        `);
    await queryRunner.query(`
            ALTER TABLE "branch_services"
            ADD CONSTRAINT "FK_0d09eb026d1cafd3e5177d8deba" FOREIGN KEY ("branchId") REFERENCES "branches"("id") ON DELETE RESTRICT ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "branch_services"
            ADD CONSTRAINT "FK_162b14b5d05c0698b6a12c6fff6" FOREIGN KEY ("serviceId") REFERENCES "services"("id") ON DELETE RESTRICT ON UPDATE NO ACTION
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "branch_services" DROP CONSTRAINT "FK_162b14b5d05c0698b6a12c6fff6"
        `);
    await queryRunner.query(`
            ALTER TABLE "branch_services" DROP CONSTRAINT "FK_0d09eb026d1cafd3e5177d8deba"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."IDX_5d645789e265d663d68d03b62c"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."IDX_162b14b5d05c0698b6a12c6fff"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."IDX_14038c5c99d8dc05f253ea468f"
        `);
    await queryRunner.query(`
            DROP TABLE "branch_services"
        `);
    await queryRunner.query(`
            DROP TYPE "public"."branch_services_status_enum"
        `);
  }
}
