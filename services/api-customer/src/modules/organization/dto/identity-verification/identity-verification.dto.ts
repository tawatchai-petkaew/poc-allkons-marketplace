import { IsOptional, IsNotEmpty, IsDateString, IsString, IsEnum, IsObject, ValidateNested, Length, IsBoolean } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { DocumentType } from '../../enum/organization.enum';

export class UploadIdentityVerificationDto {
  
  @IsNotEmpty()
  @IsBoolean()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  sendApproval: boolean;

  @IsNotEmpty()
  @IsString()
  organizationId: string;

  @IsNotEmpty()
  @IsEnum(DocumentType)
  documentType: DocumentType;
}

export interface VerificationDocument {
  id: string;
  documentType: string | null;
  fileName: string;
  fileType: string;
  fileSize: number;
  createdAt: string;
  updatedAt: string | null;
}