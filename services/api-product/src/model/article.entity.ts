import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  BeforeInsert,
  BeforeUpdate,
  OneToMany,
  Index,
  JoinColumn
} from 'typeorm';

import { BannerMerchant } from './banner-merchant.entity';
import { BannerPromotion } from './banner-promotion.entity';
import { ImageUpload } from './image-upload.entity';
import { Merchant } from './merchant.entity';

@Entity()
@Index('IDX_article_merchant_id', ['merchantId'])
@Index('IDX_article_is_published', ['isPublished'])
@Index('IDX_article_tag', ['tag'])
@Index('IDX_article_name', ['name'])
@Index('IDX_article_released_at', ['releasedAt'])
export class Article extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column('text', { nullable: true })
  content: string;

  @Column('text', { array: true, nullable: true })
  tag: string[];

  @Column()
  releasedAt: Date;

  @Column()
  isPublished: boolean;

  @Column('text', { nullable: true })
  titleSeo: string;

  @Column('text', { nullable: true })
  descriptionSeo: string;

  @Column({ nullable: true })
  urlSlug: string;

  @Column('text', { array: true, nullable: true })
  keywordSeo: string[];

  @Column()
  @CreateDateColumn()
  createdAt: Date;

  @Column()
  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  public deletedAt: Date;

  @Column({ nullable: true })
  merchantId: number;

  @ManyToOne(() => Merchant, (merchant) => merchant.articles)
  @JoinColumn({ name: 'merchantId' })
  merchant: Merchant;

  @ManyToOne(() => ImageUpload, (imageUpload) => imageUpload.articles)
  imageUpload: ImageUpload;

  @OneToMany(() => BannerMerchant, (bannerMerchants) => bannerMerchants.article)
  bannerMerchants: BannerMerchant[];

  @OneToMany(
    () => BannerPromotion,
    (bannerPromotions) => bannerPromotions.article
  )
  bannerPromotions: BannerPromotion[];

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
