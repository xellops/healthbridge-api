import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateAppNotificationsTable1792257823301 implements MigrationInterface {
  name = 'CreateAppNotificationsTable1792257823301';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "app_notifications" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "organization_id" uuid,
        "resource_id" uuid NOT NULL,
        "resource_type" character varying(32) NOT NULL,
        "title" character varying NOT NULL,
        "description" text,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_4ff08fe3c2ebf2593490403bbe0" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_fd5ce9a030d2fb90e9f7888a54" ON "app_notifications" ("organization_id")
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_4ac300356ec7c62f3a723b51ee" ON "app_notifications" ("resource_id")
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_a4441691ac2e264a33bbc55638" ON "app_notifications" ("resource_type")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."IDX_a4441691ac2e264a33bbc55638"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_4ac300356ec7c62f3a723b51ee"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_fd5ce9a030d2fb90e9f7888a54"`,
    );
    await queryRunner.query(`DROP TABLE "app_notifications"`);
  }
}
