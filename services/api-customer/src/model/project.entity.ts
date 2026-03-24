import {
  BaseEntity,
  BeforeInsert,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Organization } from './organization.entity';
import { IsNotEmpty, IsString } from 'class-validator';

export enum ProjectStatus {
  ACTIVE = 'active',
  IN_ACTIVE = 'inActive',
  DELETED = 'deleted',
}

@Entity('project')
export class Project extends BaseEntity {
  constructor(partial: Partial<Project>) {
    super();
    Object.assign(this, partial);
  }

  @PrimaryGeneratedColumn()
  id: number;

  @IsString()
  @IsNotEmpty()
  @Column({
    type: 'varchar',
    length: 255,
  })
  name: string;

  @Column({
    type: 'int',
  })
  userId: number;

  @Column({
    type: 'int',
  })
  organizeId: number;

  @Column()
  @CreateDateColumn()
  createdAt: Date;

  @Column()
  @DeleteDateColumn()
  deletedAt: Date;

  @BeforeInsert()
  createdAtWithTimezone() {
    const currentDate = new Date();
    this.createdAt = new Date(currentDate.getTime());
  }

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => Organization)
  @JoinColumn({ name: 'organizeId' })
  organization: Organization;

  @Column({
    type: 'enum',
    enum: ProjectStatus,
    default: ProjectStatus.ACTIVE,
  })
  status: ProjectStatus;
}
