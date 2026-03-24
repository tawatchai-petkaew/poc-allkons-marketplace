import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddOnDeletePermanantImageUpload1640063509927
  implements MigrationInterface {
  name = 'AddOnDeletePermanantImageUpload1640063509927';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "image_upload" ADD "onDeletePermanent" boolean NOT NULL DEFAULT false`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "image_upload" DROP COLUMN "onDeletePermanent"`
    );
  }
}
