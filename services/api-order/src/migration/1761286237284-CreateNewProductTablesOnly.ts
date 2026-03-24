import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateNewProductTablesOnly1761286237284
  implements MigrationInterface
{
  name = 'CreateNewProductTablesOnly1761286237284';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Create brand table
    await queryRunner.query(
      `CREATE TYPE "public"."brand_status_enum" AS ENUM('Active', 'Inactive', 'Deleted')`,
    );
    await queryRunner.query(
      `CREATE TABLE "brand" ("id" SERIAL NOT NULL, "name" character varying(256), "description" text, "imageUploadId" integer, "companyName" character varying(1024), "companyAddress" character varying(2048), "countryId" integer, "status" "public"."brand_status_enum" NOT NULL DEFAULT 'Active', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "createdBy" character varying(256), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedBy" character varying(256), "name_th" character varying(256), CONSTRAINT "PK_a5d20765ddd942eb5de4eee2d7f" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "iX_brand_imageUploadId" ON "brand" ("imageUploadId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "iX_brand_countryId" ON "brand" ("countryId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "iX_brand_status" ON "brand" ("status") `,
    );
    await queryRunner.query(
      `CREATE INDEX "iX_brand_createdAt" ON "brand" ("createdAt") `,
    );
    await queryRunner.query(
      `CREATE INDEX "iX_brand_updatedAt" ON "brand" ("updatedAt") `,
    );

    // 2. Create category table
    await queryRunner.query(
      `CREATE TYPE "public"."category_status_enum" AS ENUM('Active', 'Inactive', 'Deleted')`,
    );
    await queryRunner.query(
      `CREATE TABLE "category" ("id" SERIAL NOT NULL, "name" character varying(256), "description" text, "d365CategoryCode" character varying(128), "status" "public"."category_status_enum" NOT NULL DEFAULT 'Active', "imageUploadId" integer, "parentCategoryId" integer, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "createdBy" character varying(256), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedBy" character varying(256), CONSTRAINT "PK_9c4e4a89e3674fc9f382d733f03" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "iX_category_status" ON "category" ("status") `,
    );
    await queryRunner.query(
      `CREATE INDEX "iX_category_imageUploadId" ON "category" ("imageUploadId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "iX_category_parentCategoryId" ON "category" ("parentCategoryId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "iX_category_createdAt" ON "category" ("createdAt") `,
    );
    await queryRunner.query(
      `CREATE INDEX "iX_category_updatedAt" ON "category" ("updatedAt") `,
    );

    // 3. Create category_tag table
    await queryRunner.query(
      `CREATE TABLE "category_tag" ("id" SERIAL NOT NULL, "categoryId" integer NOT NULL, "tagName" character varying(64), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "createdBy" character varying(256), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedBy" character varying(256), CONSTRAINT "PK_39ad8c43044299dab3431974ace" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "iX_category_tag_categoryId" ON "category_tag" ("categoryId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "iX_category_tag_createdAt" ON "category_tag" ("createdAt") `,
    );
    await queryRunner.query(
      `CREATE INDEX "iX_category_tag_updatedAt" ON "category_tag" ("updatedAt") `,
    );

    // 4. Create merchant_product table
    await queryRunner.query(
      `CREATE TYPE "public"."merchant_product_merchantproductstatus_enum" AS ENUM('Selling', 'Hidden', 'OutOfStock', 'NotApproved')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."merchant_product_status_enum" AS ENUM('Active', 'Inactive', 'Deleted')`,
    );
    await queryRunner.query(
      `CREATE TABLE "merchant_product" ("id" SERIAL NOT NULL, "merchantCustomName" character varying(256), "description" text, "imageUploadId" integer, "thumbnail" character varying(255), "merchantId" integer NOT NULL, "storeProductId" integer NOT NULL, "productVariantId" integer, "quantity" integer, "price" numeric(18,2), "specialPrice" numeric(18,2), "startDate" TIMESTAMP, "endDate" TIMESTAMP, "isAcceptCash" boolean NOT NULL, "isAcceptCredit" boolean NOT NULL, "isAcceptPledge" boolean NOT NULL, "isAcceptCod" boolean NOT NULL, "isAcceptCreditCard" boolean NOT NULL, "merchantProductStatus" "public"."merchant_product_merchantproductstatus_enum" NOT NULL DEFAULT 'Selling', "status" "public"."merchant_product_status_enum" NOT NULL DEFAULT 'Active', "priceExVat" numeric(18,4), "priceVatPercent" numeric(18,4), "priceVAT" numeric(18,4), "specialPriceVAT" numeric(18,4), "specialPriceExVat" numeric(18,4), "specialPriceVatPercent" numeric(18,4), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "createdBy" character varying(256), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedBy" character varying(256), "priceExcludeVAT" numeric(18,2), "specialPriceExcludeVAT" numeric(18,2), CONSTRAINT "PK_18b429ac7fe9530c3056f4ec04c" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "iX_merchant_product_imageUploadId" ON "merchant_product" ("imageUploadId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "iX_merchant_product_merchantId" ON "merchant_product" ("merchantId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "iX_merchant_product_storeProductId" ON "merchant_product" ("storeProductId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "iX_merchant_product_productVariantId" ON "merchant_product" ("productVariantId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "iX_merchant_product_merchantProductStatus" ON "merchant_product" ("merchantProductStatus") `,
    );
    await queryRunner.query(
      `CREATE INDEX "iX_merchant_product_status" ON "merchant_product" ("status") `,
    );
    await queryRunner.query(
      `CREATE INDEX "iX_merchant_product_createdAt" ON "merchant_product" ("createdAt") `,
    );
    await queryRunner.query(
      `CREATE INDEX "iX_merchant_product_updatedAt" ON "merchant_product" ("updatedAt") `,
    );
    await queryRunner.query(
      `ALTER TABLE "merchant_product" ADD COLUMN IF NOT EXISTS "thumbnail" character varying(255)`,
    );

    // 6. Create product_attribute_master table
    await queryRunner.query(
      `CREATE TYPE "public"."product_attribute_master_attributetype_enum" AS ENUM('Integer', 'Decimal', 'String', 'Boolean')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."product_attribute_master_status_enum" AS ENUM('Active', 'Inactive', 'Deleted')`,
    );
    await queryRunner.query(
      `CREATE TABLE "product_attribute_master" ("id" SERIAL NOT NULL, "name" character varying(256) NOT NULL, "description" character varying(2048), "attributeType" "public"."product_attribute_master_attributetype_enum" NOT NULL DEFAULT 'Integer', "displayOrder" integer NOT NULL, "status" "public"."product_attribute_master_status_enum" NOT NULL DEFAULT 'Active', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "createdBy" character varying(256), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedBy" character varying(256), CONSTRAINT "PK_a0c21c66fadb56a472d08f9d913" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "iX_product_attribute_master_attributeType" ON "product_attribute_master" ("attributeType") `,
    );
    await queryRunner.query(
      `CREATE INDEX "iX_product_attribute_master_status" ON "product_attribute_master" ("status") `,
    );
    await queryRunner.query(
      `CREATE INDEX "iX_product_attribute_master_createdAt" ON "product_attribute_master" ("createdAt") `,
    );
    await queryRunner.query(
      `CREATE INDEX "iX_product_attribute_master_updatedAt" ON "product_attribute_master" ("updatedAt") `,
    );

    // 7. Create product_dimension table
    await queryRunner.query(
      `CREATE TABLE "product_dimension" ("id" SERIAL NOT NULL, "productId" integer NOT NULL, "productDimensionMasterId" integer NOT NULL, "displayOrder" character varying(128), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "createdBy" character varying(256), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedBy" character varying(256), CONSTRAINT "PK_f8974d3bf05696bee66d7447e1a" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "iX_product_dimension_productId" ON "product_dimension" ("productId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "iX_product_dimension_productDimensionMasterId" ON "product_dimension" ("productDimensionMasterId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "iX_product_dimension_createdAt" ON "product_dimension" ("createdAt") `,
    );
    await queryRunner.query(
      `CREATE INDEX "iX_product_dimension_updatedAt" ON "product_dimension" ("updatedAt") `,
    );

    // 8. Create product_dimension_master table
    await queryRunner.query(
      `CREATE TABLE "product_dimension_master" ("id" SERIAL NOT NULL, "name" character varying(256) NOT NULL, "description" character varying(2048), "promptText" character varying(256), "displayOrder" integer, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "createdBy" character varying(256), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedBy" character varying(256), CONSTRAINT "PK_14435ef86e318cf6fbc151fcc5e" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "iX_product_dimension_master_createdAt" ON "product_dimension_master" ("createdAt") `,
    );
    await queryRunner.query(
      `CREATE INDEX "iX_product_dimension_master_updatedAt" ON "product_dimension_master" ("updatedAt") `,
    );

    // 9. Create product_tag table
    await queryRunner.query(
      `CREATE TABLE "product_tag" ("id" SERIAL NOT NULL, "productId" integer NOT NULL, "tagName" character varying(64), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "createdBy" character varying(256), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedBy" character varying(256), CONSTRAINT "PK_1439455c6528caa94fcc8564fda" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "iX_product_tag_productId" ON "product_tag" ("productId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "iX_product_tag_createdAt" ON "product_tag" ("createdAt") `,
    );
    await queryRunner.query(
      `CREATE INDEX "iX_product_tag_updatedAt" ON "product_tag" ("updatedAt") `,
    );

    // 10. Create product_variant table
    await queryRunner.query(
      `CREATE TYPE "public"."product_variant_productstatus_enum" AS ENUM('Draft', 'WaitingForApproval', 'WaitingForPric', 'Active', 'Hidden', 'Inactive', 'OutOfStock', 'Pending')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."product_variant_status_enum" AS ENUM('Active', 'Inactive', 'Deleted')`,
    );
    await queryRunner.query(
      `CREATE TABLE "product_variant" ("id" SERIAL NOT NULL, "alias" character varying(128), "sku" character varying(128), "d365Sku" character varying(128), "d365ItemCode" character varying(128), "barcode" character varying(128), "internalBarcode" character varying(128), "d365Barcode" character varying(128), "internalBarcodD356" character varying(128), "salesUnit" character varying(128), "description" text, "howToUseText" text, "suggestionText" text, "cautionText" text, "urlVideo" character varying(500), "series" character varying(200), "model" character varying(100), "material" character varying(50), "tIS" character varying(100), "guarantee" character varying(50), "detailGuarantee" character varying(500), "countryId" integer, "packageWidth" numeric(18,2), "packageWidthUnit" text, "packageHeight" numeric(18,2), "packageHeightUnit" text, "packageDepth" numeric(18,2), "packageDepthUnit" text, "packageShape" text, "productWidth" numeric(18,2), "productWidthUnit" text, "productHeight" numeric(18,2), "productHeightUnit" text, "productDepth" numeric(18,2), "productDepthUnit" text, "grossWeight" numeric(18,2), "grossWeightUnit" text, "netWeight" numeric(18,2), "netWeightUnit" text, "productStatus" "public"."product_variant_productstatus_enum" NOT NULL DEFAULT 'Draft', "status" "public"."product_variant_status_enum" NOT NULL DEFAULT 'Active', "productId" integer, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "createdBy" character varying(256), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedBy" character varying(256), CONSTRAINT "PK_1ab69c9935c61f7c70791ae0a9f" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "iX_product_variant_countryId" ON "product_variant" ("countryId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "iX_product_variant_productStatus" ON "product_variant" ("productStatus") `,
    );
    await queryRunner.query(
      `CREATE INDEX "iX_product_variant_status" ON "product_variant" ("status") `,
    );
    await queryRunner.query(
      `CREATE INDEX "iX_product_variant_productId" ON "product_variant" ("productId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "iX_product_variant_createdAt" ON "product_variant" ("createdAt") `,
    );
    await queryRunner.query(
      `CREATE INDEX "iX_product_variant_updatedAt" ON "product_variant" ("updatedAt") `,
    );

    // 11. Create product_variant_attribute table
    await queryRunner.query(
      `CREATE TYPE "public"."product_variant_attribute_status_enum" AS ENUM('Active', 'Inactive', 'Deleted')`,
    );
    await queryRunner.query(
      `CREATE TABLE "product_variant_attribute" ("id" SERIAL NOT NULL, "productVariantId" integer NOT NULL, "productAttributeMasterId" integer NOT NULL, "stringValue" character varying(256) NOT NULL, "numberValue" numeric(18,2), "status" "public"."product_variant_attribute_status_enum" NOT NULL DEFAULT 'Active', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "createdBy" character varying(256), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedBy" character varying(256), CONSTRAINT "PK_90417758096050aa5d9d6e30c0a" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "iX_product_variant_attribute_productVariantId" ON "product_variant_attribute" ("productVariantId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "iX_product_variant_attribute_productAttributeMasterId" ON "product_variant_attribute" ("productAttributeMasterId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "iX_product_variant_attribute_status" ON "product_variant_attribute" ("status") `,
    );
    await queryRunner.query(
      `CREATE INDEX "iX_product_variant_attribute_createdAt" ON "product_variant_attribute" ("createdAt") `,
    );
    await queryRunner.query(
      `CREATE INDEX "iX_product_variant_attribute_updatedAt" ON "product_variant_attribute" ("updatedAt") `,
    );

    // 12. Create product_variant_category table
    await queryRunner.query(
      `CREATE TYPE "public"."product_variant_category_status_enum" AS ENUM('Active', 'Inactive', 'Deleted')`,
    );
    await queryRunner.query(
      `CREATE TABLE "product_variant_category" ("id" SERIAL NOT NULL, "productVariantId" integer NOT NULL, "productId" integer NOT NULL, "brandId" integer NOT NULL, "categoryId" integer NOT NULL, "hierarchy" character varying(100), "categoryD365" character varying(100), "categoryM" character varying(100), "categorySupplier" character varying(100), "status" "public"."product_variant_category_status_enum" NOT NULL DEFAULT 'Active', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "createdBy" character varying(256), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedBy" character varying(256), CONSTRAINT "PK_ad8791cfb239dd92d13a45c6911" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "iX_product_variant_category_productVariantId" ON "product_variant_category" ("productVariantId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "iX_product_variant_category_productId" ON "product_variant_category" ("productId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "iX_product_variant_category_brandId" ON "product_variant_category" ("brandId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "iX_product_variant_category_categoryId" ON "product_variant_category" ("categoryId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "iX_product_variant_category_status" ON "product_variant_category" ("status") `,
    );
    await queryRunner.query(
      `CREATE INDEX "iX_product_variant_category_createdAt" ON "product_variant_category" ("createdAt") `,
    );
    await queryRunner.query(
      `CREATE INDEX "iX_product_variant_category_updatedAt" ON "product_variant_category" ("updatedAt") `,
    );

    // 13. Create product_variant_code table
    await queryRunner.query(
      `CREATE TYPE "public"."product_variant_code_status_enum" AS ENUM('Active', 'Inactive', 'Deleted')`,
    );
    await queryRunner.query(
      `CREATE TABLE "product_variant_code" ("id" SERIAL NOT NULL, "productVariantId" integer, "skuCode" character varying(255), "type" character varying(255), "status" "public"."product_variant_code_status_enum" DEFAULT 'Active', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "createdBy" character varying(255), "updatedBy" character varying(255), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_5cfcd91ace403b73f1fffa25a64" PRIMARY KEY ("id"))`,
    );

    // 14. Create product_variant_dimension table
    await queryRunner.query(
      `CREATE TABLE "product_variant_dimension" ("id" SERIAL NOT NULL, "productVariantId" integer NOT NULL, "productDimensionId" integer NOT NULL, "value" character varying(256), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "createdBy" character varying(256), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedBy" character varying(256), CONSTRAINT "PK_58dfc58d96315bcc8504d757db4" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "iX_product_variant_dimension_productVariantId" ON "product_variant_dimension" ("productVariantId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "iX_product_variant_dimension_productDimensionId" ON "product_variant_dimension" ("productDimensionId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "iX_product_variant_dimension_createdAt" ON "product_variant_dimension" ("createdAt") `,
    );
    await queryRunner.query(
      `CREATE INDEX "iX_product_variant_dimension_updatedAt" ON "product_variant_dimension" ("updatedAt") `,
    );

    // 15. Create product_variant_document table
    await queryRunner.query(
      `CREATE TYPE "public"."product_variant_document_documenttype_enum" AS ENUM('Howto', 'Suggestion', 'Caution', 'Catalog', 'Bim')`,
    );
    await queryRunner.query(
      `CREATE TABLE "product_variant_document" ("id" SERIAL NOT NULL, "productVariantId" integer NOT NULL, "imageUploadId" integer NOT NULL, "documentType" "public"."product_variant_document_documenttype_enum" NOT NULL DEFAULT 'Howto', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "createdBy" character varying(256), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedBy" character varying(256), CONSTRAINT "PK_e333a3b099f6d1a1f7717327bc3" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "iX_product_variant_document_productVariantId" ON "product_variant_document" ("productVariantId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "iX_product_variant_document_imageUploadId" ON "product_variant_document" ("imageUploadId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "iX_product_variant_document_documentType" ON "product_variant_document" ("documentType") `,
    );
    await queryRunner.query(
      `CREATE INDEX "iX_product_variant_document_createdAt" ON "product_variant_document" ("createdAt") `,
    );
    await queryRunner.query(
      `CREATE INDEX "iX_product_variant_document_updatedAt" ON "product_variant_document" ("updatedAt") `,
    );

    // 16. Create product_variant_image table
    await queryRunner.query(
      `CREATE TABLE "product_variant_image" ("id" SERIAL NOT NULL, "productVariantId" integer NOT NULL, "imageUploadId" integer NOT NULL, "order" integer NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "createdBy" character varying(256), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedBy" character varying(256), CONSTRAINT "PK_e768b1a1fe30fe0aa9cc54b1a83" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "iX_product_variant_image_productVariantId" ON "product_variant_image" ("productVariantId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "iX_product_variant_image_imageUploadId" ON "product_variant_image" ("imageUploadId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "iX_product_variant_image_createdAt" ON "product_variant_image" ("createdAt") `,
    );
    await queryRunner.query(
      `CREATE INDEX "iX_product_variant_image_updatedAt" ON "product_variant_image" ("updatedAt") `,
    );

    // 17. Create product_variant_tag table
    await queryRunner.query(
      `CREATE TABLE "product_variant_tag" ("id" SERIAL NOT NULL, "productVariantId" integer NOT NULL, "tagName" character varying(64), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "createdBy" character varying(256), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedBy" character varying(256), CONSTRAINT "PK_d2447dc5a19c90bdcc1f09d5d93" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "iX_product_variant_tag_productVariantId" ON "product_variant_tag" ("productVariantId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "iX_product_variant_tag_createdAt" ON "product_variant_tag" ("createdAt") `,
    );
    await queryRunner.query(
      `CREATE INDEX "iX_product_variant_tag_updatedAt" ON "product_variant_tag" ("updatedAt") `,
    );

    // 18. Add new columns to existing product table
    await queryRunner.query(
      `CREATE TYPE "public"."product_status_legacy_enum" AS ENUM('Active', 'Inactive', 'Deleted')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."product_productstatus_legacy_enum" AS ENUM('Draft', 'WaitingForApproval', 'WaitingForPric', 'Active', 'Hidden', 'Inactive', 'OutOfStock', 'Pending')`,
    );
    await queryRunner.query(
      `ALTER TABLE "product" ADD COLUMN IF NOT EXISTS "name" character varying(300)`,
    );
    await queryRunner.query(
      `ALTER TABLE "product" ADD COLUMN IF NOT EXISTS "description" character varying(4096)`,
    );
    await queryRunner.query(
      `ALTER TABLE "product" ADD COLUMN IF NOT EXISTS "d365Sku" character varying(128)`,
    );
    await queryRunner.query(
      `ALTER TABLE "product" ADD COLUMN IF NOT EXISTS "d365ItemCode" character varying(128)`,
    );
    await queryRunner.query(
      `ALTER TABLE "product" ADD COLUMN IF NOT EXISTS "status" "public"."product_status_legacy_enum" DEFAULT 'Active'`,
    );
    await queryRunner.query(
      `ALTER TABLE "product" ADD COLUMN IF NOT EXISTS "productTM" boolean`,
    );
    await queryRunner.query(
      `ALTER TABLE "product" ADD COLUMN IF NOT EXISTS "createdBy" character varying(256)`,
    );
    await queryRunner.query(
      `ALTER TABLE "product" ADD COLUMN IF NOT EXISTS "updatedBy" character varying(256)`,
    );
    await queryRunner.query(
      `ALTER TABLE "product" ADD COLUMN IF NOT EXISTS "productStatus" "public"."product_productstatus_legacy_enum" DEFAULT 'Draft'`,
    );
    await queryRunner.query(
      `ALTER TABLE "product" ADD COLUMN IF NOT EXISTS "skuUUID" character varying(128)`,
    );

    // 19. Add new columns to existing product_category table
    await queryRunner.query(
      `ALTER TABLE "product_category" ADD COLUMN IF NOT EXISTS "productId" integer`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_category" ADD COLUMN IF NOT EXISTS "categoryId" integer`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_category" ADD COLUMN IF NOT EXISTS "createdBy" character varying(256)`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_category" ADD COLUMN IF NOT EXISTS "updatedBy" character varying(256)`,
    );

    // 20. Add foreign key constraints for product_category
    await queryRunner.query(
      `ALTER TABLE "product_category" ADD CONSTRAINT "FK_product_category_product_productId" FOREIGN KEY ("productId") REFERENCES "product"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_category" ADD CONSTRAINT "FK_product_category_category_categoryId" FOREIGN KEY ("categoryId") REFERENCES "category"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );

    // 21. Add foreign key constraints for brand table
    await queryRunner.query(
      `ALTER TABLE "brand" ADD CONSTRAINT "FK_brand_image_upload_imageUploadId" FOREIGN KEY ("imageUploadId") REFERENCES "image_upload"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "brand" ADD CONSTRAINT "FK_brand_country_countryId" FOREIGN KEY ("countryId") REFERENCES "country"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );

    // 22. Add foreign key constraints for category table
    await queryRunner.query(
      `ALTER TABLE "category" ADD CONSTRAINT "FK_category_image_upload_imageUploadId" FOREIGN KEY ("imageUploadId") REFERENCES "image_upload"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "category" ADD CONSTRAINT "FK_category_category_parentCategoryId" FOREIGN KEY ("parentCategoryId") REFERENCES "category"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );

    // 23. Add foreign key constraints for category_tag table
    await queryRunner.query(
      `ALTER TABLE "category_tag" ADD CONSTRAINT "FK_category_tag_category_categoryId" FOREIGN KEY ("categoryId") REFERENCES "category"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );

    // 24. Add foreign key constraints for merchant_product table
    await queryRunner.query(
      `ALTER TABLE "merchant_product" ADD CONSTRAINT "FK_merchant_product_image_upload_imageUploadId" FOREIGN KEY ("imageUploadId") REFERENCES "image_upload"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "merchant_product" ADD CONSTRAINT "FK_merchant_product_merchant_merchantId" FOREIGN KEY ("merchantId") REFERENCES "merchant"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "merchant_product" ADD CONSTRAINT "FK_merchant_product_product_variant_productVariantId" FOREIGN KEY ("productVariantId") REFERENCES "product_variant"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    // Note: storeProductId FK removed (store_product table deleted)

    // 25. Add foreign key constraints for product_dimension table
    await queryRunner.query(
      `ALTER TABLE "product_dimension" ADD CONSTRAINT "FK_product_dimension_product_productId" FOREIGN KEY ("productId") REFERENCES "product"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_dimension" ADD CONSTRAINT "FK_product_dimension_product_dimension_master_productDimensionMasterId" FOREIGN KEY ("productDimensionMasterId") REFERENCES "product_dimension_master"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );

    // 26. Add foreign key constraints for product_tag table
    await queryRunner.query(
      `ALTER TABLE "product_tag" ADD CONSTRAINT "FK_product_tag_product_productId" FOREIGN KEY ("productId") REFERENCES "product"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );

    // 27. Add foreign key constraints for product_variant table
    await queryRunner.query(
      `ALTER TABLE "product_variant" ADD CONSTRAINT "FK_product_variant_country_countryId" FOREIGN KEY ("countryId") REFERENCES "country"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_variant" ADD CONSTRAINT "FK_product_variant_product_productId" FOREIGN KEY ("productId") REFERENCES "product"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );

    // 28. Add foreign key constraints for product_variant_attribute table
    await queryRunner.query(
      `ALTER TABLE "product_variant_attribute" ADD CONSTRAINT "FK_product_variant_attribute_product_variant_productVariantId" FOREIGN KEY ("productVariantId") REFERENCES "product_variant"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_variant_attribute" ADD CONSTRAINT "FK_product_variant_attribute_product_attribute_master_productAttributeMasterId" FOREIGN KEY ("productAttributeMasterId") REFERENCES "product_attribute_master"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );

    // 29. Add foreign key constraints for product_variant_category table
    await queryRunner.query(
      `ALTER TABLE "product_variant_category" ADD CONSTRAINT "FK_product_variant_category_product_variant_productVariantId" FOREIGN KEY ("productVariantId") REFERENCES "product_variant"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_variant_category" ADD CONSTRAINT "FK_product_variant_category_product_productId" FOREIGN KEY ("productId") REFERENCES "product"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_variant_category" ADD CONSTRAINT "FK_product_variant_category_brand_brandId" FOREIGN KEY ("brandId") REFERENCES "brand"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_variant_category" ADD CONSTRAINT "FK_product_variant_category_category_categoryId" FOREIGN KEY ("categoryId") REFERENCES "category"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );

    // 30. Add foreign key constraints for product_variant_code table
    await queryRunner.query(
      `ALTER TABLE "product_variant_code" ADD CONSTRAINT "FK_product_variant_code_product_variant_productVariantId" FOREIGN KEY ("productVariantId") REFERENCES "product_variant"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );

    // 31. Add foreign key constraints for product_variant_dimension table
    await queryRunner.query(
      `ALTER TABLE "product_variant_dimension" ADD CONSTRAINT "FK_product_variant_dimension_product_variant_productVariantId" FOREIGN KEY ("productVariantId") REFERENCES "product_variant"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_variant_dimension" ADD CONSTRAINT "FK_product_variant_dimension_product_dimension_productDimensionId" FOREIGN KEY ("productDimensionId") REFERENCES "product_dimension"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );

    // 32. Add foreign key constraints for product_variant_document table
    await queryRunner.query(
      `ALTER TABLE "product_variant_document" ADD CONSTRAINT "FK_product_variant_document_product_variant_productVariantId" FOREIGN KEY ("productVariantId") REFERENCES "product_variant"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_variant_document" ADD CONSTRAINT "FK_product_variant_document_image_upload_imageUploadId" FOREIGN KEY ("imageUploadId") REFERENCES "image_upload"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );

    // 33. Add foreign key constraints for product_variant_image table
    await queryRunner.query(
      `ALTER TABLE "product_variant_image" ADD CONSTRAINT "FK_product_variant_image_product_variant_productVariantId" FOREIGN KEY ("productVariantId") REFERENCES "product_variant"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_variant_image" ADD CONSTRAINT "FK_product_variant_image_image_upload_imageUploadId" FOREIGN KEY ("imageUploadId") REFERENCES "image_upload"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );

    // 34. Add foreign key constraints for product_variant_tag table
    await queryRunner.query(
      `ALTER TABLE "product_variant_tag" ADD CONSTRAINT "FK_product_variant_tag_product_variant_productVariantId" FOREIGN KEY ("productVariantId") REFERENCES "product_variant"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop all foreign key constraints first (in reverse order)
    await queryRunner.query(
      `ALTER TABLE "product_variant_tag" DROP CONSTRAINT IF EXISTS "FK_product_variant_tag_product_variant_productVariantId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_variant_image" DROP CONSTRAINT IF EXISTS "FK_product_variant_image_image_upload_imageUploadId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_variant_image" DROP CONSTRAINT IF EXISTS "FK_product_variant_image_product_variant_productVariantId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_variant_document" DROP CONSTRAINT IF EXISTS "FK_product_variant_document_image_upload_imageUploadId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_variant_document" DROP CONSTRAINT IF EXISTS "FK_product_variant_document_product_variant_productVariantId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_variant_dimension" DROP CONSTRAINT IF EXISTS "FK_product_variant_dimension_product_dimension_productDimensionId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_variant_dimension" DROP CONSTRAINT IF EXISTS "FK_product_variant_dimension_product_variant_productVariantId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_variant_code" DROP CONSTRAINT IF EXISTS "FK_product_variant_code_product_variant_productVariantId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_variant_category" DROP CONSTRAINT IF EXISTS "FK_product_variant_category_category_categoryId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_variant_category" DROP CONSTRAINT IF EXISTS "FK_product_variant_category_brand_brandId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_variant_category" DROP CONSTRAINT IF EXISTS "FK_product_variant_category_product_productId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_variant_category" DROP CONSTRAINT IF EXISTS "FK_product_variant_category_product_variant_productVariantId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_variant_attribute" DROP CONSTRAINT IF EXISTS "FK_product_variant_attribute_product_attribute_master_productAttributeMasterId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_variant_attribute" DROP CONSTRAINT IF EXISTS "FK_product_variant_attribute_product_variant_productVariantId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_variant" DROP CONSTRAINT IF EXISTS "FK_product_variant_product_productId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_variant" DROP CONSTRAINT IF EXISTS "FK_product_variant_country_countryId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_tag" DROP CONSTRAINT IF EXISTS "FK_product_tag_product_productId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_dimension" DROP CONSTRAINT IF EXISTS "FK_product_dimension_product_dimension_master_productDimensionMasterId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_dimension" DROP CONSTRAINT IF EXISTS "FK_product_dimension_product_productId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "merchant_product" DROP CONSTRAINT IF EXISTS "FK_merchant_product_product_variant_productVariantId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "merchant_product" DROP CONSTRAINT IF EXISTS "FK_merchant_product_merchant_merchantId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "merchant_product" DROP CONSTRAINT IF EXISTS "FK_merchant_product_image_upload_imageUploadId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "category_tag" DROP CONSTRAINT IF EXISTS "FK_category_tag_category_categoryId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "category" DROP CONSTRAINT IF EXISTS "FK_category_category_parentCategoryId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "category" DROP CONSTRAINT IF EXISTS "FK_category_image_upload_imageUploadId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "brand" DROP CONSTRAINT IF EXISTS "FK_brand_country_countryId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "brand" DROP CONSTRAINT IF EXISTS "FK_brand_image_upload_imageUploadId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_category" DROP CONSTRAINT IF EXISTS "FK_product_category_category_categoryId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_category" DROP CONSTRAINT IF EXISTS "FK_product_category_product_productId"`,
    );

    // Remove columns from existing tables
    await queryRunner.query(
      `ALTER TABLE "product_category" DROP COLUMN IF EXISTS "updatedBy"`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_category" DROP COLUMN IF EXISTS "createdBy"`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_category" DROP COLUMN IF EXISTS "categoryId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_category" DROP COLUMN IF EXISTS "productId"`,
    );

    await queryRunner.query(
      `ALTER TABLE "product" DROP COLUMN IF EXISTS "skuUUID"`,
    );
    await queryRunner.query(
      `ALTER TABLE "product" DROP COLUMN IF EXISTS "productStatus"`,
    );
    await queryRunner.query(
      `ALTER TABLE "product" DROP COLUMN IF EXISTS "updatedBy"`,
    );
    await queryRunner.query(
      `ALTER TABLE "product" DROP COLUMN IF EXISTS "createdBy"`,
    );
    await queryRunner.query(
      `ALTER TABLE "product" DROP COLUMN IF EXISTS "productTM"`,
    );
    await queryRunner.query(
      `ALTER TABLE "product" DROP COLUMN IF EXISTS "status"`,
    );
    await queryRunner.query(
      `ALTER TABLE "product" DROP COLUMN IF EXISTS "d365ItemCode"`,
    );
    await queryRunner.query(
      `ALTER TABLE "product" DROP COLUMN IF EXISTS "d365Sku"`,
    );
    await queryRunner.query(
      `ALTER TABLE "product" DROP COLUMN IF EXISTS "description"`,
    );
    await queryRunner.query(
      `ALTER TABLE "product" DROP COLUMN IF EXISTS "name"`,
    );
    await queryRunner.query(
      `DROP TYPE IF EXISTS "public"."product_productstatus_legacy_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE IF EXISTS "public"."product_status_legacy_enum"`,
    );

    // Drop new tables in reverse order
    await queryRunner.query(`DROP TABLE "product_variant_tag"`);
    await queryRunner.query(`DROP TABLE "product_variant_image"`);
    await queryRunner.query(`DROP TABLE "product_variant_document"`);
    await queryRunner.query(
      `DROP TYPE "public"."product_variant_document_documenttype_enum"`,
    );
    await queryRunner.query(`DROP TABLE "product_variant_dimension"`);
    await queryRunner.query(`DROP TABLE "product_variant_code"`);
    await queryRunner.query(
      `DROP TYPE "public"."product_variant_code_status_enum"`,
    );
    await queryRunner.query(`DROP TABLE "product_variant_category"`);
    await queryRunner.query(
      `DROP TYPE "public"."product_variant_category_status_enum"`,
    );
    await queryRunner.query(`DROP TABLE "product_variant_attribute"`);
    await queryRunner.query(
      `DROP TYPE "public"."product_variant_attribute_status_enum"`,
    );
    await queryRunner.query(`DROP TABLE "product_variant"`);
    await queryRunner.query(`DROP TYPE "public"."product_variant_status_enum"`);
    await queryRunner.query(
      `DROP TYPE "public"."product_variant_productstatus_enum"`,
    );
    await queryRunner.query(`DROP TABLE "product_tag"`);
    await queryRunner.query(`DROP TABLE "product_dimension_master"`);
    await queryRunner.query(`DROP TABLE "product_dimension"`);
    await queryRunner.query(`DROP TABLE "product_attribute_master"`);
    await queryRunner.query(
      `DROP TYPE "public"."product_attribute_master_status_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."product_attribute_master_attributetype_enum"`,
    );
    await queryRunner.query(`DROP TABLE "merchant_product"`);
    await queryRunner.query(
      `DROP TYPE "public"."merchant_product_status_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."merchant_product_merchantproductstatus_enum"`,
    );
    await queryRunner.query(`DROP TABLE "category_tag"`);
    await queryRunner.query(`DROP TABLE "category"`);
    await queryRunner.query(`DROP TYPE "public"."category_status_enum"`);
    await queryRunner.query(`DROP TABLE "brand"`);
    await queryRunner.query(`DROP TYPE "public"."brand_status_enum"`);
  }
}
