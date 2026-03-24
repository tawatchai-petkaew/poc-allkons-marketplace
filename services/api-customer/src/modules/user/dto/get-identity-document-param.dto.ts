import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';
import { UserUuidParamDto } from './user-uuid-param.dto';

export class GetIdentityDocumentParamDto extends UserUuidParamDto {
  @ApiProperty({
    example: 'd55f13fc-6a49-44b6-af95-04d282d68749',
    description: 'Document ID (UUID)',
  })
  @IsUUID()
  documentId: string;
}
