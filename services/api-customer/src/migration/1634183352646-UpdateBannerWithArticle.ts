import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateBannerWithArticle1634183352646
  implements MigrationInterface {
  name = 'UpdateBannerWithArticle1634183352646';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "banner_promotion" ADD "articleId" integer`
    );
    await queryRunner.query(
      `ALTER TABLE "banner_merchant" ADD "articleId" integer`
    );
    await queryRunner.query(
      `ALTER TABLE "banner_promotion" ADD CONSTRAINT "FK_14f6510ea82fa0cc34848866381" FOREIGN KEY ("articleId") REFERENCES "article"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "banner_merchant" ADD CONSTRAINT "FK_6e51822d4ae9c168338be89e423" FOREIGN KEY ("articleId") REFERENCES "article"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "banner_merchant" DROP CONSTRAINT "FK_6e51822d4ae9c168338be89e423"`
    );
    await queryRunner.query(
      `ALTER TABLE "banner_promotion" DROP CONSTRAINT "FK_14f6510ea82fa0cc34848866381"`
    );
    await queryRunner.query(
      `ALTER TABLE "banner_merchant" DROP COLUMN "articleId"`
    );
    await queryRunner.query(
      `ALTER TABLE "banner_promotion" DROP COLUMN "articleId"`
    );
  }
}
