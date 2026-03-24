import { CustomerProfileType, DocumentAttachType, DocumentTypeCis } from "../enum/cis.enum";

export interface CisResponse {
  code: string;
  message: string;
  //Todo: [Major] Change any to specific type
  data: GetAttachDocumentsResponse | GetIdentityVerificationResponse | any;
}

export interface GetAttachDocumentsResponse {
  cis_number: string;
  document_attach_type: DocumentAttachType;
  customer_profile_type: CustomerProfileType;
  documents: [];
}

export interface GetIdentityVerificationResponse {
  documents: VerificationDocument[];
}

export interface VerificationDocument {
  id: string;
  document_type: DocumentTypeCis,
  expired_date: null,
  is_expired: null,
  customer_profile_type: CustomerProfileType,
  file_name: string,
  file_size: number,
  file_type: string,
  file_extension: string,
  file_path: string,
  create_at: string,
  update_at: null,
}

export interface AddressFindOneResponse {
  code: string;
  message: string;
  data: AddressData;
}

export interface AddressData {
  id: string;
  cis_number: string;
  address_type: number;
  platform: number;
  address_name: string;
  address_info: string;
  street: string | null;
  country: number;
  province: number;
  district: number;
  sub_district: number;
  zipcode: number;
  country_name: string;
  province_name: string;
  district_name: string;
  sub_district_name: string;
  zipcode_name: string;
  latitude: string | null;
  longitude: string | null;
  is_default: boolean;
  contact_name: string;
  contact_phone_number: string;
  contact_email: string | null;
  address_detail: string | null;
  create_at: string;
  create_by: string;
  create_by_platform: string;
  update_at: string | null;
  update_by: string | null;
  update_by_platform: string | null;
  tax_invoice_juristic_type: string | null;
  tax_invoice_juristic_name: string | null;
  tax_invoice_type: string | null;
  tax_invoice_customer_type: string | null;
  tax_invoice_tax_id: string | null;
  active_status: boolean;
  parent: string | null;
  branch: string | null;
  is_under_another_address: boolean | null;
  is_tax_invoice: boolean | null;
}
