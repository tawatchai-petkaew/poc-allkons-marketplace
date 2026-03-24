import { OrganizationType } from './user-with-org.response.interface';

export interface IPersonalInfo {
  idCard: string;
  acceptTerms: boolean;
}

export interface IRegisteredIndividualInfo {
  idCard: string;
  registrationName: string;
  businessType: string[];
  registrationNumber: string;
  acceptTerms: boolean;
  businessTypeDescription?: string;
}

export interface IJuristicInfo {
  juristicName: string;
  businessType: string[];
  taxId: string;
  juristicType: string;
  juristicTypeId: number;
  branchType: string;
  branchNumber: string;
  branchName: string;
  acceptTerms: boolean;
  businessTypeDescription?: string;
  remarkTypeOther?: string;
}

export interface ICreateOrganizationBasePayload {
  userId?: string;
  countryCode?: string;
  phoneNumber?: string;
  skipRegister: boolean;
  organizationType: OrganizationType;
}

export interface ICreatePersonalOrganizationPayload extends ICreateOrganizationBasePayload {
  organizationType: OrganizationType.PERSONAL;
  personalInfo: IPersonalInfo;
}

export interface ICreateRegisteredIndividualOrganizationPayload extends ICreateOrganizationBasePayload {
  organizationType: OrganizationType.REGISTERED_INDIVIDUAL;
  registeredIndividualInfo: IRegisteredIndividualInfo;
}

export interface ICreateJuristicOrganizationPayload extends ICreateOrganizationBasePayload {
  organizationType: OrganizationType.JURISTIC;
  juristicInfo: IJuristicInfo;
}

export type ICreateOrganizationPayload =
  | ICreatePersonalOrganizationPayload
  | ICreateRegisteredIndividualOrganizationPayload
  | ICreateJuristicOrganizationPayload;
