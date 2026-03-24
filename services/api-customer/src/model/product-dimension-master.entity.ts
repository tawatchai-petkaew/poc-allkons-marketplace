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
@Index(['createdAt'])
@Index(['updatedAt'])
export class ProductDimensionMaster extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 256 })
  name: string;

  @Column({ nullable: true, length: 2048 })
  description: string;

  @Column({ nullable: true, length: 256 })
  promptText: string;

  @Column({ nullable: true, type: 'int' })
  displayOrder: number;

  @Column()
  @CreateDateColumn()
  createdAt: Date;

  @Column({ nullable: true, length: 256 })
  createdBy: string;

  @Column()
  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ nullable: true, length: 256 })
  updatedBy: string;

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

