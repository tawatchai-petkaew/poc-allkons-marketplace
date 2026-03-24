import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
  Unique,
  UpdateDateColumn,
  BeforeInsert,
  BeforeUpdate,
  Index,
} from 'typeorm';
import { UserConsent } from './user-consent.entity';

export enum ConsentType {
  PRIVACY_POLICY = 'privacy_policy',
  MARKETING_CONSENT = 'marketing_consent',
  AGENT_CONSENT = 'agent_consent',
  MANUFACTURER_CONSENT = 'manufacturer_consent',
  COOKIE_CONSENT = 'cookie_consent',
  TERMS_OF_SERVICE = 'terms_of_service',
}

export enum ConsentLanguage {
  TH = 'th',
  EN = 'en',
}

@Entity('consent_message')
@Unique(['consentType', 'version', 'language'])
@Index('IDX_consent_message_type_lang_created', ['consentType', 'language', 'createdAt'])
@Index('IDX_consent_message_type_version_lang', ['consentType', 'version', 'language'])
@Index('IDX_consent_message_type', ['consentType'])
@Index('IDX_consent_message_language', ['language'])
export class ConsentMessage {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'enum',
    enum: ConsentType,
    nullable: true,
    default: null,
  })
  consentType: ConsentType;

  @Column({
    type: 'varchar',
    length: 20,
  })
  version: string;

  @Column({
    type: 'enum',
    enum: ConsentLanguage,
    default: ConsentLanguage.TH,
  })
  language: ConsentLanguage;

  @Column({
    type: 'text',
    nullable: true,
  })
  content: string;

  @Column({
    type: 'text',
    nullable: true,
  })
  subject: string;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  akIdConsentId: string;

  @Column()
  @CreateDateColumn()
  createdAt: Date;

  @Column()
  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => UserConsent, (userConsent) => userConsent.consentMessage)
  userConsents: UserConsent[];

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
