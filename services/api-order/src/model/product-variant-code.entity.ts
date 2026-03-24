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

export enum ProductVariantCodeStatus {
  ACTIVE = 'Active',
  INACTIVE = 'Inactive',
  DELETED = 'Deleted',
}

@Entity()
@Index(['productVariantId'])
@Index(['status'])
@Index(['createdAt'])
@Index(['updatedAt'])
export class ProductVariantCode extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  productVariantId: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  skuCode: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  type: string;

  @Column({
    type: 'enum',
    enum: ProductVariantCodeStatus,
    default: ProductVariantCodeStatus.ACTIVE,
    nullable: true,
  })
  status: ProductVariantCodeStatus;

  @Column({ type: 'varchar', length: 255, nullable: true })
  createdBy: string;

  @Column()
  @CreateDateColumn()
  createdAt: Date;

  @Column({ type: 'varchar', length: 255, nullable: true })
  updatedBy: string;

  @Column()
  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  public deletedAt: Date;

  @ManyToOne(
    () => ProductVariant,
    (productVariant) => productVariant.productVariantCodes,
  )
  @JoinColumn({ name: 'productVariantId' })
  productVariant: ProductVariant;

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
