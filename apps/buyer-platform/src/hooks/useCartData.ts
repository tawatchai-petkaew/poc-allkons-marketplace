import {
  useState,
  useEffect,
  useRef,
  useTransition,
  useMemo,
  useCallback,
} from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import Cookies from 'js-cookie';
import {
  getCarts,
  getCount,
  updateCartItem,
  deleteCartItems,
  UpdateCartItemPayload,
} from '@/common/api/order-service/cart.api';
import { ICart, ICartItem } from '@/common/interfaces/Cart.interface';
import { ProductDiscount } from '@/common/interfaces/product.interface';
import { getDiscountPrice, getFinalPrice } from '@/utils/format';

// Extended interfaces with isChecked flag
export interface CartItem extends ICartItem {
  isChecked: boolean;
}

export interface Cart extends ICart {
  cartItems: CartItem[];
}

interface CartSummary {
  price: number;
  discount: number;
  priceBeforeVat: number;
  vat: number;
  total: number;
  itemCount: number;
}

interface UseCartDataReturn {
  carts: Cart[];
  setCarts: React.Dispatch<React.SetStateAction<Cart[]>>;
  isLoading: boolean;
  isSuccess: boolean;
  error: Error | null;
  updateCartItem: (
    payload: UpdateCartItemPayload,
    onError?: () => void
  ) => void;
  deleteCartItems: (cartItemIds: number[]) => void;
  refetchCount: () => void;
  hideEmptyState: boolean;
  setHideEmptyState: React.Dispatch<React.SetStateAction<boolean>>;
  isUpdating: boolean;
  handlePendingChange: (itemId: number, isPending: boolean) => void;
  // Selection
  allChecked: boolean;
  checkedItems: CartItem[];
  toggleAll: () => void;
  toggleMerchant: (cartId: number) => void;
  toggleItem: (itemId: number) => void;
  isMerchantChecked: (cartId: number) => boolean;
  // Summary
  summary: CartSummary;
}

/**
 * Helper function: Calculate summary from checked items
 * ✅ Optimized: Single reduce loop instead of 5 separate loops (O(n) instead of O(5n))
 */
function calculateSummary(checkedItems: CartItem[]): CartSummary {
  if (checkedItems.length === 0) {
    return {
      price: 0,
      discount: 0,
      priceBeforeVat: 0,
      vat: 0,
      total: 0,
      itemCount: 0,
    };
  }

  // ✅ รวมการคำนวณทั้งหมดใน reduce เดียว (จาก 5 รอบ เหลือ 1 รอบ)
  return checkedItems.reduce(
    (acc, item) => {
      const itemDiscount = getDiscountPrice(
        item.productItem.price,
        item.productItem.productDiscount as ProductDiscount
      );
      const finalPrice = getFinalPrice(item.productItem.price, itemDiscount);
      const itemTotal = finalPrice * item.quantity;

      return {
        price: acc.price + item.productItem.price * item.quantity,
        discount: acc.discount + itemDiscount * item.quantity,
        priceBeforeVat: acc.priceBeforeVat + itemTotal * 0.93,
        vat: acc.vat + itemTotal * 0.07,
        total: acc.total + itemTotal,
        itemCount: acc.itemCount + 1,
      };
    },
    {
      price: 0,
      discount: 0,
      priceBeforeVat: 0,
      vat: 0,
      total: 0,
      itemCount: 0,
    }
  );
}

/**
 * Custom hook to manage cart data fetching, mutations, and state
 *
 * Handles:
 * - Fetching carts from API
 * - Updating cart item quantity
 * - Deleting cart items
 * - Cart count refetch
 * - Selection logic (toggleAll, toggleMerchant, toggleItem)
 * - Summary calculation
 * - Error handling
 *
 * @param onError - Callback for error handling (e.g., showing popup)
 */
export function useCartData(
  onError?: (title: string, description: string) => void
): UseCartDataReturn {
  const [carts, setCarts] = useState<Cart[]>([]);
  const [hideEmptyState, setHideEmptyState] = useState(true);
  // Use Map to store multiple callbacks (one per item) (เป็นการสร้างพื้นที่สำหรับเก็บ rollback function ของแต่ละ cart-item)
  const errorCallbacksRef = useRef<Map<number, () => void>>(new Map());
  // Track pending updates - ตั้งค่าเป็น true ทันทีเมื่อมีการเปลี่ยนแปลง ไม่ต้องรอ debounce
  const pendingUpdatesRef = useRef<Set<number>>(new Set());
  const [isUpdating, setIsUpdating] = useState(false);
  // useTransition for non-blocking state updates (prevent UI gap during heavy calculations)
  const [isPending, startTransition] = useTransition();

  // State for derived values (calculated inside startTransition)
  const [checkedItems, setCheckedItems] = useState<CartItem[]>([]);
  const [allChecked, setAllChecked] = useState(false);
  const [summary, setSummary] = useState<CartSummary>(calculateSummary([]));

  // Helper functions (pure functions)
  const getCheckedItems = (carts: Cart[]): CartItem[] => {
    return carts.flatMap((cart) =>
      cart.cartItems.filter((item) => item.isChecked)
    );
  };

  const isAllChecked = (carts: Cart[]): boolean => {
    if (carts.length === 0) return false;
    return carts.every(
      (cart) =>
        cart.cartItems.length > 0 &&
        cart.cartItems.every((item) => item.isChecked)
    );
  };

  // ✅ Optimize: Memoize merchant checked status (O(1) lookup instead of O(n))
  const merchantCheckedMap = useMemo(() => {
    return new Map(
      carts.map((cart) => [
        cart.id,
        cart.cartItems.length > 0 &&
          cart.cartItems.every((item) => item.isChecked),
      ])
    );
  }, [carts]);

  const isMerchantChecked = (cartId: number): boolean => {
    return merchantCheckedMap.get(cartId) ?? false;
  };

  // Helper: Update all derived states (called inside startTransition)
  // ✅ ใช้ useCallback เพื่อให้ได้ stable reference (function จะไม่ถูกสร้างใหม่เมื่อ rerender)
  const updateDerivedStates = useCallback((newCarts: Cart[]) => {
    const newCheckedItems = getCheckedItems(newCarts);
    const newSummary = calculateSummary(newCheckedItems);
    const newAllChecked = isAllChecked(newCarts);

    setCheckedItems(newCheckedItems);
    setSummary(newSummary);
    setAllChecked(newAllChecked);
  }, []); // ไม่มี external dependencies

  // Get authentication token
  const getAuth = () => {
    const auth = Cookies.get('auth');
    if (!auth) return null;

    try {
      return JSON.parse(auth);
    } catch (error) {
      console.error('[useCartData] Invalid auth cookie:', error);
      return null;
    }
  };

  // Helper function to remove pending update and check if all done => (isUpdating=false)
  const removePendingUpdate = (itemId: number) => {
    pendingUpdatesRef.current.delete(itemId);
    if (pendingUpdatesRef.current.size === 0) {
      setIsUpdating(false);
    }
  };

  // Query: Fetch cart count
  const { refetch: refetchCount } = useQuery({
    queryKey: ['cart-count'],
    queryFn: () => {
      const authData = getAuth();
      return getCount(authData?.accessToken);
    },
  });

  // Query: Fetch carts
  const {
    data: cartsQuery,
    isSuccess,
    error: fetchCartsError,
    isLoading,
  } = useQuery({
    queryKey: ['carts'],
    queryFn: () => {
      const authData = getAuth();
      return getCarts(authData?.accessToken);
    },
    gcTime: 0,
  });

  // Mutation: Update cart item quantity
  const { mutate: updateCartItemMutation } = useMutation({
    mutationFn: (payload: UpdateCartItemPayload) => {
      const authData = getAuth();
      return updateCartItem(authData?.accessToken, payload);
    },
    onSuccess: (data: ICartItem) => {
      // Remove callback after successful update
      errorCallbacksRef.current.delete(data.id);

      // Update local state with new quantity using transition (non-blocking)
      // Why useTransition ?
      // ในกรณีที่มี cartItem มากๆ การอัพเดตแต้ละครั้งจะช้า เพราะ นอกจาก setCart แล้ว ยังมีการ reCalculate checkedItems และ summary ด้วย อาจทำให้หน้า UI ค้าง
      // useTransition จะทำให้การทำงานส่วนนี้ไปเป็น backgroundJob โดยมี isPending เป็นตัวบอกว่าเสร็จรึยัง ในระหว่างการอัพเดต isPending = true ซึ่งเราจะแสดงส่วน summary ให้เป็นสถานะ loading อยู่
      startTransition(() => {
        // ✅ ใช้ functional update เพื่อป้องกัน stale closure
        setCarts((prevCarts) => {
          const newCarts = prevCarts.map((cart) => ({
            ...cart,
            cartItems: cart.cartItems.map((item) =>
              item.id === data.id ? { ...item, quantity: data.quantity } : item
            ),
          }));

          // คำนวณ derived states ภายใน transition (isPending จะรอจนเสร็จ)
          // Queue updates หลัง setCarts complete (queueMicrotask คือการสั่งให้ ทำ หลังจากที่ setCarts สำเร็จแล้ว *[แต่จะทำก่อนที่จะมีการ re-render]*)
          queueMicrotask(() => {
            updateDerivedStates(newCarts);
            // ✅ ย้าย removePendingUpdate มาอยู่หลัง updateDerivedStates
            // เพื่อให้ isUpdating เป็น false หลังจาก calculation เสร็จ
            removePendingUpdate(data.id);
          });

          return newCarts;
        });
      });
    },
    onError: (error, variables) => {
      // ✅ Log error for debugging
      console.error('[useCartData] Update cart item failed:', {
        error,
        variables,
        timestamp: new Date().toISOString(),
      });

      // Keep the original quantity by not updating state
      // This allows useCartItemUpdate to detect the error and rollback
      const cartItemId = variables.cartItemId;

      // เมื่อ cart-item id นี้ call api update fail จะทำการ หา rollback function ของไอดีนั้นๆ เพื่อทำการเรียกใช้
      const callback = errorCallbacksRef.current.get(cartItemId);
      if (callback) {
        callback();
        errorCallbacksRef.current.delete(cartItemId); // Remove after calling
      } else {
        console.warn(
          '[useCartData] No error rollback registered for item:',
          cartItemId
        );
      }

      onError?.('เกิดข้อผิดพลาด', 'เกิดข้อผิดพลาดในการอัปเดตสินค้าในรถเข็น');
      setHideEmptyState(false);

      // Remove from pending updates AFTER all error handling to ensure UI updates together
      removePendingUpdate(cartItemId);
    },
  });

  // Mutation: Delete cart items
  const { mutate: deleteCartItemsMutation } = useMutation({
    mutationFn: (cartItemIds: number[]) => {
      const authData = getAuth();
      return deleteCartItems(authData?.accessToken, cartItemIds);
    },
    onSuccess: (res: { data?: { deletedIds: number[] } }) => {
      // ✅ ใช้ startTransition สำหรับ delete เพื่อ track isPending
      startTransition(() => {
        setCarts((prevCarts) => {
          const newCarts = prevCarts
            .map((cart) => ({
              ...cart,
              cartItems: cart.cartItems.filter(
                (item) => !res.data?.deletedIds.includes(item.id)
              ),
            }))
            .filter((cart) => cart.cartItems.length > 0); // Remove empty carts

          queueMicrotask(() => {
            updateDerivedStates(newCarts);
          });

          return newCarts;
        });
      });
      refetchCount();
    },
    onError: (error, variables) => {
      // ✅ Log error for debugging
      console.error('[useCartData] Delete cart items failed:', {
        error,
        variables,
        timestamp: new Date().toISOString(),
      });

      onError?.('เกิดข้อผิดพลาด', 'เกิดข้อผิดพลาดในการลบสินค้าในรถเข็น');
      setHideEmptyState(false);
    },
  });

  // Effect: Initialize carts from query data
  useEffect(() => {
    if (!cartsQuery) return;

    const cartsData: ICart[] = Array.isArray(cartsQuery) ? cartsQuery : [];

    if (cartsData.length > 0) {
      // Add isChecked flag to all items (default: false)
      const newCarts = cartsData.map((cart) => ({
        ...cart,
        cartItems: cart.cartItems.map((item) => ({
          ...item,
          isChecked: false,
        })),
      }));

      // ✅ ใช้ startTransition เพื่อป้องกัน UI ค้างตอน initial load
      startTransition(() => {
        setCarts(newCarts);

        // Update derived states
        queueMicrotask(() => {
          updateDerivedStates(newCarts);
        });
      });
    }
  }, [cartsQuery, updateDerivedStates]); // ✅ เพิ่ม updateDerivedStates ใน dependencies

  // Effect: Handle successful fetch
  useEffect(() => {
    if (isSuccess) {
      setHideEmptyState(false);
    }
  }, [isSuccess]);

  // Effect: Handle fetch error
  useEffect(() => {
    if (fetchCartsError) {
      // ✅ Log error for debugging
      console.error('[useCartData] Fetch carts failed:', {
        error: fetchCartsError,
        timestamp: new Date().toISOString(),
      });

      onError?.('เกิดข้อผิดพลาด', 'เกิดข้อผิดพลาดในการดึงสินค้าในรถเข็น');
      setHideEmptyState(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchCartsError]);

  // Effect: Cleanup on unmount (prevent memory leaks)
  useEffect(() => {
    return () => {
      // Clear all pending callbacks
      errorCallbacksRef.current.clear();
      pendingUpdatesRef.current.clear();
    };
  }, []);

  // Selection functions
  const toggleAll = () => {
    startTransition(() => {
      // ✅ ใช้ functional update
      setCarts((prevCarts) => {
        // ✅ คำนวณ currentAllChecked จาก prevCarts เพื่อป้องกัน stale closure
        const currentAllChecked = prevCarts.every(
          (cart) =>
            cart.cartItems.length > 0 &&
            cart.cartItems.every((item) => item.isChecked)
        );
        const newCheckedState = !currentAllChecked;

        const newCarts = prevCarts.map((cart) => ({
          ...cart,
          cartItems: cart.cartItems.map((item) => ({
            ...item,
            isChecked: newCheckedState,
          })),
        }));

        queueMicrotask(() => {
          updateDerivedStates(newCarts);
        });

        return newCarts;
      });
    });
  };

  const toggleMerchant = (cartId: number) => {
    startTransition(() => {
      // ✅ ใช้ functional update
      setCarts((prevCarts) => {
        const newCarts = prevCarts.map((cart) => {
          if (cart.id !== cartId) return cart;
          const merchantChecked = cart.cartItems.every(
            (item) => item.isChecked
          );
          return {
            ...cart,
            cartItems: cart.cartItems.map((item) => ({
              ...item,
              isChecked: !merchantChecked,
            })),
          };
        });

        queueMicrotask(() => {
          updateDerivedStates(newCarts);
        });

        return newCarts;
      });
    });
  };

  const toggleItem = (itemId: number) => {
    startTransition(() => {
      // ✅ ใช้ functional update
      setCarts((prevCarts) => {
        const newCarts = prevCarts.map((cart) => ({
          ...cart,
          cartItems: cart.cartItems.map((item) =>
            item.id === itemId ? { ...item, isChecked: !item.isChecked } : item
          ),
        }));

        queueMicrotask(() => {
          updateDerivedStates(newCarts);
        });

        return newCarts;
      });
    });
  };

  // Handle pending changes from cart items (called before debounce)
  const handlePendingChange = (itemId: number, isPending: boolean) => {
    if (isPending) {
      pendingUpdatesRef.current.add(itemId);
      setIsUpdating(true);
    } else {
      removePendingUpdate(itemId);
    }
  };

  return {
    carts,
    setCarts,
    isLoading,
    isSuccess,
    error: fetchCartsError,
    updateCartItem: (
      payload: UpdateCartItemPayload,
      onErrorCb?: () => void
    ) => {
      // onErrorCb คือ rollback function ที่ แต่ละ cart-item ที่มีการอัพเดต ส่งเข้ามา
      if (onErrorCb) {
        // เก็บ rollback function ตามแต่ละ cart-item เพื่อเรียกใช้งานเวลา api update error
        errorCallbacksRef.current.set(payload.cartItemId, onErrorCb);
      }

      // Note: isUpdating is already set to true in handlePendingChange (called before debounce)
      updateCartItemMutation(payload);
    },
    deleteCartItems: deleteCartItemsMutation,
    refetchCount,
    hideEmptyState,
    setHideEmptyState,
    // Why need 2 value?
    // isUpdating จะเป็น true ทันทีเมื่อมีการ เปลี่ยนแปลง count cart-item โดยไม่รอ debounce และเป็น false เมื่อมีการ update success หรือ rollback success
    // isPending จะเป็น true เมื่อ
    isUpdating: isUpdating || isPending, // Include isPending from useTransition
    handlePendingChange,
    // Selection
    allChecked,
    checkedItems,
    toggleAll,
    toggleMerchant,
    toggleItem,
    isMerchantChecked,
    // Summary
    summary,
  };
}
