import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
  BeforeInsert,
} from 'typeorm';
import { User } from './user.entity';
import { ConsentMessage } from './consent-message.entity';

@Entity('user_consent')
@Unique(['userId', 'consentMessageId'])
export class UserConsent {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'int',
    nullable: true,
  })
  userId: number;

  @Column({
    type: 'int',
    nullable: true,
  })
  consentMessageId: number;

  @Column()
  @CreateDateColumn()
  acceptedAt: Date;

  @ManyToOne(() => User, (user) => user.userConsents)
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(
    () => ConsentMessage,
    (consentMessage) => consentMessage.userConsents,
  )
  @JoinColumn({ name: 'consentMessageId' })
  consentMessage: ConsentMessage;

  @BeforeInsert()
  createdAtWithTimezone() {
    const currentDate = new Date();
    this.acceptedAt = new Date(currentDate.getTime());
  }
}
