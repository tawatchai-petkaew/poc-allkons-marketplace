import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Index,
  CreateDateColumn,
} from 'typeorm';

/**
 * ChangesQueue Entity - CDC (Change Data Capture) Table
 *
 * 🔧 FIX OLD PROBLEM:
 * - OLD: SaveChanges interceptor could miss events, sent 1 message per change
 * - NEW: Database triggers guarantee capture of ALL changes, no events missed
 *
 * This table is populated by PostgreSQL triggers on tracked tables:
 * - product_variant
 * - product
 * - product_category
 * - merchant_product
 */
@Entity('changes_queue')
@Index('idx_changes_queue_processed', ['processed', 'changedAt'])
@Index('idx_changes_queue_entity', ['entityType', 'entityId'])
export class ChangesQueue {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'entity_type', type: 'varchar', length: 50 })
  entityType: string;

  @Column({ name: 'entity_id' })
  entityId: number;

  @Column({ type: 'varchar', length: 10 })
  operation: 'INSERT' | 'UPDATE' | 'DELETE';

  @CreateDateColumn({ name: 'changed_at', type: 'timestamp' })
  changedAt: Date;

  @Column({ default: false })
  processed: boolean;

  @Column({ name: 'processed_at', type: 'timestamp', nullable: true })
  processedAt: Date | null;

  @Column({ name: 'error_count', type: 'int', default: 0 })
  errorCount: number;

  @Column({ name: 'last_error', type: 'text', nullable: true })
  lastError: string | null;

  @Column({ name: 'skipped', type: 'boolean', default: false })
  skipped: boolean;
}
