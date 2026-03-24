import { IOrganizationWithRoleDto } from '@/common/interfaces/organization/user-with-org.response.interface';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface IUser {
  id: number;
  countryCode: string;
  tel: string;
  email: string | null;
  name: string;
  firstNameTh: string | null;
  lastNameTh: string | null;
  middleNameTh: string | null;
  firstNameEn: string | null;
  lastNameEn: string | null;
  middleNameEn: string | null;
  role: string;
  locale: string;
  interfaceMode: string;
  status: string;
  gender: string | null;
  onBoardingStep: string | null;
  birthDate: string | null;
  cisNumber: string;
  idCard: string | null;
  kycStatus: string;
  maritalStatus: string | null;
  isSeller: boolean;
  businessType: string[];
  createdAt: string;
  updatedAt: string;
  merchants: any[];
  admins: any[];
  imageUpload: any | null;
  uuid: string;
}

type GlobalStoreType = {
  profile?: IUser;
  setProfile: (profile?: IUser) => void;
  organizations?: IOrganizationWithRoleDto[];
  setOrganizations: (organizations?: IOrganizationWithRoleDto[]) => void;
  currentOrganization?: IOrganizationWithRoleDto;
  setCurrentOrganization: (
    currentOrganization?: IOrganizationWithRoleDto
  ) => void;
};

export const useGlobalStore = create<GlobalStoreType>()(
  persist(
    (set) => ({
      profile: undefined,
      setProfile: (profile?: IUser) => set(() => ({ profile })),
      organizations: undefined,
      setOrganizations: (organizations?: IOrganizationWithRoleDto[]) =>
        set(() => ({ organizations })),
      currentOrganization: undefined,
      setCurrentOrganization: (
        currentOrganization?: IOrganizationWithRoleDto
      ) => set(() => ({ currentOrganization })),
    }),
    {
      name: 'global-storage',
      storage: {
        getItem: (name) => {
          const value = sessionStorage.getItem(name);
          return value ? JSON.parse(value) : null;
        },
        setItem: (name, value) => {
          sessionStorage.setItem(name, JSON.stringify(value));
        },
        removeItem: (name) => {
          sessionStorage.removeItem(name);
        },
      },
    }
  )
);
