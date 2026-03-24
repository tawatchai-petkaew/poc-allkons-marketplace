import { KycStatusCIS } from "@/modules/cis/enum/cis.enum";

export interface SendVerifyStatusInfo {
  cisNumber: string;
  kycStatus: KycStatusCIS;
  reason?: string;
}

export interface messageTemplate {
  orgName: string;
  kycStatus: KycStatusCIS;
  reason?: string;
}

export type StatusType = 'SUCCESS' | 'FAIL';

export interface SendVerifyStatusResponse {
  status: StatusType;
  message: string;
}