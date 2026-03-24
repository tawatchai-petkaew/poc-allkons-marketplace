import { LeaveStatus } from '@/model/organization-leave-log.entity';
import { BaseQueryDto } from '@/utils/dto/pagination.dto';
import { ApiProperty, PartialType, PickType } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, Min } from 'class-validator';

export class CreateLeaveRequestDto {
  @ApiProperty({
    description: 'Organization ID that user wants to leave',
    example: 1
  })
  @IsNotEmpty()
  @IsNumber()
  organizationId: number;

  @ApiProperty({
    description: 'User ID who is requesting to leave',
    example: 1,
    required: false
  })
  @IsNumber()
  userId?: number;
}

export class UpdateLeaveRequestDto {
  @ApiProperty({
    description: 'New leave request status',
    enum: LeaveStatus,
    example: LeaveStatus.APPROVED
  })
  @IsNotEmpty()
  @IsEnum(LeaveStatus)
  status: LeaveStatus;
}

export class GetLeaveRequestsQueryDto {
  @ApiProperty({
    description: 'Page number',
    example: 1,
    required: false,
    default: 1
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiProperty({
    description: 'Items per page',
    example: 10,
    required: false,
    default: 10
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number = 10;

  @ApiProperty({
    description: 'Filter by leave status',
    enum: LeaveStatus,
    required: false
  })
  @IsOptional()
  @IsEnum(LeaveStatus)
  status?: LeaveStatus;

  @ApiProperty({
    description: 'Filter by user ID',
    example: 1,
    required: false
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  userId?: number;
}


// Simplified DTO for creating leave request (userId is optional)
export class CreateExitRequestDto extends PartialType(
  PickType(CreateLeaveRequestDto, ['userId'] as const),
) { }

export class GetExitRequestsQueryDto extends BaseQueryDto {
  @ApiProperty({
    required: false,
    description:
      'Filter by leave statuses (comma-separated or array). If not provided, returns all statuses.',
    enum: LeaveStatus,
    isArray: true,
    example: ['PENDING', 'APPROVED', 'REJECTED'],
  })
  @IsOptional()
  @IsEnum(LeaveStatus, { each: true })
  @Transform(({ value }) => {
    if (!value) return undefined;
    if (Array.isArray(value)) return value;
    if (typeof value === 'string') return value.split(',').map((s) => s.trim());
    return [value];
  })
  status?: LeaveStatus[];
}
