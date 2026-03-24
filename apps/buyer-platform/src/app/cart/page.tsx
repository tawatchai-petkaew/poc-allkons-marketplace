'use client';
import { UpdateCartItemPayload } from '@/common/api/order-service/cart.api';
import CustomButton from '@/components/Button';
import CartItemCard from '@/app/cart/components/CartItem';
import { FloatButtons } from '@/components/FloatButtons';
import SectionIcon from '@/components/Sections/SectionIcon';
import Typography from '@/components/Typography';
import CartHeader from '@/app/cart/components/CartHeader';
import CartSummary from '@/app/cart/components/CartSummary';
import MerchantHeader from '@/app/cart/components/MerchantCartHeader';
import { useScreenWidth } from '@/hooks/useScreenWidth';
import { useCartData } from '@/hooks/useCartData';
import { ICheckoutProductItem, useCheckoutStore } from '@/store/checkout.store';
import { getDiscountPrice, getFinalPrice } from '@/utils/format';
import { Grid } from 'antd';
import Cookies from 'js-cookie';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import CartItemListSkeleton from './components/Skeleton/CartItemListSkeleton';
import usePopup from '@/hooks/usePopup';
import { ProductDiscount } from '@/common/interfaces/product.interface';
import PopupNewLogin from '@/components/Popup/NewLogin';

export default function CartPage() {
  const { sm } = Grid.useBreakpoint();
  const isMobile = !sm;
  const screenWidth = useScreenWidth();
  const isXs = screenWidth < 356;
  const isDesktop = screenWidth >= 1024;
  const isXl = screenWidth >= 1280;
  const is2Xl = screenWidth >= 1536;
  const [isSummaryOpen, setIsSummaryOpen] = useState(false);
  const router = useRouter();
  const [isLoginVisible, setIsLoginVisible] = useState(false);

  const { setCarts: setCheckoutCarts, setCartIds } = useCheckoutStore();
  const { showPopup, PopupComponent } = usePopup();

  // Use custom hooks for data management
  const {
    carts,
    isLoading,
    hideEmptyState,
    updateCartItem,
    deleteCartItems,
    isUpdating,
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
  } = useCartData((title, description) => {
    showPopup('error', { title, description });
  });

  const goToCheckout = () => {
    const auth = Cookies.get('auth');
    if (!auth) {
      setIsLoginVisible(true);
      return;
    }

    const checkoutItems: ICheckoutProductItem[] = checkedItems.map((item) => ({
      productId: item.id,
      name: item.productItem.product.name,
      price: item.productItem.price,
      specialPrice: getFinalPrice(
        item.productItem.price,
        getDiscountPrice(
          item.productItem.price,
          item.productItem.productDiscount as ProductDiscount
        )
      ),
      variants: {
        variant1: item.productItem.primaryOptionsValue || '',
        variant2: item.productItem.secondaryOptionsValue || '',
        variant3: '',
        variant4: '',
      },
      imagePath:
        item.productItem.product.productImages.length > 0
          ? item.productItem.product.productImages[0].imageUpload.url
          : '',
      count: item.quantity,
      unit: item.unit,
      productInfo: {
        ...item.productItem,
      },
      productItemId: item.productItem.id,
    }));

    const selectedCartIds = carts
      .filter((cart) => cart.cartItems.some((item) => item.isChecked))
      .map((cart) => cart.id);

    setCartIds(selectedCartIds);
    setCheckoutCarts(checkoutItems);
    router.push('/checkout');
  };

  const handleUpdateCartItem = (
    payload: UpdateCartItemPayload,
    onError?: () => void
  ) => {
    const auth = Cookies.get('auth');
    if (!auth) {
      setIsLoginVisible(true);
      return;
    }
    updateCartItem(payload, onError);
  };

  const handleDeleteItem = (itemId: number) => {
    const auth = Cookies.get('auth');
    if (!auth) {
      setIsLoginVisible(true);
      return;
    }
    deleteCartItems([itemId]);
  };

  const handleDeleteMerchantCart = (cartId: number) => {
    const auth = Cookies.get('auth');
    if (!auth) {
      setIsLoginVisible(true);
      return;
    }
    const cart = carts.find((c) => c.id === cartId);
    if (!cart) return;

    const itemIds = cart.cartItems.map((item) => item.id);
    deleteCartItems(itemIds);
  };

  const handleClearAllCarts = () => {
    const auth = Cookies.get('auth');
    if (!auth) {
      setIsLoginVisible(true);
      return;
    }

    const allItemIds = carts.flatMap((cart) =>
      cart.cartItems.map((item) => item.id)
    );
    deleteCartItems(allItemIds);
  };

  return (
    <div className="bg-background-secondary min-h-screen">
      {/* Login Popup */}
      <PopupNewLogin
        visible={isLoginVisible}
        onClose={() => setIsLoginVisible(false)}
      />
      <PopupComponent />
      <div
        className={`container mx-auto pt-6 pb-[2rem] ${isMobile ? 'px-4' : ''}`}
      >
        {/* Back button and title */}
        <div className="flex flex-col gap-3 mb-[2rem]">
          <Link
            href="/"
            className="flex items-center gap-2 !text-button-tertiary-neutral-icon w-fit"
          >
            <i className="ri-arrow-left-line"></i>
            <Typography variant="paragraph-medium" className="!text-inherit">
              ย้อนกลับ
            </Typography>
          </Link>
          <Typography variant={'page-title'}>สินค้าในรถเข็น</Typography>
        </div>

        <div className="flex gap-[2rem] mb-[320px] xl:mb-0">
          {/* Cart List */}

          {isLoading ? (
            <div className="w-full xl:w-[70%]">
              <CartItemListSkeleton />
            </div>
          ) : (
            <div className="w-full xl:w-[70%] ">
              {/* Empty State */}
              {!isLoading && carts.length == 0 && (
                <div
                  className={`${
                    hideEmptyState ? 'hidden' : 'flex'
                  } flex-col h-[60vh] xl:h-full justify-center items-center bg-background-primary rounded-2xl border-border-primary`}
                >
                  <SectionIcon iconClass="ri-shopping-cart-fill" />
                  <div className="text-center">
                    <Typography
                      variant="paragraph-big-medium"
                      className=" !text-text-secondary"
                    >
                      ไม่มีรายการสินค้าในรถเข็น
                    </Typography>
                    <Typography
                      variant="paragraph-middle-regular"
                      className="!text-text-quarternary"
                    >
                      คุณสามารถค้นหาสินค้า และเพิ่มไปยังรถเข็น
                    </Typography>
                    <div className="flex mt-6 gap-3">
                      <Link href="/">
                        <CustomButton
                          size={isMobile ? 'small' : 'middle'}
                          color="neutral"
                          variant="outlined"
                          icon={<i className="ri-home-6-line"></i>}
                        >
                          กลับหน้าหลัก
                        </CustomButton>
                      </Link>
                      <CustomButton
                        size={isMobile ? 'small' : 'middle'}
                        color="primary"
                        icon={<i className="ri-arrow-right-line"></i>}
                        iconPosition="end"
                      >
                        สินค้าทั้งหมด
                      </CustomButton>
                    </div>
                  </div>
                </div>
              )}
              {/* Headers */}
              <CartHeader
                isMobile={isMobile}
                isDesktop={isDesktop}
                is2Xl={is2Xl}
                allChecked={allChecked}
                onToggleAll={toggleAll}
                onClearAll={handleClearAllCarts}
                isShowCartHeader={carts.length > 0}
                selectedCount={checkedItems.length}
                totalCount={carts.reduce(
                  (sum, cart) => sum + cart.cartItems.length,
                  0
                )}
              />
              {/* Cart Items grouped by merchant */}
              {carts.length > 0 &&
                carts.map((cart) => (
                  <div
                    key={cart.id}
                    className="mt-3 bg-background-primary border border-border-primary p-2 md:p-4 rounded-2xl"
                  >
                    {/* Merchant Header */}
                    <MerchantHeader
                      merchantId={cart.id}
                      merchantName={
                        cart.merchant.name ||
                        cart.merchant.organizeName ||
                        'ผู้ขาย'
                      }
                      merchantLogo={cart.merchant.logo}
                      isChecked={isMerchantChecked(cart.id)}
                      onToggle={toggleMerchant}
                      onDelete={handleDeleteMerchantCart}
                      isDesktop={isDesktop}
                      selectedCount={
                        cart.cartItems.filter((item) => item.isChecked).length
                      }
                      totalCount={cart.cartItems.length}
                    />
                    {/* Cart Items */}
                    <div>
                      {cart.cartItems.map((item, index) => (
                        <CartItemCard
                          key={item.id}
                          isMobile={isMobile}
                          isXs={isXs}
                          isDesktop={isDesktop}
                          is2Xl={is2Xl}
                          item={item}
                          onDelete={handleDeleteItem}
                          count={item.quantity}
                          setCount={handleUpdateCartItem}
                          onSelect={toggleItem}
                          onPendingChange={handlePendingChange}
                          isLastItem={index === cart.cartItems.length - 1}
                        />
                      ))}
                    </div>
                  </div>
                ))}
            </div>
          )}
          {/* Summary */}
          {isXl ? (
            <CartSummary
              summary={summary}
              onCheckout={goToCheckout}
              isDesktop={true}
              isMobile={isMobile}
              isUpdating={isUpdating}
            />
          ) : (
            <div className="z-30 bg-background-primary fixed bottom-0 left-0 right-0 w-full pb-2 shadow-2xl">
              <div className="container mx-auto px-4 sm:px-0">
                <CartSummary
                  summary={summary}
                  onCheckout={goToCheckout}
                  isDesktop={false}
                  isMobile={isMobile}
                  isOpen={isSummaryOpen}
                  onToggle={() => setIsSummaryOpen(!isSummaryOpen)}
                  isUpdating={isUpdating}
                />
              </div>
            </div>
          )}
        </div>
      </div>
      <FloatButtons
        bottom={!isXl && isSummaryOpen ? 392 : !isXl ? 168 : undefined}
      />
    </div>
  );
}
