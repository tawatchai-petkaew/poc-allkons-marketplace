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
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { ImageUpload } from './image-upload.entity';
import { Country } from './country.entity';
import { ProductVariantCategory } from './product-variant-category.entity';
import { Product } from './product.entity';

export enum BrandStatus {
  ACTIVE = 'Active',
  INACTIVE = 'Inactive',
  DELETED = 'Deleted',
}

@Entity()
@Index('iX_brand_imageUploadId', ['imageUploadId'])
@Index('iX_brand_countryId', ['countryId'])
@Index('iX_brand_status', ['status'])
@Index('iX_brand_createdAt', ['createdAt'])
@Index('iX_brand_updatedAt', ['updatedAt'])
export class Brand extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 256, nullable: true })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ nullable: true })
  imageUploadId: number;

  @Column({ type: 'varchar', length: 1024, nullable: true })
  companyName: string;

  @Column({ type: 'varchar', length: 2048, nullable: true })
  companyAddress: string;

  @Column({ nullable: true })
  countryId: number;

  @Column({
    type: 'enum',
    enum: BrandStatus,
    default: BrandStatus.ACTIVE,
  })
  status: BrandStatus;

  @Column({ type: 'varchar', length: 256, nullable: true })
  name_th: string;

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

  @ManyToOne(() => ImageUpload, { nullable: true })
  @JoinColumn({ name: 'imageUploadId' })
  imageUpload: ImageUpload;

  @ManyToOne(() => Country, { nullable: true })
  @JoinColumn({ name: 'countryId' })
  country: Country;

  @OneToMany(() => Product, (products) => products.brand)
  products: Product[];

  @OneToMany(
    () => ProductVariantCategory,
    (productVariantCategories) => productVariantCategories.brand,
  )
  productVariantCategories: ProductVariantCategory[];

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

