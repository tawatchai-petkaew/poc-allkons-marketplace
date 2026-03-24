import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateImageStructureTable1624325617752
  implements MigrationInterface {
  name = 'CreateImageStructureTable1624325617752';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "image_upload" ("id" SERIAL NOT NULL, "url" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "imageUploadFolderId" integer, CONSTRAINT "PK_12a28d518ce8893af8e6a9fbd17" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE TABLE "image_upload_folder" ("id" SERIAL NOT NULL, "name" character varying NOT NULL DEFAULT 'default', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "merchantId" integer, CONSTRAINT "PK_8929c1112add6008494a0eb6316" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `ALTER TABLE "image_upload" ADD CONSTRAINT "FK_7f4676eeb2784413b36a8453278" FOREIGN KEY ("imageUploadFolderId") REFERENCES "image_upload_folder"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "image_upload_folder" ADD CONSTRAINT "FK_65c8b22e05b1ee57d704b00c633" FOREIGN KEY ("merchantId") REFERENCES "merchant"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "image_upload_folder" DROP CONSTRAINT "FK_65c8b22e05b1ee57d704b00c633"`
    );
    await queryRunner.query(
      `ALTER TABLE "image_upload" DROP CONSTRAINT "FK_7f4676eeb2784413b36a8453278"`
    );
    await queryRunner.query(`DROP TABLE "image_upload_folder"`);
    await queryRunner.query(`DROP TABLE "image_upload"`);
  }
}
