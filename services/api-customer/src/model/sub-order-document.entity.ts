//create sub_order_document table
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
  JoinColumn,
  Index,
} from 'typeorm';

import { SubOrder } from './sub-order.entity';
import { FileUpload } from './file-upload.entity';

export enum DocumentType {
  PO = 'PO',
}

@Entity('sub_order_document')
@Index('idx_sub_order_document_subOrderId', ['subOrderId'])
@Index('idx_sub_order_document_fileId', ['fileId'])
export class SubOrderDocument extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  subOrderId: number;

  @ManyToOne(() => SubOrder, (subOrder) => subOrder.documents)
  subOrder: SubOrder;

  @Column({ type: 'enum', enum: DocumentType })
  documentType: DocumentType;

  @Column()
  fileId: number;

  @ManyToOne(() => FileUpload, (fileUpload) => fileUpload.id)
  @JoinColumn({ name: 'fileId', referencedColumnName: 'id' })
  file: FileUpload;

  @Column()
  @CreateDateColumn()
  createdAt: Date;

  @Column()
  @UpdateDateColumn()
  updatedAt: Date;

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
