import { ApiProperty } from '@nestjs/swagger';
import {
  LeaveStatus,
  OrganizationLeaveLog,
} from '../../../../model/organization-leave-log.entity';

class UserInfoDto {
  @ApiProperty({
    description: 'User ID',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: 'User UUID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  uuid: string;

  @ApiProperty({
    description: 'User first name',
    example: 'John',
  })
  firstName: string;

  @ApiProperty({
    description: 'User middle name',
    example: 'M.',
  })
  middleName: string;

  @ApiProperty({
    description: 'User last name',
    example: 'Doe',
  })
  lastName: string;
}

class RoleInfoDto {
  @ApiProperty({
    description: 'Role ID',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: 'Role name',
    example: 'Admin',
  })
  name: string;

  @ApiProperty({
    description: 'Role display name',
    example: 'Admin',
  })
  displayName: string;
}

export class LeaveRequestResponseDto {
  @ApiProperty({
    description: 'Leave request ID',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: 'User who requested to leave',
  })
  user: UserInfoDto;

  @ApiProperty({
    description: 'Role information',
  })
  role: RoleInfoDto;

  @ApiProperty({
    description: 'Leave request status',
    enum: LeaveStatus,
    example: LeaveStatus.PENDING,
  })
  leaveStatus: LeaveStatus;

  @ApiProperty({
    description: 'Created date',
    example: '2025-09-15T10:30:00Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Updated date',
    example: '2025-09-15T10:30:00Z',
  })
  updatedAt: Date;

  public static formatResponse(
    LeaveRequest: OrganizationLeaveLog,
  ): LeaveRequestResponseDto {
    const response = new LeaveRequestResponseDto();
    response.id = LeaveRequest.id;
    response.user = {
      id: LeaveRequest.user.id,
      uuid: LeaveRequest.user.uuid,
      firstName: LeaveRequest.user.firstNameTh,
      middleName: LeaveRequest.user.middleNameTh,
      lastName: LeaveRequest.user.lastNameTh,
    };
    response.role = {
      id: LeaveRequest.role.id,
      name: LeaveRequest.role.name,
      displayName: LeaveRequest.role.displayName,
    };
    response.leaveStatus = LeaveRequest.leaveStatus;
    response.createdAt = LeaveRequest.createdAt;
    response.updatedAt = LeaveRequest.updatedAt;
    return response;
  }
}

export class GetLeaveRequestsResponseDto {
  @ApiProperty({
    description: 'List of leave requests',
    type: [LeaveRequestResponseDto],
  })
  leaveRequests: LeaveRequestResponseDto[];

  @ApiProperty({
    description: 'Total number of leave requests',
    example: 10,
  })
  total: number;

  @ApiProperty({
    description: 'Current page',
    example: 1,
  })
  page: number;

  @ApiProperty({
    description: 'Items per page',
    example: 10,
  })
  limit: number;

  public static formatResponse(
    leaveRequests: OrganizationLeaveLog[],
    total: number,
    page: number,
    limit: number,
  ): GetLeaveRequestsResponseDto {
    const response = new GetLeaveRequestsResponseDto();
    response.leaveRequests = leaveRequests.map((leaveLog) => ({
      id: leaveLog.id,
      user: {
        id: leaveLog.user.id,
        uuid: leaveLog.user.uuid,
        firstName: leaveLog.user.firstNameTh,
        middleName: leaveLog.user.middleNameTh,
        lastName: leaveLog.user.lastNameTh,
      },
      role: {
        id: leaveLog.role.id,
        name: leaveLog.role.name,
        displayName: leaveLog.role.displayName,
      },
      leaveStatus: leaveLog.leaveStatus,
      createdAt: leaveLog.createdAt,
      updatedAt: leaveLog.updatedAt,
    }));
    response.total = total;
    response.page = page;
    response.limit = limit;
    return response;
  }
}

export class CreateLeaveRequestResponseDto {
  @ApiProperty({
    description: 'Leave request ID',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: 'User ID who requested to leave',
  })
  userId: number;

  @ApiProperty({
    description: 'Organization ID',
    example: 1,
  })
  organizationId: number;

  @ApiProperty({
    description: 'Role ID',
    example: 1,
  })
  roleId: number;

  @ApiProperty({
    description: 'Leave request status',
    enum: LeaveStatus,
    example: LeaveStatus.PENDING,
  })
  leaveStatus: LeaveStatus;

  @ApiProperty({
    description: 'Created date',
    example: '2025-09-15T10:30:00Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Updated date',
    example: '2025-09-15T10:30:00Z',
  })
  updatedAt: Date;
}
