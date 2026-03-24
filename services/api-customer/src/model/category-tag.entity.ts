import {
  BaseEntity,
  BeforeInsert,
  BeforeUpdate,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { Category } from './category.entity';

@Entity()
@Index(['categoryId'])
@Index(['createdAt'])
@Index(['updatedAt'])
export class CategoryTag extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  categoryId: number;

  @Column({ nullable: true, length: 64 })
  tagName: string;

  @Column()
  @CreateDateColumn()
  createdAt: Date;

  @Column({ nullable: true, length: 256 })
  createdBy: string;

  @Column()
  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ nullable: true, length: 256 })
  updatedBy: string;

  @ManyToOne(() => Category, (category) => category.categoryTags)
  @JoinColumn({ name: 'categoryId' })
  category: Category;

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

