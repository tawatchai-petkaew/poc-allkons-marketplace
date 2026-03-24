import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCustomerNotificationConfigurationTable1638244107203
  implements MigrationInterface
{
  name = 'AddCustomerNotificationConfigurationTable1638244107203';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "customer_notification_configuration" ("id" SERIAL NOT NULL, "isEmailNotify" boolean NOT NULL DEFAULT true, "isApplicationNotify" boolean NOT NULL DEFAULT true, "isSmsNotify" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "customerId" integer, CONSTRAINT "REL_1558d899784b0467efd5488110" UNIQUE ("customerId"), CONSTRAINT "PK_01fed4a0b68e05e18db9499f825" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "customer_notification_configuration" ADD CONSTRAINT "FK_1558d899784b0467efd54881101" FOREIGN KEY ("customerId") REFERENCES "customer"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "customer_notification_configuration" DROP CONSTRAINT "FK_1558d899784b0467efd54881101"`,
    );
    await queryRunner.query(`DROP TABLE "customer_notification_configuration"`);
  }
}
