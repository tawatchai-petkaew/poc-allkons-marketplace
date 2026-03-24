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

export enum RegisterAdminType {
  PUBLIC = 'public',
  PRIVATE = 'private',
  UNAVAILABLE = 'unavailable',
}

export enum CreateMerchantType {
  PUBLIC = 'public',
  PRIVATE = 'private',
  UNAVAILABLE = 'unavailable',
}

@Entity()
export class ShopditGlobalConfig extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'enum',
    enum: RegisterAdminType,
    default: RegisterAdminType.PUBLIC,
  })
  registerAdminType: RegisterAdminType;

  @Column({
    type: 'enum',
    enum: CreateMerchantType,
    default: CreateMerchantType.PUBLIC,
  })
  createMerchantType: CreateMerchantType;

  @Column({ default: true })
  enableFlashsalePortal: boolean;

  @Column({ default: false })
  skipVerifyAdminEmail: boolean;

  @Column({ nullable: true })
  key: string;

  @Column({ nullable: true, type: 'jsonb' })
  data: Record<string, unknown>;

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
