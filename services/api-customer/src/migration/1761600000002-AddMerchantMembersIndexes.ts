import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddMerchantMembersIndexes1761600000002 implements MigrationInterface {
  name = 'AddMerchantMembersIndexes1761600000002';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_user_merchants_merchant_id" 
       ON "user_merchants_merchant"("merchantId")`
    )
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_user_merchants_user_id" 
       ON "user_merchants_merchant"("userId")`
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_user_merchants_role_id" 
       ON "user_merchants_merchant"("roleId")`
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_user_merchants_merchant_user" 
       ON "user_merchants_merchant"("merchantId", "userId")`
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_user_merchants_created_at" 
       ON "user_merchants_merchant"("createdAt" DESC)`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    console.log('Dropping merchant members indexes...');
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_user_merchants_created_at"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_user_merchants_merchant_user"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_user_merchants_role_id"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_user_merchants_user_id"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_user_merchants_merchant_id"`);

    console.log('✅ All junction table indexes dropped!');
  }
}