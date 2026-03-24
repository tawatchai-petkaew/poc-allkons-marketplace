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

import { ProductDimension } from './product-dimension.entity';

@Entity()
@Index('iX_product_dimension_master_createdAt', ['createdAt'])
@Index('iX_product_dimension_master_updatedAt', ['updatedAt'])
export class ProductDimensionMaster extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 256 })
  name: string;

  @Column({ type: 'varchar', length: 2048, nullable: true })
  description: string;

  @Column({ type: 'varchar', length: 256, nullable: true })
  promptText: string;

  @Column({ nullable: true })
  displayOrder: number;

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
    () => ProductDimension,
    (productDimensions) => productDimensions.productDimensionMaster,
  )
  productDimensions: ProductDimension[];

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

