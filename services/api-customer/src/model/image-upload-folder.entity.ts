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
  OneToMany
} from 'typeorm';

import { Merchant } from './merchant.entity';
import { ImageUpload } from './image-upload.entity';

@Entity()
export class ImageUploadFolder extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    default: 'default'
  })
  name: string;

  @Column()
  @CreateDateColumn()
  createdAt: Date;

  @Column()
  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Merchant, (merchant) => merchant.imageUploadFolders)
  merchant: Merchant;

  @OneToMany(
    () => ImageUpload,
    (imageUploads) => imageUploads.imageUploadFolder
  )
  imageUploads: ImageUpload[];

  @DeleteDateColumn({ name: 'deleted_at' })
  public deletedAt: Date;

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
