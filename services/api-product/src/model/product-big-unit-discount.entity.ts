import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  BeforeInsert,
  BeforeUpdate,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  DeleteDateColumn
} from 'typeorm';

export enum ProductBigUnitDiscountType {
  REMAIN = 'remain',
  DECREASE = 'decrease'
}

export enum ProductBigUnitDiscountUnitType {
  BATH = 'bath',
  PERCENT = 'percent'
}

@Entity()
export class ProductBigUnitDiscount extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'enum',
    enum: ProductBigUnitDiscountType,
    default: ProductBigUnitDiscountType.DECREASE
  })
  type: ProductBigUnitDiscountType;

  @Column({
    type: 'enum',
    enum: ProductBigUnitDiscountUnitType,
    default: ProductBigUnitDiscountUnitType.BATH
  })
  unitType: ProductBigUnitDiscountUnitType;

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
