import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateAppNotificationsTable1792667570693 implements MigrationInterface {
  name = 'CreateAppNotificationsTable1792667570693';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "app_notifications" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "organizationId" uuid, "resourceId" uuid NOT NULL, "resourceType" character varying(32) NOT NULL, "title" character varying NOT NULL, "description" text, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_4ff08fe3c2ebf2593490403bbe0" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_a056c90815c20648fe9c65ae20" ON "app_notifications" ("organizationId")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_49ff25725fe7a9c994fff6b7dc" ON "app_notifications" ("resourceId")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_04cdc3268645bc9d03a816b355" ON "app_notifications" ("resourceType")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."IDX_04cdc3268645bc9d03a816b355"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_49ff25725fe7a9c994fff6b7dc"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_a056c90815c20648fe9c65ae20"`,
    );
    await queryRunner.query(`DROP TABLE "app_notifications"`);
  }
}
