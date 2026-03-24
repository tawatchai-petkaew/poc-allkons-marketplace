import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCustomerToDirectNotification1637850661682
  implements MigrationInterface {
  name = 'AddCustomerToDirectNotification1637850661682';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "direct_notification" ADD "customerId" integer`
    );
    await queryRunner.query(
      `ALTER TABLE "direct_notification" ADD CONSTRAINT "FK_e1ea7aa19a4831b1fce71899cd0" FOREIGN KEY ("customerId") REFERENCES "customer"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "direct_notification" DROP CONSTRAINT "FK_e1ea7aa19a4831b1fce71899cd0"`
    );
    await queryRunner.query(
      `ALTER TABLE "direct_notification" DROP COLUMN "customerId"`
    );
  }
}
