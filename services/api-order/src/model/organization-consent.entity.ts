import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  DeleteDateColumn,
  BeforeInsert,
  BeforeUpdate,
} from 'typeorm';
import { Organization } from './organiztion.entity';
import { ConsentMessage } from './consent-message.entity';

@Entity('organization_consent')
export class OrganizationConsent extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', nullable: false })
  organizeId: number;

  @Column({ type: 'int', nullable: false })
  consentMsgId: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;

  // Relationships
  @ManyToOne(() => Organization)
  @JoinColumn({ name: 'organizeId' })
  organization: Organization;

  @ManyToOne(() => ConsentMessage)
  @JoinColumn({ name: 'consentMsgId' })
  consentMessage: ConsentMessage;

  @BeforeInsert()
  private beforeInsert(): void {
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  @BeforeUpdate()
  private beforeUpdate(): void {
    this.updatedAt = new Date();
  }
}
