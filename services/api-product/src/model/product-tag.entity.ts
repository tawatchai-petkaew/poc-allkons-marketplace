import {
  BaseEntity,
  BeforeInsert,
  BeforeUpdate,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { Product } from './product.entity';

@Entity()
@Index('iX_product_tag_productId', ['productId'])
@Index('iX_product_tag_createdAt', ['createdAt'])
@Index('iX_product_tag_updatedAt', ['updatedAt'])
export class ProductTag extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  productId: number;

  @Column({ type: 'varchar', length: 64, nullable: true })
  tagName: string;

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

  @ManyToOne(() => Product, (product) => product.productTags)
  @JoinColumn({ name: 'productId' })
  product: Product;

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

