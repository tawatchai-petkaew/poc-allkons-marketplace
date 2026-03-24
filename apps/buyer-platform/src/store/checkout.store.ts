import { IDeliveryForm } from '@/app/checkout/components/FormDelivery/FormDelivery';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export interface ICheckoutProductItem {
  productId: number;
  name: string;
  price: number;
  specialPrice: number;
  variants: {
    variant1: string;
    variant2: string;
    variant3: string;
    variant4: string;
  };
  imagePath: string;
  count: number;
  unit: string;
  productInfo: any;
  productItemId: number;
}

type CheckoutStoreType = {
  carts: ICheckoutProductItem[];
  cartIds: number[];
  deliveryFormValue: IDeliveryForm | null;
  setDeliveryFormValue: (form: IDeliveryForm | null) => void;
  setCarts: (carts: ICheckoutProductItem[]) => void;
  setCartIds: (cartIds: number[]) => void;
};

export const useCheckoutStore = create<CheckoutStoreType>()(
  persist(
    (set) => ({
      carts: [],
      setCarts: (carts) => set({ carts }),
      cartIds: [],
      setCartIds: (cartIds) => set({ cartIds }),
      deliveryFormValue: null,
      setDeliveryFormValue: (form) => set({ deliveryFormValue: form }),
    }),
    {
      name: 'checkout-storage',
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);
