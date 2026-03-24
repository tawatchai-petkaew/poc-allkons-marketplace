import {MigrationInterface, QueryRunner} from "typeorm";

export class DocType1761558187291 implements MigrationInterface {
    name = 'DocType1761558187291'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TYPE "public"."user_identity_documents_document_type_enum" RENAME TO "user_identity_documents_document_type_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."user_identity_documents_document_type_enum" AS ENUM('ID_CARD_FRONT', 'ID_CARD_BACK', 'ID_CARD_WITH_PERSON', 'COPY_OF_ID_OR_PASSPORT_AUTHORIZED_PERSON', 'COPY_OF_COMPANY_REGISTRATION', 'COPY_OF_VAT_REGISTRATION', 'COPY_OF_FINANCIAL_EVIDENCE', 'COPY_OF_BANK_ACCOUNT_RECEIVING_PAYMENTS', 'PHOTO_OF_COMPANY_OR_PROJECT', 'TRADEMARK', 'POWER_OF_ATTORNEY', 'COPY_OF_ID_OR_PASSPORT_ATTORNEY_GIVER', 'OTHERS', 'COPY_OF_HOUSE_REGISTRATION_AUTHORIZED_PERSON', 'COMMERCIALLY_REGISTERED')`);
        await queryRunner.query(`ALTER TABLE "user_identity_documents" ALTER COLUMN "document_type" TYPE "public"."user_identity_documents_document_type_enum" USING "document_type"::"text"::"public"."user_identity_documents_document_type_enum"`);
        await queryRunner.query(`DROP TYPE "public"."user_identity_documents_document_type_enum_old"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."user_identity_documents_document_type_enum_old" AS ENUM('COPY_OF_BANK_ACCOUNT_RECEIVING_PAYMENTS', 'COPY_OF_COMPANY_REGISTRATION', 'COPY_OF_FINANCIAL_EVIDENCE', 'COPY_OF_HOUSE_REGISTRATION_AUTHORIZED_PERSON', 'COPY_OF_ID_OR_PASSPORT_ATTORNEY_GIVER', 'COPY_OF_ID_OR_PASSPORT_AUTHORIZED_PERSON', 'COPY_OF_VAT_REGISTRATION', 'ID_CARD_BACK', 'ID_CARD_FRONT', 'ID_CARD_WITH_PERSON', 'OTHERS', 'PHOTO_OF_COMPANY_OR_PROJECT', 'POWER_OF_ATTORNEY', 'TRADEMARK')`);
        await queryRunner.query(`ALTER TABLE "user_identity_documents" ALTER COLUMN "document_type" TYPE "public"."user_identity_documents_document_type_enum_old" USING "document_type"::"text"::"public"."user_identity_documents_document_type_enum_old"`);
        await queryRunner.query(`DROP TYPE "public"."user_identity_documents_document_type_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."user_identity_documents_document_type_enum_old" RENAME TO "user_identity_documents_document_type_enum"`);
    }

}
