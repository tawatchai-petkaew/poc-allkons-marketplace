import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ImportProductBatch } from './import-product-batch.entity';
import { ProductVariant } from './product-variant.entity';
import { decimalTransformer } from '@/utils/database.utils';

export enum MatchStatus {
  FOUND = 'FOUND', // พบสินค้า (exact match)
  SIMILAR = 'SIMILAR', // ใกล้เคียง (fuzzy match with suggestions)
  NOT_FOUND = 'NOT_FOUND', // ไม่พบสินค้า (no match)
}

export enum ImportStatus {
  PENDING = 'PENDING', // รอจับคู่
  PENDING_ADMIN = 'PENDING_ADMIN', // รอแอดมินตรวจสอบ (AT Master SKU)
  IMPORTING = 'IMPORTING', // กำลังนำเข้า
  COMPLETED = 'COMPLETED', // นำเข้าสำเร็จ
  FAILED = 'FAILED', // นำเข้าไม่สำเร็จ
  REJECTED = 'REJECTED', // ปฏิเสธ
}

export enum PriceType {
  EXVAT = 'EXVAT', // Price excluding VAT
  INVAT = 'INVAT', // Price including VAT
}

export enum SaleStatus {
  SELLING = 'SELLING', // Product is active and visible
  HIDDEN = 'HIDDEN', // Product is hidden from customers
}

export enum ImportType {
  CREATE = 'CREATE', // สินค้าใหม่ - จะสร้างใน merchant
  UPDATE = 'UPDATE', // สินค้ามีอยู่แล้ว - จะอัพเดตราคา/ข้อมูล
}

export interface SuggestedProduct {
  id: number;
  name: string;
  brand: string | null;
  barcode: string | null;
  imageUrl?: string | null;
  score: number;
}

@Entity('import_product_item')
@Index('idx_item_batch', ['batchId'])
@Index('idx_item_match_status', ['matchStatus'])
@Index('idx_item_import_status', ['importStatus'])
@Index('idx_item_batch_status', ['batchId', 'importStatus'])
@Index('idx_item_batch_match', ['batchId', 'matchStatus'])
export class ImportProductItem extends BaseEntity {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  // Relationships
  @Column({ type: 'bigint', name: 'batch_id' })
  batchId: number;

  @ManyToOne(() => ImportProductBatch, (batch) => batch.items, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'batch_id' })
  batch: ImportProductBatch;

  @Column({ type: 'int', name: 'row_no' })
  rowNo: number;

  // Imported product data (from Excel)
  @Column({
    type: 'varchar',
    length: 500,
    name: 'product_name',
    nullable: true,
  })
  productName: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  barcode: string | null;

  @Column({ type: 'varchar', length: 200, nullable: true })
  brand: string | null;

  // Pricing information
  @Column({
    type: 'enum',
    enum: PriceType,
    name: 'price_type',
    nullable: true,
  })
  priceType: PriceType | null;

  @Column({
    type: 'decimal',
    precision: 13,
    scale: 2,
    name: 'regular_price',
    nullable: true,
    transformer: decimalTransformer,
  })
  regularPrice: number | null;

  @Column({
    type: 'decimal',
    precision: 13,
    scale: 2,
    name: 'special_price',
    nullable: true,
    transformer: decimalTransformer,
  })
  specialPrice: number | null;

  @Column({
    type: 'decimal',
    precision: 3,
    scale: 1,
    name: 'vat_percent',
    nullable: true,
    transformer: decimalTransformer,
  })
  vatPercent: number | null;

  @Column({
    type: 'timestamp',
    name: 'special_price_start_date',
    nullable: true,
  })
  specialPriceStartDate: Date | null;

  @Column({ type: 'timestamp', name: 'special_price_end_date', nullable: true })
  specialPriceEndDate: Date | null;

  // Product settings
  @Column({ type: 'boolean', name: 'require_price_inquiry', default: false })
  requirePriceInquiry: boolean;

  @Column({
    type: 'enum',
    enum: SaleStatus,
    name: 'sale_status',
    nullable: true,
  })
  saleStatus: SaleStatus | null;

  // Matching result
  @Column({
    type: 'enum',
    enum: MatchStatus,
    name: 'match_status',
  })
  matchStatus: MatchStatus;

  @Column({
    type: 'bigint',
    name: 'matched_product_variant_id',
    nullable: true,
  })
  matchedProductVariantId: number | null;

  @ManyToOne(() => ProductVariant, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'matched_product_variant_id' })
  matchedProductVariant: ProductVariant | null;

  // Import type: CREATE (new product) or UPDATE (existing product)
  @Column({
    type: 'enum',
    enum: ImportType,
    name: 'import_type',
    nullable: true,
  })
  importType: ImportType | null;

  // Alternative suggestions (for SIMILAR status)
  // Contains product details with score for ranking
  @Column({ type: 'jsonb', name: 'suggested_products', nullable: true })
  suggestedProducts: SuggestedProduct[] | null;

  // Import status
  @Column({
    type: 'enum',
    enum: ImportStatus,
    name: 'import_status',
    default: ImportStatus.PENDING,
  })
  importStatus: ImportStatus;

  @Column({ type: 'timestamp', name: 'imported_at', nullable: true })
  importedAt: Date | null;

  // Timestamps
  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updatedAt: Date;

  // Reason for rejection or note when moving SIMILAR to PENDING_ADMIN
  @Column({ type: 'text', nullable: true })
  reason: string | null;
}
