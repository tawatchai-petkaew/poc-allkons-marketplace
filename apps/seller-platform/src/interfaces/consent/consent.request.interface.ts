export interface IUserConsentPayload {
  phoneNumber: string;
  consentIds: number[];
  akIdConsentIds?: string[];
  tokenAllkonsId?: string;
}

export interface IOrganizationConsentPayload {
  organizationId: number;
  consentIds: number[];
  akIdConsentIds?: string[];
  tokenAllkonsId?: string;
}
