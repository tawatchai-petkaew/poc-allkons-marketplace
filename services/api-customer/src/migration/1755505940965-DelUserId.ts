import {MigrationInterface, QueryRunner} from "typeorm";

export class DelUserId1755505940965 implements MigrationInterface {
    name = 'DelUserId1755505940965'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_identity_documents" DROP CONSTRAINT "FK_4d55220d33dc332b286ebb8c5cd"`);
        await queryRunner.query(`ALTER TABLE "user_identity_documents" DROP COLUMN "userId"`);
        await queryRunner.query(`ALTER TYPE "public"."user_identity_documents_document_type_enum" RENAME TO "user_identity_documents_document_type_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."user_identity_documents_document_type_enum" AS ENUM('ID_CARD_FRONT', 'ID_CARD_BACK', 'ID_CARD_WITH_PERSON', 'COPY_OF_ID_OR_PASSPORT_AUTHORIZED_PERSON', 'COPY_OF_COMPANY_REGISTRATION', 'COPY_OF_VAT_REGISTRATION', 'COPY_OF_FINANCIAL_EVIDENCE', 'COPY_OF_BANK_ACCOUNT_RECEIVING_PAYMENTS', 'PHOTO_OF_COMPANY_OR_PROJECT', 'TRADEMARK', 'POWER_OF_ATTORNEY', 'COPY_OF_ID_OR_PASSPORT_ATTORNEY_GIVER', 'OTHERS', 'COPY_OF_HOUSE_REGISTRATION_AUTHORIZED_PERSON')`);
        await queryRunner.query(`ALTER TABLE "user_identity_documents" ALTER COLUMN "document_type" TYPE "public"."user_identity_documents_document_type_enum" USING "document_type"::"text"::"public"."user_identity_documents_document_type_enum"`);
        await queryRunner.query(`DROP TYPE "public"."user_identity_documents_document_type_enum_old"`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_99cd45e19090bceec7fb50f342" ON "user_identity_documents" ("draftOrganizeId", "document_type") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."user_identity_documents_document_type_enum_old" AS ENUM('ID_CARD_BACK', 'ID_CARD_FRONT', 'ID_CARD_WITH_PERSON')`);
        await queryRunner.query(`ALTER TABLE "user_identity_documents" ALTER COLUMN "document_type" TYPE "public"."user_identity_documents_document_type_enum_old" USING "document_type"::"text"::"public"."user_identity_documents_document_type_enum_old"`);
        await queryRunner.query(`DROP TYPE "public"."user_identity_documents_document_type_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."user_identity_documents_document_type_enum_old" RENAME TO "user_identity_documents_document_type_enum"`);
        await queryRunner.query(`ALTER TABLE "user_identity_documents" ADD "userId" integer NOT NULL`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_1ade7758b1bdb54591d3274a12" ON "user_identity_documents" ("userId", "document_type") `);
        await queryRunner.query(`ALTER TABLE "user_identity_documents" ADD CONSTRAINT "FK_4d55220d33dc332b286ebb8c5cd" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
