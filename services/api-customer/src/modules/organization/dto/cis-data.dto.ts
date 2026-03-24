import {
  JuristicTypeCIS,
  RoleBusinessTypeCIS,
} from '@/modules/cis/enum/cis.enum';
import { OrganizationBranchType } from '../enum/organization.enum';

export interface OrgInfoPersonal {
  businessType: RoleBusinessTypeCIS;
  juristicType: JuristicTypeCIS;
  mainPhoneNumber: string;
  otherPhoneNumber: string;
  mainEmail: string;
  idCard: string;
  organizeName: string;
}

export interface OrgInfoJuristic {
  organizeName: string;
  businessType: RoleBusinessTypeCIS;
  taxId: string;
  juristicType: JuristicTypeCIS;
  type: OrganizationBranchType;
  mainPhoneNumber: string;
  otherPhoneNumber: string;
  mainEmail: string;
  juristicTypeId: number;
  branchName: string;
}

export interface OrgInfoRegisteredIndividual {
  businessType: RoleBusinessTypeCIS;
  juristicType: JuristicTypeCIS;
  mainPhoneNumber: string;
  otherPhoneNumber: string;
  mainEmail: string;
  idCard: string;
  organizeName: string;
  commercialName: string;
  registrationNumber: string;
  isUseFullName: string;
}

export interface ContactInfo {
  highestAuthority: HighestAuthority;
  contact: Contact;
  contactShownHighestAuthority: boolean;
}

export interface Contact {
  contactName: string;
  contactPhoneNumber: string;
  contactEmail: string;
}

export interface HighestAuthority {
  highestAuthorityName: string;
  highestAuthorityPosition: string;
  highestAuthorityPhoneNumber: string;
  highestAuthorityEmail: string;
}

export interface AddressInfo {
  addressIdCard: Address;
  addressCurrent: Address;
  addressTaxInvoice: Address;
}

export interface Address {
  usedAddress?: string;
  address: string;
  zipCode: string;
  subDistrictId: string;
  subDistrictNameTh: string;
  districtId: string;
  districtNameTh: string;
  provinceId: string;
  provinceNameTh: string;
  countryId: string;
}
