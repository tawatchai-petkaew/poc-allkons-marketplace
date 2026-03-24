import {
  BaseEntity,
  BeforeInsert,
  BeforeUpdate,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ProductVariant } from './product-variant.entity';
import { ProductAttributeMaster } from './product-attribute-master.entity';

export enum ProductVariantAttributeStatus {
  ACTIVE = 'Active',
  INACTIVE = 'Inactive',
  DELETED = 'Deleted',
}

@Entity()
@Index(['productVariantId'])
@Index(['productAttributeMasterId'])
@Index(['status'])
@Index(['createdAt'])
@Index(['updatedAt'])
export class ProductVariantAttribute extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  productVariantId: number;

  @Column()
  productAttributeMasterId: number;

  @Column({ type: 'varchar', length: 256 })
  stringValue: string;

  @Column({ type: 'numeric', precision: 18, scale: 2, nullable: true })
  numberValue: number;

  @Column({
    type: 'enum',
    enum: ProductVariantAttributeStatus,
    default: ProductVariantAttributeStatus.ACTIVE,
  })
  status: ProductVariantAttributeStatus;

  @Column({ type: 'varchar', length: 256, nullable: true })
  createdBy: string;

  @Column()
  @CreateDateColumn()
  createdAt: Date;

  @Column({ type: 'varchar', length: 256, nullable: true })
  updatedBy: string;

  @Column()
  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  public deletedAt: Date;

  @ManyToOne(
    () => ProductVariant,
    (productVariant) => productVariant.productVariantAttributes,
  )
  @JoinColumn({ name: 'productVariantId' })
  productVariant: ProductVariant;

  @ManyToOne(
    () => ProductAttributeMaster,
    (productAttributeMaster) => productAttributeMaster.productVariantAttributes,
  )
  @JoinColumn({ name: 'productAttributeMasterId' })
  productAttributeMaster: ProductAttributeMaster;

  @BeforeInsert()
  createdAtWithTimezone() {
    const currentDate = new Date();
    this.createdAt = new Date(currentDate.getTime());
    this.updatedAt = new Date(currentDate.getTime());
  }

  @BeforeUpdate()
  updatedAtWithTimezone() {
    const currentDate = new Date();
    this.updatedAt = new Date(currentDate.getTime());
  }
}
