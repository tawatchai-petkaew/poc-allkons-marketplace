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
} from 'typeorm';

import { Merchant } from './merchant.entity';
import { FileUploadType } from './enum/file-upload.enum';
import { OrderPaymentSlip } from './order-payment-slip.entity';

@Entity()
export class FileUpload extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  fileName: string;

  @Column({ nullable: true })
  name: string;

  @Column({ nullable: true })
  size: string;

  @Column()
  url: string;

  @Column({
    type: 'enum',
    enum: FileUploadType,
    default: FileUploadType.PERMANENT,
    nullable: true,
  })
  type: FileUploadType;

  @Column({ default: false })
  onDeletePermanent: boolean;

  @Column()
  @CreateDateColumn()
  createdAt: Date;

  @Column()
  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  public deletedAt: Date;

  @ManyToOne(() => Merchant, (merchant) => merchant.fileUploads)
  merchant: Merchant;

  @OneToMany(
    () => OrderPaymentSlip,
    (orderPaymentSlip) => orderPaymentSlip.fileUpload,
  )
  orderPaymentSlips: OrderPaymentSlip[];

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
