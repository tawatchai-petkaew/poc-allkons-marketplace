import { IDefaultQueryPagination } from '@/common/interfaces/common.interface';
import { create } from 'zustand';

export enum modeSelectAddress {
  SELECT_ADDRESS = 'select-address',
  CREATE_ADDRESS = 'create-address',
  EDIT_ADDRESS = 'edit-address',
}

type SelectAddressStoreType = {
  selectedAddressId: number | null;
  setSelectedAddressId: (addressId: number | null) => void;
  mode: modeSelectAddress;
  setMode: (mode: modeSelectAddress) => void;
};

export const useSelectAddressStore = create<SelectAddressStoreType>((set) => ({
  selectedAddressId: null,
  setSelectedAddressId: (addressId: number | null) =>
    set({ selectedAddressId: addressId }),
  mode: modeSelectAddress.SELECT_ADDRESS,
  setMode: (mode: modeSelectAddress) => set({ mode }),
}));
