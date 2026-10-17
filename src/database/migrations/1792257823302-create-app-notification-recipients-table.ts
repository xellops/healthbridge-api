import { MigrationInterface, QueryRunner } from 'typeorm';

// Depends on users and app_notifications (foreign keys to both).
export class CreateAppNotificationRecipientsTable1792257823302 implements MigrationInterface {
  name = 'CreateAppNotificationRecipientsTable1792257823302';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "app_notification_recipients" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "user_id" uuid NOT NULL,
        "notification_id" uuid NOT NULL,
        "batch_id" uuid NOT NULL,
        "status" character varying(6) NOT NULL DEFAULT 'UNREAD',
        "read_at" TIMESTAMP WITH TIME ZONE,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_3e265f76066b1b869ac12a7041c" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_ea60153e6fdac57a6f57039685" ON "app_notification_recipients" ("user_id")
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_7c5b586ff8369642a117d16232" ON "app_notification_recipients" ("notification_id")
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_c4cd394f4bd1af6a59ffdf3c23" ON "app_notification_recipients" ("batch_id")
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_ba77a7ef3271dd42ad4468f75c" ON "app_notification_recipients" ("status")
    `);
    await queryRunner.query(`
      ALTER TABLE "app_notification_recipients"
      ADD CONSTRAINT "FK_7c5b586ff8369642a117d16232f" FOREIGN KEY ("notification_id") REFERENCES "app_notifications"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);
    await queryRunner.query(`
      ALTER TABLE "app_notification_recipients"
      ADD CONSTRAINT "FK_ea60153e6fdac57a6f570396852" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "app_notification_recipients" DROP CONSTRAINT "FK_ea60153e6fdac57a6f570396852"`,
    );
    await queryRunner.query(
      `ALTER TABLE "app_notification_recipients" DROP CONSTRAINT "FK_7c5b586ff8369642a117d16232f"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_ba77a7ef3271dd42ad4468f75c"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_c4cd394f4bd1af6a59ffdf3c23"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_7c5b586ff8369642a117d16232"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_ea60153e6fdac57a6f57039685"`,
    );
    await queryRunner.query(`DROP TABLE "app_notification_recipients"`);
  }
}
