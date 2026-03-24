import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

import { User } from './user.entity';
import { HistorySearchProductType } from './enum/historySearchProduct.enum';

@Entity()
export class HistorySearchProduct extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  keyword: string;

  @Column({
    type: 'enum',
    enum: HistorySearchProductType,
  })
  type: HistorySearchProductType;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.id)
  @JoinColumn({ name: 'userId' })
  user: User;
}
