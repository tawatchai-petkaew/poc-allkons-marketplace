export interface SendRegisterVerifyEmail {
  email: string;
  name: string;
  redirectUrl: string;
  merchantLogo: string;
  slug: string;
  rootUrl: string;
  merchantEmail: string;
}

export interface SendResetPasswordEmail {
  email: string;
  name: string;
  redirectUrl: string;
  merchantLogo: string;
  slug: string;
  rootUrl: string;
  merchantEmail: string;
}

export interface SendChangePasswordSuccess {
  email: string;
  name: string;
  merchantLogo: string;
  slug: string;
  rootUrl: string;
  merchantEmail: string;
}

export interface sendVerifyEmailSuccess {
  email: string;
  name: string;
  merchantLogo: string;
  slug: string;
  rootUrl: string;
  merchantEmail: string;
}