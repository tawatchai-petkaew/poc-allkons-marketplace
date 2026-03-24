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

import { ProductVariant } from './product-variant.entity';

@Entity()
@Index(['productVariantId'])
@Index(['createdAt'])
@Index(['updatedAt'])
export class ProductVariantTag extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  productVariantId: number;

  @Column({ nullable: true, length: 64 })
  tagName: string;

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

  @ManyToOne(
    () => ProductVariant,
    (productVariant) => productVariant.productVariantTags,
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

