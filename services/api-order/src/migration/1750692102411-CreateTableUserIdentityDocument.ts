import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTableUserIdentityDocument1750692102411
  implements MigrationInterface
{
  name = 'CreateTableUserIdentityDocument1750692102411';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."user_identity_documents_document_type_enum" AS ENUM('ID_CARD_FRONT', 'ID_CARD_BACK', 'ID_CARD_WITH_PERSON')`,
    );
    await queryRunner.query(
      `CREATE TABLE "user_identity_documents" ("id" SERIAL NOT NULL, "userId" integer NOT NULL, "document_type" "public"."user_identity_documents_document_type_enum" NOT NULL, "fileBase64" text NOT NULL, "fileName" character varying(255), "fileType" character varying(50), "fileSize" integer, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_90053a2d417fc3a1bbeccaf2b21" PRIMARY KEY ("id")); COMMENT ON COLUMN "user_identity_documents"."fileBase64" IS 'Base64 encoded file content'; COMMENT ON COLUMN "user_identity_documents"."fileType" IS 'MIME type of the file'; COMMENT ON COLUMN "user_identity_documents"."fileSize" IS 'File size in bytes'`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_24488104d74ab6b620b226da96" ON "user_identity_documents" ("document_type") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_4d55220d33dc332b286ebb8c5c" ON "user_identity_documents" ("userId") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_1ade7758b1bdb54591d3274a12" ON "user_identity_documents" ("userId", "document_type") `,
    );
    await queryRunner.query(
      `ALTER TABLE "user_identity_documents" ADD CONSTRAINT "FK_4d55220d33dc332b286ebb8c5cd" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user_identity_documents" DROP CONSTRAINT "FK_4d55220d33dc332b286ebb8c5cd"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_1ade7758b1bdb54591d3274a12"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_4d55220d33dc332b286ebb8c5c"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_24488104d74ab6b620b226da96"`,
    );
    await queryRunner.query(`DROP TABLE "user_identity_documents"`);
    await queryRunner.query(
      `DROP TYPE "public"."user_identity_documents_document_type_enum"`,
    );
  }
}
