import {
  BaseEntity,
  BeforeInsert,
  BeforeUpdate,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ProductVariantAttribute } from './product-variant-attribute.entity';

export enum ProductAttributeMasterAttributeType {
  INTEGER = 'Integer',
  DECIMAL = 'Decimal',
  STRING = 'String',
  BOOLEAN = 'Boolean',
}

export enum ProductAttributeMasterStatus {
  ACTIVE = 'Active',
  INACTIVE = 'Inactive',
  DELETED = 'Deleted',
}

@Entity()
@Index(['attributeType'])
@Index(['status'])
@Index(['createdAt'])
@Index(['updatedAt'])
export class ProductAttributeMaster extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 256 })
  name: string;

  @Column({ type: 'varchar', length: 2048, nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: ProductAttributeMasterAttributeType,
    default: ProductAttributeMasterAttributeType.INTEGER,
  })
  attributeType: ProductAttributeMasterAttributeType;

  @Column()
  displayOrder: number;

  @Column({
    type: 'enum',
    enum: ProductAttributeMasterStatus,
    default: ProductAttributeMasterStatus.ACTIVE,
  })
  status: ProductAttributeMasterStatus;

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

  @OneToMany(
    () => ProductVariantAttribute,
    (productVariantAttributes) =>
      productVariantAttributes.productAttributeMaster,
  )
  productVariantAttributes: ProductVariantAttribute[];

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
