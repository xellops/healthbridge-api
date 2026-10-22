import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateOrganizationsTable1792667570691 implements MigrationInterface {
  name = 'CreateOrganizationsTable1792667570691';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."organizations_ownership_enum" AS ENUM('public', 'private')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."organizations_level_enum" AS ENUM('primary', 'secondary', 'tertiary')`,
    );
    await queryRunner.query(
      `CREATE TABLE "organizations" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "clientId" character varying(100) NOT NULL, "name" character varying(100) NOT NULL, "email" character varying(80) NOT NULL, "phone" character varying(18), "ownership" "public"."organizations_ownership_enum" NOT NULL, "level" "public"."organizations_level_enum" NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_6b031fcd0863e3f6b44230163f9" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_7d42f6a56504949ea4ec867ba6" ON "organizations" ("ownership")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_51a0d77657b9149118d74f2505" ON "organizations" ("level")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."IDX_51a0d77657b9149118d74f2505"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_7d42f6a56504949ea4ec867ba6"`,
    );
    await queryRunner.query(`DROP TABLE "organizations"`);
    await queryRunner.query(`DROP TYPE "public"."organizations_level_enum"`);
    await queryRunner.query(
      `DROP TYPE "public"."organizations_ownership_enum"`,
    );
  }
}
