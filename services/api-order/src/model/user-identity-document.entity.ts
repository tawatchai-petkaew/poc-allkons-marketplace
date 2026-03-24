import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  BeforeUpdate,
  BeforeInsert,
  BaseEntity,
} from 'typeorm';

import { DraftOrganize } from './draft-organize.entity';
export enum DocumentType {
  ID_CARD_FRONT = 'ID_CARD_FRONT',
  ID_CARD_BACK = 'ID_CARD_BACK',
  ID_CARD_WITH_PERSON = 'ID_CARD_WITH_PERSON',
  COPY_OF_ID_OR_PASSPORT_AUTHORIZED_PERSON = 'COPY_OF_ID_OR_PASSPORT_AUTHORIZED_PERSON',
  COPY_OF_COMPANY_REGISTRATION = 'COPY_OF_COMPANY_REGISTRATION',
  COPY_OF_VAT_REGISTRATION = 'COPY_OF_VAT_REGISTRATION',
  COPY_OF_FINANCIAL_EVIDENCE = 'COPY_OF_FINANCIAL_EVIDENCE',
  COPY_OF_BANK_ACCOUNT_RECEIVING_PAYMENTS = 'COPY_OF_BANK_ACCOUNT_RECEIVING_PAYMENTS',
  PHOTO_OF_COMPANY_OR_PROJECT = 'PHOTO_OF_COMPANY_OR_PROJECT',
  TRADEMARK = 'TRADEMARK',
  POWER_OF_ATTORNEY = 'POWER_OF_ATTORNEY',
  COPY_OF_ID_OR_PASSPORT_ATTORNEY_GIVER = 'COPY_OF_ID_OR_PASSPORT_ATTORNEY_GIVER',
  OTHERS = 'OTHERS',
  COPY_OF_HOUSE_REGISTRATION_AUTHORIZED_PERSON = 'COPY_OF_HOUSE_REGISTRATION_AUTHORIZED_PERSON',
  COMMERCIALLY_REGISTERED = 'COMMERCIALLY_REGISTERED',
}
@Entity('user_identity_documents')
@Index(['draftOrganizeId'])
@Index(['documentType'])
export class UserIdentityDocument extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  draftOrganizeId: number;

  @Column({
    name: 'document_type',
    type: 'enum',
    enum: DocumentType,
  })
  documentType: DocumentType;

  @Column({
    type: 'text',
    comment: 'Base64 encoded file content',
  })
  fileBase64: string;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  fileName?: string;

  @Column({
    type: 'varchar',
    length: 50,
    nullable: true,
    comment: 'MIME type of the file',
  })
  fileType?: string;

  @Column({
    type: 'int',
    nullable: true,
    comment: 'File size in bytes',
  })
  fileSize?: number;

  @Column({
    type: 'varchar',
    length: 50,
    nullable: true,
    comment: 'Response id by CIS system',
  })
  cisNumber?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ManyToOne(() => DraftOrganize)
  @JoinColumn({ name: 'draftOrganizeId' })
  draftOrganize: DraftOrganize;

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
