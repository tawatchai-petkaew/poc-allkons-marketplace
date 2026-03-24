export enum UserLocale {
  TH = 'th',
  EN = 'en'
}

export enum UserRole {
  ADMIN = 'admin',
  SUPER_ADMIN = 'superAdmin',
  CUSTOMER = 'customer'
}

export enum UserInterfaceMode {
  DARK = 'dark',
  LIGHT = 'light'
}

interface DATA {
  email: string;
  name: string;
  password: string;
  locale: UserLocale;
  interfaceMode: UserInterfaceMode;
  role: UserRole;
  merchantIds: number[];
}

const data: DATA[] = [
  {
    email: 'super_admin@shopdit.com',
    name: 'Super Admin Shopdit ',
    password: 'password',
    locale: UserLocale.TH,
    interfaceMode: UserInterfaceMode.LIGHT,
    role: UserRole.SUPER_ADMIN,
    merchantIds: [1]
  },
  {
    email: 'admin@shopdit.com',
    name: 'Admin Shopdit ',
    password: 'password',
    locale: UserLocale.TH,
    interfaceMode: UserInterfaceMode.LIGHT,
    role: UserRole.ADMIN,
    merchantIds: [1]
  }
];

export default data;
