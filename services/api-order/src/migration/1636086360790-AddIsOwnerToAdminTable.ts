import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddIsOwnerToAdminTable1636086360790 implements MigrationInterface {
  name = 'AddIsOwnerToAdminTable1636086360790';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "admin" ADD "isOwner" boolean NOT NULL DEFAULT false`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "admin" DROP COLUMN "isOwner"`);
  }
}
