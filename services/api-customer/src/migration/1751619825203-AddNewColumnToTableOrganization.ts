import {MigrationInterface, QueryRunner} from "typeorm";

export class AddNewColumnToTableOrganization1751619825203 implements MigrationInterface {
    name = 'AddNewColumnToTableOrganization1751619825203'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_address" ADD "organizationId" integer`);
        await queryRunner.query(`CREATE TYPE "public"."organization_type_enum" AS ENUM('HEAD_OFFICE', 'BRANCH')`);
        await queryRunner.query(`ALTER TABLE "organization" ADD "type" "public"."organization_type_enum"`);
        await queryRunner.query(`CREATE TYPE "public"."organization_businesstype_enum" AS ENUM('AGENT', 'BIXBOX', 'MDT', 'ONL', 'FAC', 'CON', 'CH')`);
        await queryRunner.query(`ALTER TABLE "organization" ADD "businessType" "public"."organization_businesstype_enum" array DEFAULT '{}'`);
        await queryRunner.query(`ALTER TABLE "organization" ADD "remarkTypeOther" character varying`);
        await queryRunner.query(`ALTER TABLE "organization" ADD "branchNumber" character varying`);
        await queryRunner.query(`ALTER TABLE "organization" ADD "mainPhoneNumber" character varying`);
        await queryRunner.query(`ALTER TABLE "organization" ADD "otherPhoneNumber" character varying`);
        await queryRunner.query(`ALTER TABLE "organization" ADD "mainEmail" character varying`);
        await queryRunner.query(`ALTER TABLE "organization" ADD "highestAuthorityName" character varying`);
        await queryRunner.query(`ALTER TABLE "organization" ADD "highestAuthorityPosition" character varying`);
        await queryRunner.query(`ALTER TABLE "organization" ADD "highestAuthorityPhoneNumber" character varying`);
        await queryRunner.query(`ALTER TABLE "organization" ADD "highestAuthorityEmail" character varying`);
        await queryRunner.query(`ALTER TABLE "organization" ADD "contactName" character varying`);
        await queryRunner.query(`ALTER TABLE "organization" ADD "contactPhoneNumber" character varying`);
        await queryRunner.query(`ALTER TABLE "organization" ADD "contactEmail" character varying`);
        await queryRunner.query(`CREATE TYPE "public"."organization_kycstatus_enum" AS ENUM('NONE', 'WAIT_FOR_APPROVE', 'REQUEST_MORE', 'APPROVE', 'REJECT')`);
        await queryRunner.query(`ALTER TABLE "organization" ADD "kycStatus" "public"."organization_kycstatus_enum" DEFAULT 'NONE'`);
        await queryRunner.query(`ALTER TABLE "organization" ADD "contactShownHighestAuthority" boolean DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "user_address" DROP CONSTRAINT "FK_1abd8badc4a127b0f357d9ecbc2"`);
        await queryRunner.query(`ALTER TABLE "user_address" ALTER COLUMN "userId" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "user_address" ADD CONSTRAINT "FK_1abd8badc4a127b0f357d9ecbc2" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_address" ADD CONSTRAINT "FK_640e370946e53d3117c038ef36a" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_address" DROP CONSTRAINT "FK_640e370946e53d3117c038ef36a"`);
        await queryRunner.query(`ALTER TABLE "user_address" DROP CONSTRAINT "FK_1abd8badc4a127b0f357d9ecbc2"`);
        await queryRunner.query(`ALTER TABLE "user_address" ALTER COLUMN "userId" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "user_address" ADD CONSTRAINT "FK_1abd8badc4a127b0f357d9ecbc2" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "organization" DROP COLUMN "contactShownHighestAuthority"`);
        await queryRunner.query(`ALTER TABLE "organization" DROP COLUMN "kycStatus"`);
        await queryRunner.query(`DROP TYPE "public"."organization_kycstatus_enum"`);
        await queryRunner.query(`ALTER TABLE "organization" DROP COLUMN "contactEmail"`);
        await queryRunner.query(`ALTER TABLE "organization" DROP COLUMN "contactPhoneNumber"`);
        await queryRunner.query(`ALTER TABLE "organization" DROP COLUMN "contactName"`);
        await queryRunner.query(`ALTER TABLE "organization" DROP COLUMN "highestAuthorityEmail"`);
        await queryRunner.query(`ALTER TABLE "organization" DROP COLUMN "highestAuthorityPhoneNumber"`);
        await queryRunner.query(`ALTER TABLE "organization" DROP COLUMN "highestAuthorityPosition"`);
        await queryRunner.query(`ALTER TABLE "organization" DROP COLUMN "highestAuthorityName"`);
        await queryRunner.query(`ALTER TABLE "organization" DROP COLUMN "mainEmail"`);
        await queryRunner.query(`ALTER TABLE "organization" DROP COLUMN "otherPhoneNumber"`);
        await queryRunner.query(`ALTER TABLE "organization" DROP COLUMN "mainPhoneNumber"`);
        await queryRunner.query(`ALTER TABLE "organization" DROP COLUMN "branchNumber"`);
        await queryRunner.query(`ALTER TABLE "organization" DROP COLUMN "remarkTypeOther"`);
        await queryRunner.query(`ALTER TABLE "organization" DROP COLUMN "businessType"`);
        await queryRunner.query(`DROP TYPE "public"."organization_businesstype_enum"`);
        await queryRunner.query(`ALTER TABLE "organization" DROP COLUMN "type"`);
        await queryRunner.query(`DROP TYPE "public"."organization_type_enum"`);
        await queryRunner.query(`ALTER TABLE "user_address" DROP COLUMN "organizationId"`);
    }

}
