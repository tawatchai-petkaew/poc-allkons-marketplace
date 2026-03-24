import { JuristicTypeValue } from '@/modules/organization/enum/organization.enum';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  BeforeInsert,
  BeforeUpdate,
} from 'typeorm';

export enum JuristicTypeLanguage {
  TH = 'th',
  EN = 'en',
}

@Entity('juristic_type')
export class JuristicType {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'varchar',
  })
  label: string;

  @Column({
    type: 'enum',
    enum: JuristicTypeValue,
    nullable: false,
    default: null,
  })
  value: JuristicTypeValue;

  @Column({
    type: 'varchar',
    nullable: true,
    default: null,
  })
  prefix: string;

  @Column({
    type: 'varchar',
    nullable: true,
    default: null,
  })
  subfix: string;

  @Column({
    type: 'enum',
    enum: JuristicTypeLanguage,
    default: JuristicTypeLanguage.TH,
  })
  language: JuristicTypeLanguage;

  @Column()
  @CreateDateColumn()
  createdAt: Date;

  @Column()
  @UpdateDateColumn()
  updatedAt: Date;

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
