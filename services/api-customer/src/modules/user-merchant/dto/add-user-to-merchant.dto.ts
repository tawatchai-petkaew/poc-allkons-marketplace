import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsArray, ArrayMinSize, ValidateNested, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * DTO for single user assignment to merchant
 */
export class AddUserToMerchantItemDto {
  @ApiProperty({ 
    description: 'User ID to add to merchant',
    example: 123 
  })
  @IsNumber()
  userId: number;

  @ApiProperty({ 
    description: 'Role ID for the user in merchant (optional)',
    example: 5,
    required: false
  })
  @IsNumber()
  @IsNotEmpty()
  roleId: number;
}

/**
 * DTO for adding users to merchant
 */
export class AddUsersToMerchantDto {
  @ApiProperty({ 
    description: 'Merchant ID to add users to',
    example: 107 
  })
  @IsNotEmpty()
  @IsNumber()
  merchantId: number;

  @ApiProperty({ 
    description: 'Array of users with their roles to add',
    type: [AddUserToMerchantItemDto],
    example: [
      { userId: 123, roleId: 5 },
      { userId: 456, roleId: 6 }
    ]
  })
  @IsArray()
  @ArrayMinSize(1, { message: 'At least one user must be provided' })
  @ValidateNested({ each: true })
  @Type(() => AddUserToMerchantItemDto)
  @IsNotEmpty({ each: true })
  users: AddUserToMerchantItemDto[];
}

/**
 * Response DTO for add users to merchant operation
 */
export class AddUsersToMerchantResponseDto {
  
  @ApiProperty({ description: 'Number of users added' })
  addedCount: number;

  @ApiProperty({ 
    description: 'Details of added users',
    example: [
      { userId: 123, merchantId: 107, roleId: 5, status: 'added' },
      { userId: 456, merchantId: 107, roleId: 6, status: 'already_exists' }
    ]
  })
  details: {
    userId: number;
    merchantId: number;
    roleId?: number;
    status: 'added' | 'already_exists' | 'failed';
    reason?: string;
  }[];
}
