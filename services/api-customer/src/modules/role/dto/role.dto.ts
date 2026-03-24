import { ApiProperty } from "@nestjs/swagger";

export class RoleResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  name: string;

  @ApiProperty()
  displayName: string;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty()
  organizeId: number;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty()
  isDefault: boolean;

  @ApiProperty()
  isClone: boolean;

  @ApiProperty()
  priority: number;
}