import {
  BaseEntity,
  BeforeInsert,
  BeforeUpdate,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ProductVariantAttribute } from './product-variant-attribute.entity';


export enum AttributeType {
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
@Index('iX_product_attribute_master_attributeType', ['attributeType'])
@Index('iX_product_attribute_master_status', ['status'])
@Index('iX_product_attribute_master_createdAt', ['createdAt'])
@Index('iX_product_attribute_master_updatedAt', ['updatedAt'])
export class ProductAttributeMaster extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 256 })
  name: string;

  @Column({ type: 'varchar', length: 2048, nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: AttributeType,
    default: AttributeType.INTEGER,
  })
  attributeType: AttributeType;

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

  @Column({ type: 'varchar', length: 256, nullable: true })
  updatedBy: string;

  @Column()
  @CreateDateColumn()
  createdAt: Date;

  @Column()
  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(
    () => ProductVariantAttribute,
    (productVariantAttributes) => productVariantAttributes.productAttributeMaster,
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

