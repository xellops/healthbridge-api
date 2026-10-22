import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUsersTable1792667570692 implements MigrationInterface {
  name = 'CreateUsersTable1792667570692';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."users_type_enum" AS ENUM('admin', 'staff', 'patient')`,
    );
    await queryRunner.query(
      `CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "firstName" character varying(60) NOT NULL, "lastName" character varying(60) NOT NULL, "email" character varying(80) NOT NULL, "password" character varying(255) NOT NULL, "organizationId" uuid NOT NULL, "type" "public"."users_type_enum" NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_ddfb7904324cdba38d3c73de93a" UNIQUE ("email", "organizationId"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_94e2000b5f7ee1f9c491f0f8a8" ON "users" ("type")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."IDX_94e2000b5f7ee1f9c491f0f8a8"`,
    );
    await queryRunner.query(`DROP TABLE "users"`);
    await queryRunner.query(`DROP TYPE "public"."users_type_enum"`);
  }
}
