import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddIndexForCart1762760651467 implements MigrationInterface {
  name = 'AddIndexForCart1762760651467';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE INDEX "idx_cart_created_at" ON "cart_item" ("createdAt") `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."idx_cart_created_at"`);
  }
}
