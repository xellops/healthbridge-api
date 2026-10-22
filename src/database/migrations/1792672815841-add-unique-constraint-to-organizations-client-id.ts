import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUniqueConstraintToOrganizationsClientId1792672815841 implements MigrationInterface {
  name = 'AddUniqueConstraintToOrganizationsClientId1792672815841';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "organizations"
            ADD CONSTRAINT "UQ_cb045b8d0047c493822a73ef5ac" UNIQUE ("clientId")
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "organizations" DROP CONSTRAINT "UQ_cb045b8d0047c493822a73ef5ac"
        `);
  }
}
