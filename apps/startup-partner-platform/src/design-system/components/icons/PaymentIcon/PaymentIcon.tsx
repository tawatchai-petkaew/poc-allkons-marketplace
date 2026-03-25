'use client';

import React from 'react';
import Image from 'next/image';
import { clsx } from 'clsx';

// ─── Types ────────────────────────────────────────────────────────────────────
// Figma: Payment method icon — Size × Payment method

export type PaymentIconSize = 'sm' | 'md' | 'lg';

export type PaymentMethod =
  // Cards
  | 'Visa' | 'Mastercard' | 'AMEX' | 'Discover' | 'DinersClub' | 'JCB'
  | 'Maestro' | 'UnionPay'
  // Digital Wallets
  | 'ApplePay' | 'GooglePay' | 'PayPal' | 'Alipay' | 'WeChat' | 'ShopPay'
  // BNPL
  | 'Klarna' | 'Affirm'
  // Bank Transfers
  | 'SEPA' | 'iDeal' | 'Sofort' | 'Bancontact' | 'Giropay' | 'Interac'
  // Regional
  | 'Yandex' | 'Qiwi' | 'Webmoney' | 'Forbrugsforeningen' | 'Elo' | 'Citadele'
  // Crypto
  | 'Bitcoin' | 'BitcoinCash' | 'Ethereum' | 'Litecoin' | 'Bitpay'
  // Other
  | 'Amazon' | 'Skrill' | 'Stripe' | 'Payoneer' | 'Paysafe' | 'Verifone' | 'QRCode';

export interface PaymentIconProps {
  /** Payment method to display */
  method: PaymentMethod;
  /** Icon size — sm: 34×24 | md: 46×32 | lg: 58×40 */
  size?: PaymentIconSize;
  /** Override image src (defaults to /images/icons/payment/{method}.svg) */
  src?: string;
  /** Alt text */
  alt?: string;
  className?: string;
}

// ─── Size map (Figma: standard payment card aspect ratio ~17:12) ─────────────

const sizeDims: Record<PaymentIconSize, { w: string; h: string; width: number; height: number }> = {
  sm: { w: 'w-[34px]', h: 'h-[24px]', width: 34, height: 24 },
  md: { w: 'w-[46px]', h: 'h-[32px]', width: 46, height: 32 },
  lg: { w: 'w-[58px]', h: 'h-[40px]', width: 58, height: 40 },
};

// ─── Component ────────────────────────────────────────────────────────────────

export const PaymentIcon = ({
  method,
  size = 'md',
  src,
  alt,
  className,
}: PaymentIconProps) => {
  const { w, h, width, height } = sizeDims[size];
  const imageSrc = src ?? `/images/icons/payment/${method}.svg`;
  const label = alt ?? `${method} payment icon`;

  return (
    <span
      className={clsx(
        'inline-flex shrink-0 items-center justify-center',
        'rounded-sm border border-neutral-p80 bg-white overflow-hidden',
        w, h,
        className
      )}
      aria-label={label}
    >
      <Image
        src={imageSrc}
        alt={label}
        width={width}
        height={height}
        className="object-contain w-full h-full"
      />
    </span>
  );
};

PaymentIcon.displayName = 'PaymentIcon';
