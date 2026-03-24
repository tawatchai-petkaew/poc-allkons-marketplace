import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  BeforeInsert,
  BeforeUpdate,
} from 'typeorm';

export enum ProductDiscountType {
  REMAIN = 'remain',
  DECREASE = 'decrease',
}

export enum ProductDiscountUnitType {
  BATH = 'bath',
  PERCENT = 'percent',
}

@Entity()
export class ProductDiscount extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'enum',
    enum: ProductDiscountType,
    default: ProductDiscountType.DECREASE,
  })
  type: ProductDiscountType;

  @Column({
    type: 'enum',
    enum: ProductDiscountUnitType,
    default: ProductDiscountUnitType.BATH,
  })
  unitType: ProductDiscountUnitType;

  @Column({ type: 'float' })
  value: number;

  @Column({ nullable: true })
  startDate: Date;

  @Column({ nullable: true })
  endDate: Date;

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
