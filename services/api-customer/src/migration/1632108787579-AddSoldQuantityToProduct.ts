import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSoldQuantityToProduct1632108787579
  implements MigrationInterface {
  name = 'AddSoldQuantityToProduct1632108787579';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "product" ADD "soldQuantity" integer NOT NULL DEFAULT '0'`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "product" DROP COLUMN "soldQuantity"`);
  }
}
