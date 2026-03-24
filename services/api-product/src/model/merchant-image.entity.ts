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

import { MerchantProduct } from './merchant-product.entity';
import { ImageUpload } from './image-upload.entity';

@Entity()
@Index('idx_merchant_image_merchant_product', ['merchantProductId'])
@Index('idx_merchant_image_image_upload', ['imageUploadId'])
export class MerchantImage extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  merchantProductId: number;

  @Column({ type: 'int' })
  imageUploadId: number;

  @Column({ type: 'int' })
  order: number;

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

  @Column({ type: 'int2', default: 1 })
  isSearchDirty: number;

  @ManyToOne(() => MerchantProduct, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'merchantProductId' })
  merchantProduct: MerchantProduct;

  @ManyToOne(() => ImageUpload, { onDelete: 'CASCADE' })
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

