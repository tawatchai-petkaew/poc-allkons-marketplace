import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddThemeTable1698723410089 implements MigrationInterface {
  name = 'AddThemeTable1698723410089';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "widget" ("id" SERIAL NOT NULL, "key" character varying NOT NULL, "name" character varying NOT NULL, CONSTRAINT "UQ_9e9a8507454ffcb96b4e22455df" UNIQUE ("key"), CONSTRAINT "PK_feb5fda4f8d30bbe0022f4ca804" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "theme_widget" ("id" SERIAL NOT NULL, "order" integer NOT NULL, "themeId" integer, "widgetId" integer, CONSTRAINT "PK_adff256fa56948fe6a5ca23f66f" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "theme" ("id" SERIAL NOT NULL, "key" character varying NOT NULL, "name" character varying NOT NULL, "isPublic" boolean NOT NULL DEFAULT false, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, CONSTRAINT "UQ_7b0e03a94450de6bb2114896b24" UNIQUE ("key"), CONSTRAINT "PK_c1934d0b4403bf10c1ab0c18166" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(`ALTER TABLE "merchant" ADD "themeId" integer`);
    await queryRunner.query(
      `ALTER TABLE "theme_widget" ADD CONSTRAINT "FK_eac3921d9218579a3f5694d6226" FOREIGN KEY ("themeId") REFERENCES "theme"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "theme_widget" ADD CONSTRAINT "FK_b6ad08a7d4b808da6feacf383e2" FOREIGN KEY ("widgetId") REFERENCES "widget"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "merchant" ADD CONSTRAINT "FK_0cf1a977d894be4abdef83d64fc" FOREIGN KEY ("themeId") REFERENCES "theme"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "merchant" DROP CONSTRAINT "FK_0cf1a977d894be4abdef83d64fc"`,
    );
    await queryRunner.query(
      `ALTER TABLE "theme_widget" DROP CONSTRAINT "FK_b6ad08a7d4b808da6feacf383e2"`,
    );
    await queryRunner.query(
      `ALTER TABLE "theme_widget" DROP CONSTRAINT "FK_eac3921d9218579a3f5694d6226"`,
    );
    await queryRunner.query(`ALTER TABLE "merchant" DROP COLUMN "themeId"`);
    await queryRunner.query(`DROP TABLE "theme"`);
    await queryRunner.query(`DROP TABLE "theme_widget"`);
    await queryRunner.query(`DROP TABLE "widget"`);
  }
}
