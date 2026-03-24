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
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Product } from './product.entity';
import { ProductDimensionMaster } from './product-dimension-master.entity';
import { ProductVariantDimension } from './product-variant-dimension.entity';

@Entity()
@Index(['productId'])
@Index(['productDimensionMasterId'])
@Index(['createdAt'])
@Index(['updatedAt'])
export class ProductDimension extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  productId: number;

  @Column()
  productDimensionMasterId: number;

  @Column({ type: 'varchar', length: 128, nullable: true })
  displayOrder: string;

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

  @ManyToOne(() => Product, (product) => product.productDimensions)
  @JoinColumn({ name: 'productId' })
  product: Product;

  @ManyToOne(
    () => ProductDimensionMaster,
    (productDimensionMaster) => productDimensionMaster.productDimensions,
  )
  @JoinColumn({ name: 'productDimensionMasterId' })
  productDimensionMaster: ProductDimensionMaster;

  @OneToMany(
    () => ProductVariantDimension,
    (productVariantDimensions) => productVariantDimensions.productDimension,
  )
  productVariantDimensions: ProductVariantDimension[];

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
