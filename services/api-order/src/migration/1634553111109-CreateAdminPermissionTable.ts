import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateAdminPermissionTable1634553111109
  implements MigrationInterface
{
  name = 'CreateAdminPermissionTable1634553111109';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "admin_permission" ("id" SERIAL NOT NULL, "canAccessOverviewDashboard" boolean NOT NULL DEFAULT true, "canAccessOrderDashboard" boolean NOT NULL DEFAULT true, "canAccessViewProductManagement" boolean NOT NULL DEFAULT true, "canAccessEditProductManagement" boolean NOT NULL DEFAULT true, "canAccessManageStockManagement" boolean NOT NULL DEFAULT true, "canAccessProductCategoryManagement" boolean NOT NULL DEFAULT true, "canAccessProductBrandManagement" boolean NOT NULL DEFAULT true, "canAccessViewCustomerManagement" boolean NOT NULL DEFAULT true, "canAccessEditCustomerManagement" boolean NOT NULL DEFAULT true, "canAccessCouponManagement" boolean NOT NULL DEFAULT true, "canAccessFlashSaleManagement" boolean NOT NULL DEFAULT true, "canAccessArticleManagement" boolean NOT NULL DEFAULT true, "canAccessBannerManagement" boolean NOT NULL DEFAULT true, "canAccessFileManagerManagement" boolean NOT NULL DEFAULT true, "canAccessManageMerchantMerchantCenter" boolean NOT NULL DEFAULT true, "canAccessManageWarehouseMerchantCenter" boolean NOT NULL DEFAULT true, "canAccessManagePaymentMerchantCenter" boolean NOT NULL DEFAULT true, "canAccessManageShipmentMerchantCenter" boolean NOT NULL DEFAULT true, "canAccessManagePolicyMerchantCenter" boolean NOT NULL DEFAULT true, "canAccessManageAdminMerchantCenter" boolean NOT NULL DEFAULT true, "canAccessManageNotificationMerchantCenter" boolean NOT NULL DEFAULT true, "canAccessManageLineNotificationMerchantCenter" boolean NOT NULL DEFAULT true, "canAccessManageIntegrationExtentionMerchantCenter" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "adminId" integer, CONSTRAINT "REL_2c3905c70870f32352ca489907" UNIQUE ("adminId"), CONSTRAINT "PK_9855e5c507c4422f88efd935c25" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "admin_permission" ADD CONSTRAINT "FK_2c3905c70870f32352ca489907f" FOREIGN KEY ("adminId") REFERENCES "admin"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "admin_permission" DROP CONSTRAINT "FK_2c3905c70870f32352ca489907f"`,
    );
    await queryRunner.query(`DROP TABLE "admin_permission"`);
  }
}
