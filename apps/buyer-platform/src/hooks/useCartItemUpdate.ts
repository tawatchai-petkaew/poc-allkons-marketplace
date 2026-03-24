import { useState, useEffect } from 'react';
import { useDebouncedCallback } from 'use-debounce';
import { UpdateCartItemPayload } from '@/common/api/order-service/cart.api';

interface UseCartItemUpdateProps {
  count: number;
  itemId: number;
  productItemId: number;
  unit: string;
  onUpdate: (payload: UpdateCartItemPayload, onError?: () => void) => void;
  onPendingChange?: (itemId: number, isPending: boolean) => void;
  max?: number;
}

/**
 * Custom hook to handle cart item quantity updates with debouncing
 *
 * Features:
 * - Instant UI feedback (local state)
 * - Debounced API calls (300ms)
 * - Validation (min: 1, max: configurable, default 99999999)
 *
 * @example
 * const { localCount, increment, decrement, handleChange } = useCartItemUpdate({
 *   count: item.quantity,
 *   itemId: item.id,
 *   productItemId: item.productItem.id,
 *   unit: item.unit,
 *   onUpdate: updateCartItemMutation,
 *   max: 99999999,
 * });
 */
export function useCartItemUpdate({
  count,
  itemId,
  productItemId,
  unit,
  onUpdate,
  onPendingChange,
  max = 99999999,
}: UseCartItemUpdateProps) {
  // count คือ จำนวนของ cart-item ที่ถูกส่งมาจาก Cartdata
  // เมื่อมีการแก้ไขจำนวน cartItem localCount จะเปลี่ยนแปลงก่อนเพื่อให้ user เห็นค่าทันที
  // หาก api update cart-item success จะทำการอัพเดค count ตามมา
  // หาก api update cart-item fail จะทำการ rollback value ของ localCount ให้เป็นค่าเดิม ด้วย error function ที่ส่งไปทาง setCount
  // Final localCount และ count จะมีค่าเท่ากัน

  // Local state for instant UI feedback
  const [localCount, setLocalCount] = useState(count);
  const [isLoading, setIsLoading] = useState(false);
  const [originalValue, setOriginalValue] = useState(count);

  // Debounced API call (300ms delay)
  const debouncedUpdate = useDebouncedCallback((value: number) => {
    // Validate before calling API
    if (value < 1) return;

    setIsLoading(true);

    // OnUpdate จะรับ 2 input แล้วส่งไปทำงาน ที่ useCartData
    onUpdate(
      // 1. payload สำหรับไป call api update cart-item
      {
        cartItemId: itemId,
        productItemId: productItemId,
        quantity: value,
        unit: unit,
      },
      // 2. rollback function ที่จะถูกสั่งให้ทำงานเมื่อ api update cart-item นั้นๆ error
      () => {
        // Rollback to original value on error (before any changes)
        setLocalCount(originalValue);
        setIsLoading(false);
      }
    );
  }, 300);

  // Reset loading state and update original value when count prop updates (API response received)
  useEffect(() => {
    if (count === localCount) {
      setIsLoading(false);
      setOriginalValue(count); // Update original value on successful API response
    }
  }, [count, localCount]);

  /**
   * Increment quantity by 1
   */
  const increment = () => {
    if (localCount >= max) return; // Max limit

    const newValue = localCount + 1;
    setLocalCount(newValue);

    // แจ้ง parent ทันทีว่ากำลังมีการเปลี่ยนแปลง (ก่อน debounce)
    onPendingChange?.(itemId, true);

    debouncedUpdate(newValue);
  };

  /**
   * Decrement quantity by 1
   */
  const decrement = () => {
    if (localCount <= 1) return; // Min limit

    const newValue = localCount - 1;
    setLocalCount(newValue);

    // แจ้ง parent ทันทีว่ากำลังมีการเปลี่ยนแปลง (ก่อน debounce)
    onPendingChange?.(itemId, true);

    debouncedUpdate(newValue);
  };

  /**
   * Handle direct input change
   * @param value - New quantity value
   */
  const handleChange = (value: number) => {
    // Validate range
    if (value < 1 || value > max) return;

    setLocalCount(value);

    // แจ้ง parent ทันทีว่ากำลังมีการเปลี่ยนแปลง (ก่อน debounce)
    onPendingChange?.(itemId, true);

    debouncedUpdate(value);
  };

  /**
   * Handle blur event (for TextField)
   * Ensures value is at least 1
   */
  const handleBlur = (value: number) => {
    if (value < 1) {
      setLocalCount(1);

      // แจ้ง parent ทันทีว่ากำลังมีการเปลี่ยนแปลง (ก่อน debounce)
      onPendingChange?.(itemId, true);

      debouncedUpdate(1);
    }
  };

  return {
    localCount,
    increment,
    decrement,
    handleChange,
    handleBlur,
    isLoading,
  };
}
