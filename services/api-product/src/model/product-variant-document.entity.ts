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

export enum DocumentType {
  HOWTO = 'Howto',
  SUGGESTION = 'Suggestion',
  CAUTION = 'Caution',
  CATALOG = 'Catalog',
  BIM = 'Bim',
}

@Entity()
@Index('iX_product_variant_document_productVariantId', ['productVariantId'])
@Index('iX_product_variant_document_imageUploadId', ['imageUploadId'])
@Index('iX_product_variant_document_documentType', ['documentType'])
@Index('iX_product_variant_document_createdAt', ['createdAt'])
@Index('iX_product_variant_document_updatedAt', ['updatedAt'])
export class ProductVariantDocument extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  productVariantId: number;

  @Column()
  imageUploadId: number;

  @Column({
    type: 'enum',
    enum: DocumentType,
    default: DocumentType.HOWTO,
  })
  documentType: DocumentType;

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

  @ManyToOne(() => ProductVariant, (productVariant) => productVariant.productVariantDocuments)
  @JoinColumn({ name: 'productVariantId' })
  productVariant: ProductVariant;

  @ManyToOne(() => ImageUpload)
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

