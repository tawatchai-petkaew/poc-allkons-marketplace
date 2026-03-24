import { ContactType, Platform, UsagePurposeType } from "@/model/organization-contact.entity";

export interface CreateOrganizationContact {
  userId: number;
  platform: Platform;
  cisNumber: string;
  contactType: ContactType;
  contact: string;
  usagePurposeType: UsagePurposeType;
  isVerify: boolean;
  isDefault: boolean;
  isKycDocument: boolean;
  organizeId?: number;
  organizeBranchId?: number;
  activeStatus?: boolean;
}
