import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsEnum } from 'class-validator';
import { Transform } from 'class-transformer';
import { UserOrganizationInviteStatus } from '@/model/enum/user-organization.enum';
import { BaseQueryDto } from '@/utils/dto/pagination.dto';

export class GetInvitationsQueryDto extends BaseQueryDto {
  @ApiProperty({
    required: false,
    description:
      'Filter by invitation statuses (comma-separated or array). If not provided, returns all statuses.',
    enum: UserOrganizationInviteStatus,
    isArray: true,
    example: ['SENT', 'ACCEPTED', 'EXPIRED', 'REJECTED'],
  })
  @IsOptional()
  @IsEnum(UserOrganizationInviteStatus, { each: true })
  @Transform(({ value }) => {
    if (!value) return undefined;
    if (Array.isArray(value)) return value;
    if (typeof value === 'string') return value.split(',').map((s) => s.trim());
    return [value];
  })
  inviteStatus?: UserOrganizationInviteStatus[];
}
