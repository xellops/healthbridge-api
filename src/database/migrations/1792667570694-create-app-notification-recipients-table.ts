import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateAppNotificationRecipientsTable1792667570694 implements MigrationInterface {
  name = 'CreateAppNotificationRecipientsTable1792667570694';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "app_notification_recipients" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "userId" uuid NOT NULL, "notificationId" uuid NOT NULL, "batchId" uuid NOT NULL, "status" character varying(6) NOT NULL DEFAULT 'UNREAD', "readAt" TIMESTAMP WITH TIME ZONE, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_3e265f76066b1b869ac12a7041c" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_6d5d64698102a571ee5caa21d1" ON "app_notification_recipients" ("userId")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_90ac69023fa1b6362c2c77c658" ON "app_notification_recipients" ("notificationId")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_5f599e8ed5db73075f62e29c5a" ON "app_notification_recipients" ("batchId")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_ba77a7ef3271dd42ad4468f75c" ON "app_notification_recipients" ("status")`,
    );
    await queryRunner.query(
      `ALTER TABLE "app_notification_recipients" ADD CONSTRAINT "FK_90ac69023fa1b6362c2c77c6580" FOREIGN KEY ("notificationId") REFERENCES "app_notifications"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "app_notification_recipients" ADD CONSTRAINT "FK_6d5d64698102a571ee5caa21d1a" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "app_notification_recipients" DROP CONSTRAINT "FK_6d5d64698102a571ee5caa21d1a"`,
    );
    await queryRunner.query(
      `ALTER TABLE "app_notification_recipients" DROP CONSTRAINT "FK_90ac69023fa1b6362c2c77c6580"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_ba77a7ef3271dd42ad4468f75c"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_5f599e8ed5db73075f62e29c5a"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_90ac69023fa1b6362c2c77c658"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_6d5d64698102a571ee5caa21d1"`,
    );
    await queryRunner.query(`DROP TABLE "app_notification_recipients"`);
  }
}
