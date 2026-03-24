import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
  BeforeInsert,
  BeforeUpdate,
  OneToOne,
} from 'typeorm';

import { BannerMerchant } from './banner-merchant.entity';
import { ImageUpload } from './image-upload.entity';

@Entity()
export class BannerMerchantApplication extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @CreateDateColumn()
  createdAt: Date;

  @Column()
  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  public deletedAt: Date;

  @OneToOne(
    () => BannerMerchant,
    (bannerMerchant) => bannerMerchant.bannerMerchantApplication,
  )
  @JoinColumn()
  bannerMerchant: BannerMerchant;

  @ManyToOne(
    () => ImageUpload,
    (imageUpload) => imageUpload.bannerMerchantApplications,
  )
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
