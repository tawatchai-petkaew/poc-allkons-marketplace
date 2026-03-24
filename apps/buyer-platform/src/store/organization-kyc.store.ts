import { create } from 'zustand';

type OrganizationKycStoreType = {
  isUploadFileCis: boolean;
  setIsUploadFileCis: (value: boolean) => void;
};

export const useOrganizationKycStore = create<OrganizationKycStoreType>(
  (set) => ({
    isUploadFileCis: false,
    setIsUploadFileCis: (value) => set({ isUploadFileCis: value }),
  })
);
