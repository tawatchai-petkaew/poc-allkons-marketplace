import {
  AddressTypeCis,
  CustomerProfileType,
  CustomerStatusCIS,
  DocumentAttachType,
  DocumentTypeCis,
  GenderCIS,
  JuristicTypeCIS,
  KycStatusCIS,
  MaritalStatusCIS,
  OrganizeTypeCIS,
  PlatformCIS,
} from '../enum/cis.enum';

export interface CreateProfileCis {
  app_id: string;
  allkons_id: string;
  first_name: string;
  middle_name: string;
  last_name: string;
  is_allow_concern: boolean;
  customer_status: number;
  active_status: boolean;
}

export interface CreateCustomerPlatform {
  app_id: string;
  cis_number: string;
  platform: number;
  create_relationship_date: string;
  active_status: boolean | null;
}

export interface CreateContactProfileCis {
  app_id: string;
  cis_number: string;
  platform: number;
  contact_type: number;
  usage_purpose_type: number;
  contact: string;
  active_status?: boolean;
  is_verify?: boolean;
  is_default?: boolean;
  is_kyc_document?: boolean;
}

export interface CreateOraganiztionProfileCis {
  app_id: string;
  customer_profile_type: CustomerProfileType;
  customer_status: CustomerStatusCIS;
  juristic_name: string;
  juristic_type: JuristicTypeCIS;
  juristic_type_remark?: string | null;
  branch_number?: string | null;
  organize_type: OrganizeTypeCIS;
  tax_id: string;
  contact_shown_highest_authority: boolean;
  is_dopa: boolean;
  is_dbd: boolean;
  kyc_status: KycStatusCIS;
  active_status: boolean;
  business_registration?: {
    business_name: string;
    registration_number: string;
  };
}

export interface CreateRelationshipCis {
  app_id: string;
  cis_number: string;
  related_cis_number: string;
  relationship_type: number;
  create_relationship_date: string;
  role: string;
  is_owner: boolean;
}

export interface CheckExistEmailCis {
  app_id: string;
  customer_profile_type: CustomerProfileType;
  email_platform: number;
  email: string;
  email_usage_purpose: number;
}

export interface UpdateUserValueCis {
  app_id: string;
  cis_number: string;
  type: string;
  values: number[];
  other_description?: string;
}

export interface AddressInfoCis {
  address_info: string;
  country: number | null;
  province: number | null;
  district: number | null;
  sub_district: number | null;
  zipcode: number | null;
  country_name?: string | null;
  province_name?: string | null;
  district_name?: string | null;
  sub_district_name?: string | null;
  zipcode_name?: string | null;
}

export interface AddVerifyUserInfoCis {
  app_id: string;
  cis_number: string;
  first_name: string;
  middle_name: string | null;
  last_name: string;
  first_name_en: string;
  middle_name_en: string | null;
  last_name_en: string;
  birth_day: Date;
  gender: GenderCIS;
  marital_status: MaritalStatusCIS;
  id_card_number: string;
  address_according_id_card?: AddressInfoCis;
  current_address?: AddressInfoCis;
  current_address_shown_id_card?: boolean;
  is_dopa?: boolean;
}

export interface FindAllMasterDataRequest {
  app_id: string;
  is_delete: boolean;
  master_code: string;
  active_status: boolean;
}

export interface DocumentAttachItem {
  document_attach_type: DocumentAttachType;
  document_id: string;
  document_type?: DocumentTypeCis;
  expired_date?: string;
}

export interface UpdateStatusVerifyRequest {
  app_id: string;
  cis_number: string;
  status: KycStatusCIS;
}
export interface GetAttachDocumentsRequest {
  app_id: string;
  cis_number: string;
  document_attach_type: DocumentAttachType;
  is_expire?: boolean | null;
  is_delete?: boolean | null;
}

export interface GetDocumentRequest {
  app_id: string;
  id: string;
}

export interface GetFileDocumentsRequest {
  app_id: string;
  file_path: string;
}

export interface CreateCustomerAddressCis {
  app_id: string;
  cis_number: string;
  address_type: AddressTypeCis;
  platform: PlatformCIS;
  address_name: string;
  address_info: string;
  address_detail?: string;
  street?: string | null;
  country: number;
  province: number;
  district: number;
  sub_district: number;
  zipcode: number;
  country_name?: string | null;
  province_name?: string | null;
  district_name?: string | null;
  sub_district_name?: string | null;
  zipcode_name?: string | null;
  latitude?: string | null;
  longitude?: string | null;
  is_default: boolean;
  contact_name?: string | null;
  contact_phone_number?: string | null;
  personal_type?: string | null;
  personal_tax_id_type?: string | null;
  tax_id?: string | null;
  branch_type?: string | null;
  branch_number?: string | null;
  juristic_type_id?: string | null;
  contact_email?: string | null;
  is_kyc_document?: boolean;
  tax_invoice_juristic_type?: number | null;
  tax_invoice_juristic_name?: string | null;
  tax_invoice_type?: string | null;
  tax_invoice_customer_type?: number | null;
  tax_invoice_tax_id?: string | null;
  is_tax_invoice?: boolean | null;
  branch?: number | null;
}

export interface UpdateCustomerAddressCis extends CreateCustomerAddressCis {
  id: string;
}

export interface GetVerifyUserInfoCis {
  app_id: string;
  cis_number: string;
}

export interface GetCustomerAddressDetailCis {
  id: string | string[];
  app_id: string;
  cis_number: string;
  address_type: number;
  platform: number;
  is_default?: boolean;
  is_kyc_document?: boolean | null;
}

export interface UpdatePersonalProfileCis {
  app_id: string;
  cis_number: string;
  first_name: string;
  middle_name: string | null;
  last_name: string;
  is_allow_concern: boolean;
  customer_status: number;
  active_status: boolean | null;
}

export interface UpdateJuristicProfileCis {
  app_id: string;
  cis_number: string;
  customer_profile_type: CustomerProfileType;
  customer_status: CustomerStatusCIS;
  juristic_name: string;
  juristic_type: JuristicTypeCIS;
  juristic_type_remark?: string | null;
  branch_number?: string | null;
  organize_type: OrganizeTypeCIS;
  tax_id: string;
  contact_shown_highest_authority: boolean;
  is_dopa: boolean;
  is_dbd: boolean;
  kyc_status: KycStatusCIS;
  active_status: boolean;
  highest_authority?: UpdateHighestAuthorityCis;
  contact?: UpdateContactCis;
  business_registration?: UpdateBusinessRegistration | null;
}

interface UpdateBusinessRegistration {
  business_name: string;
  registration_number: string;
}

interface UpdateHighestAuthorityCis {
  highest_authority_name: string;
  highest_authority_position: string;
  highest_authority_phone_number: string;
  highest_authority_email: string;
}

interface UpdateContactCis {
  contact_name: string;
  contact_phone_number: string;
  contact_email: string;
}

export interface CustomerCheckExistRequest {
  app_id: string;
  type: string;
  tax_id: string;
  registration_number: string | null;
}

export interface GetCustomerRelationShip {
  app_id: string;
  cis_number: string;
  related_cis_number: string;
  relationship_type: number;
}

export interface UpdateContactProfileCis {
  app_id: string;
  id: string;
  platform: number;
  contact_type: number;
  usage_purpose_type: number;
  contact: string;
  active_status?: boolean;
  is_verify?: boolean;
  is_default?: boolean;
  is_kyc_document?: boolean;
}

export interface DeleteContactProfileCis {
  app_id: string;
  id: string;
}
