import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUsersTable1792257823300 implements MigrationInterface {
  name = 'CreateUsersTable1792257823300';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE "public"."users_type_enum" AS ENUM('staff', 'patient')
    `);
    await queryRunner.query(`
      CREATE TABLE "users" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "email" character varying(100) NOT NULL,
        "password" character varying(255) NOT NULL,
        "type" "public"."users_type_enum" NOT NULL,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(`
      CREATE UNIQUE INDEX "IDX_97672ac88f789774dd47f7c8be" ON "users" ("email")
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_94e2000b5f7ee1f9c491f0f8a8" ON "users" ("type")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."IDX_94e2000b5f7ee1f9c491f0f8a8"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_97672ac88f789774dd47f7c8be"`,
    );
    await queryRunner.query(`DROP TABLE "users"`);
    await queryRunner.query(`DROP TYPE "public"."users_type_enum"`);
  }
}
