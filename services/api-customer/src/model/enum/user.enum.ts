export enum UserStatus {
  ACTIVE = 'active',
  IN_ACTIVE = 'inActive',
  PENDING = 'pending'
}

export enum UserGender {
  MALE = 'male',
  FEMALE = 'female',
  NOT_SPECIFIED = 'notSpecified'
}

// TODO : REMOVE THIS ENUM
export enum OnBoardingStep {
  CREATE_MERCHANT = 'createMerchant',
  FIRST_PRODUCT = 'firstProduct',
  SELECT_PACKAGE = 'selectPackage',
  COMPLETED = 'completed'
}

export enum RegisterStep {
  NONE_REGISTER = 'NONE_REGISTER',
  REGISTER = 'REGISTER',
  USER_INFO = 'USER_INFO',
  ORG_INFO = 'ORG_INFO',
  MERCHANT = 'MERCHANT',
}

export enum RegisterStatus {
  COMPLETED = 'COMPLETED',
  IN_PROGRESS = 'IN_PROGRESS'
}
