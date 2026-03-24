import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddRelationUsersMerchants1624340727983
  implements MigrationInterface
{
  name = 'AddRelationUsersMerchants1624340727983';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "user_merchants_merchant" ("userId" integer NOT NULL, "merchantId" integer NOT NULL, CONSTRAINT "PK_38eb1ac0cee52142631b0c8acb8" PRIMARY KEY ("userId", "merchantId"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_875bc9d2b01ab795b3c9bbd77d" ON "user_merchants_merchant" ("userId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_a08832429962c000f2bdfb6680" ON "user_merchants_merchant" ("merchantId") `,
    );
    await queryRunner.query(
      `ALTER TABLE "user_merchants_merchant" ADD CONSTRAINT "FK_875bc9d2b01ab795b3c9bbd77d8" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_merchants_merchant" ADD CONSTRAINT "FK_a08832429962c000f2bdfb66802" FOREIGN KEY ("merchantId") REFERENCES "merchant"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user_merchants_merchant" DROP CONSTRAINT "FK_a08832429962c000f2bdfb66802"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_merchants_merchant" DROP CONSTRAINT "FK_875bc9d2b01ab795b3c9bbd77d8"`,
    );
    await queryRunner.query(`DROP INDEX "IDX_a08832429962c000f2bdfb6680"`);
    await queryRunner.query(`DROP INDEX "IDX_875bc9d2b01ab795b3c9bbd77d"`);
    await queryRunner.query(`DROP TABLE "user_merchants_merchant"`);
  }
}
