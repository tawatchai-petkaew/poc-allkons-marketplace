import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose, Type } from 'class-transformer';

@Exclude()
export class RoleResponseDto {
  @ApiProperty({
    type: Number,
    description: 'id',
    example: 1,
  })
  @Expose()
  id: number;

  @ApiProperty({
    type: String,
    description: 'role name',
    example: 'SUPER_ADMIN',
  })
  @Expose()
  name: string;

  @ApiProperty({
    type: String,
    description: 'role display name',
    example: 'Super Admin',
  })
  @Expose()
  displayName: string;

  @ApiProperty({
    type: String,
    description: 'description of role',
    example: 'Super Admin role',
  })
  @Expose()
  description: string;

  @ApiProperty({
    type: String,
    description: 'Flag สำหรับเช็กว่าเป็นบทบาทโดยระบบ',
    example: false,
  })
  @Expose()
  isDefault: boolean;

  @ApiProperty({
    type: String,
    description: 'Flag สำหรับเช็กว่าต้องการ clone บทบาทนี้มั้ย',
    example: false,
  })
  @Expose()
  isClone: boolean;

  @ApiProperty({
    type: Number,
    description: 'Organization id',
    example: 277,
  })
  @Expose()
  organizeId: number;
}

@Exclude()
export class RoleListResponseDto {
  @ApiProperty({
    type: [RoleResponseDto],
  })
  @Expose()
  @Type(() => RoleResponseDto)
  roles: RoleResponseDto[];

  @ApiProperty({
    type: Number,
    description: 'total',
    example: 1,
  })
  @Expose()
  total: number;

  @ApiProperty({
    type: Number,
    description: 'page',
    example: 1,
  })
  @Expose()
  page: number;

  @ApiProperty({
    type: Number,
    description: 'limit',
    example: 10,
  })
  @Expose()
  limit: number;

  @ApiProperty({
    type: Number,
    description: 'total page',
    example: 1,
  })
  @Expose()
  totalPages: number;
}
