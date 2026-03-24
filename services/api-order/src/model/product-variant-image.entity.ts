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
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ProductVariant } from './product-variant.entity';
import { ImageUpload } from './image-upload.entity';

@Entity()
@Index(['productVariantId'])
@Index(['imageUploadId'])
@Index(['createdAt'])
@Index(['updatedAt'])
export class ProductVariantImage extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  productVariantId: number;

  @Column()
  imageUploadId: number;

  @Column()
  order: number;

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

  @ManyToOne(
    () => ProductVariant,
    (productVariant) => productVariant.productVariantImages,
  )
  @JoinColumn({ name: 'productVariantId' })
  productVariant: ProductVariant;

  @ManyToOne(
    () => ImageUpload,
    (imageUpload) => imageUpload.productVariantImages,
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
