import { CustomerProfileType, CustomerStatusCIS, JuristicTypeCIS, KycStatusCIS, OrganizeTypeCIS } from "../enum/cis.enum";

export interface CreateJuristicProfilePayload {
  customer_profile_type: CustomerProfileType;
  customer_status: CustomerStatusCIS;
  juristic_name: string;
  juristic_type: JuristicTypeCIS;
  organize_type: OrganizeTypeCIS;
  tax_id: string;
  kyc_status: KycStatusCIS;
  branch_number?: string;
  juristic_type_remark?: string | null;
  businessRegistration?: BusinessRegistration;
  remark_type_other?: string | null;
}

export interface BusinessRegistration {
  registration_number: string;
  business_name: string;
}