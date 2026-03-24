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
import { DocumentType } from './enum/document-type.enum';

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
