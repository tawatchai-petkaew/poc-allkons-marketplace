import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Merchant } from './merchant.entity';
import { User } from './user.entity';
import { ImportProductItem } from './import-product-item.entity';

export enum ImportProductBatchStatus {
  VALIDATED = 'VALIDATED', // ตรวจสอบข้อมูลเรียบร้อย (รอ user confirm)
  MATCHING = 'MATCHING', // ระบบกำลังจับคู่
  PENDING_REVIEW = 'PENDING_REVIEW', // จัดการผลการจับคู่
  COMPLETED = 'COMPLETED', // นำเข้าเสร็จสิ้น
  CANCELLED = 'CANCELLED', // ยกเลิก
}

@Entity('import_product_batch')
@Index('idx_batch_merchant', ['merchantId'])
@Index('idx_batch_status', ['status'])
@Index('idx_batch_created', ['createdAt'])
@Index('idx_batch_merchant_status', ['merchantId', 'status'])
@Index('idx_batch_merchant_created', ['merchantId', 'createdAt'])
export class ImportProductBatch extends BaseEntity {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({ type: 'uuid', generated: 'uuid', unique: true })
  uuid: string;

  // Relationships
  @Column({ type: 'bigint', name: 'merchant_id' })
  merchantId: number;

  @ManyToOne(() => Merchant, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'merchant_id' })
  merchant: Merchant;

  @Column({ type: 'bigint', name: 'created_by', nullable: true })
  createdBy: number | null;

  @ManyToOne(() => User, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'created_by' })
  createdByUser: User;

  @Column({ type: 'bigint', name: 'updated_by', nullable: true })
  updatedBy: number | null;

  @OneToMany(() => ImportProductItem, (item) => item.batch)
  items: ImportProductItem[];

  // File information
  @Column({ type: 'varchar', length: 500, name: 'original_filename' })
  originalFilename: string;

  @Column({ type: 'varchar', length: 500, name: 'stored_filename' })
  storedFilename: string;

  @Column({ type: 'varchar', length: 1000, name: 's3_original_key' })
  s3OriginalKey: string;

  @Column({ type: 'varchar', length: 1000, name: 's3_result_key' })
  s3ResultKey: string;

  @Column({ type: 'varchar', length: 1000, name: 's3_validation_key' })
  s3ValidationKey: string;

  // Import statistics
  @Column({ type: 'int', name: 'total_rows', default: 0 })
  totalRows: number;

  // Validation statistics (from extract-excel step)
  @Column({ type: 'int', name: 'validation_pass_count', default: 0 })
  validationPassCount: number;

  @Column({ type: 'int', name: 'validation_fail_count', default: 0 })
  validationFailCount: number;

  // Matching statistics (from matching step)
  @Column({ type: 'int', name: 'matched_count', default: 0 })
  matchedCount: number;

  @Column({ type: 'int', name: 'similar_count', default: 0 })
  similarCount: number;

  @Column({ type: 'int', name: 'not_found_count', default: 0 })
  notFoundCount: number;

  // Status tracking
  @Column({
    type: 'enum',
    enum: ImportProductBatchStatus,
    default: ImportProductBatchStatus.VALIDATED,
  })
  status: ImportProductBatchStatus;

  // Timestamps
  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updatedAt: Date;
}
