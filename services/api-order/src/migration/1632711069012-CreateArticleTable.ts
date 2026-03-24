import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateArticleTable1632711069012 implements MigrationInterface {
  name = 'CreateArticleTable1632711069012';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "article" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "content" text, "tag" text array, "releasedAt" TIMESTAMP NOT NULL, "isPublished" boolean NOT NULL, "titleSeo" text, "descriptionSeo" text, "urlSlug" character varying, "keywordSeo" text array, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "merchantId" integer, "imageUploadId" integer, CONSTRAINT "PK_40808690eb7b915046558c0f81b" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "article" ADD CONSTRAINT "FK_77a97b796ba7f50641433f6b92c" FOREIGN KEY ("merchantId") REFERENCES "merchant"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "article" ADD CONSTRAINT "FK_853c7db525b239899ae843b17f0" FOREIGN KEY ("imageUploadId") REFERENCES "image_upload"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "article" DROP CONSTRAINT "FK_853c7db525b239899ae843b17f0"`,
    );
    await queryRunner.query(
      `ALTER TABLE "article" DROP CONSTRAINT "FK_77a97b796ba7f50641433f6b92c"`,
    );
    await queryRunner.query(`DROP TABLE "article"`);
  }
}
