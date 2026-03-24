import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  BeforeInsert,
  BeforeUpdate,
  ManyToOne,
} from 'typeorm';

import { ProductBrand } from './product-brand.entity';

@Entity()
export class ProductBrandTranslation extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  locale: string;

  @Column()
  @CreateDateColumn()
  createdAt: Date;

  @Column()
  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  public deletedAt: Date;

  @ManyToOne(
    () => ProductBrand,
    (productBrand) => productBrand.productBrandTranslations,
  )
  productBrand: ProductBrand;

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
