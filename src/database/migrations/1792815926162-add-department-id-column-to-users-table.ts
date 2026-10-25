import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddDepartmentIdColumnToUsersTable1792815926162 implements MigrationInterface {
  name = 'AddDepartmentIdColumnToUsersTable1792815926162';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "users"
            ADD "departmentId" uuid
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_554d853741f2083faaa5794d2a" ON "users" ("departmentId")
        `);
    await queryRunner.query(`
            ALTER TABLE "users"
            ADD CONSTRAINT "FK_554d853741f2083faaa5794d2ae" FOREIGN KEY ("departmentId") REFERENCES "departments"("id") ON DELETE RESTRICT ON UPDATE NO ACTION
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "users" DROP CONSTRAINT "FK_554d853741f2083faaa5794d2ae"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."IDX_554d853741f2083faaa5794d2a"
        `);
    await queryRunner.query(`
            ALTER TABLE "users" DROP COLUMN "departmentId"
        `);
  }
}
