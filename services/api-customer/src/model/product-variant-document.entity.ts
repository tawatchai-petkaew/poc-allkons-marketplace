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
import { ImageUpload } from './image-upload.entity';

export enum ProductVariantDocumentType {
  HOWTO = 'Howto',
  SUGGESTION = 'Suggestion',
  CAUTION = 'Caution',
  CATALOG = 'Catalog',
  BIM = 'Bim',
}

@Entity()
@Index(['productVariantId'])
@Index(['imageUploadId'])
@Index(['documentType'])
@Index(['createdAt'])
@Index(['updatedAt'])
export class ProductVariantDocument extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  productVariantId: number;

  @Column()
  imageUploadId: number;

  @Column({
    type: 'enum',
    enum: ProductVariantDocumentType,
    default: ProductVariantDocumentType.HOWTO,
  })
  documentType: ProductVariantDocumentType;

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
    (productVariant) => productVariant.productVariantDocuments,
  )
  @JoinColumn({ name: 'productVariantId' })
  productVariant: ProductVariant;

  @ManyToOne(
    () => ImageUpload,
    (imageUpload) => imageUpload.productVariantDocuments,
  )
  @JoinColumn({ name: 'imageUploadId' })
  imageUpload: ImageUpload;

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

