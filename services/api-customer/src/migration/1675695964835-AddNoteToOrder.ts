import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddNoteToOrder1675695964835 implements MigrationInterface {
  name = 'AddNoteToOrder1675695964835';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "order" ADD "note" text`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "order" DROP COLUMN "note"`);
  }
}
