'use client';

import Image from 'next/image';
import { clsx } from 'clsx';

// ─── Types ────────────────────────────────────────────────────────────────────

export type BankCode =
  | 'BAAC' | 'BAY' | 'BBL' | 'CIMB' | 'GHBANK' | 'GSB'
  | 'KBANK' | 'KK' | 'KTB' | 'LHBANK' | 'SCB'
  | 'TBANK' | 'TISCO' | 'TMB' | 'UOB' | 'TTB';

export interface BankProps {
  /** Thai bank code — maps to brand color and logo asset */
  bank: BankCode;
  /** Override logo image src (defaults to /images/icons/banks/{bank}.svg) */
  logoSrc?: string;
  /** Alt text for the logo (defaults to bank code) */
  alt?: string;
  className?: string;
}

// ─── Brand color map (from Figma: Bank component) ─────────────────────────────

const bankMeta: Record<BankCode, { bg: string; name: string }> = {
  BAAC:   { bg: '#292a7d', name: 'Bank for Agriculture and Agricultural Cooperatives' },
  BAY:    { bg: '#ffc423', name: 'Bank of Ayudhya (Krungsri)' },
  BBL:    { bg: '#233e99', name: 'Bangkok Bank' },
  CIMB:   { bg: '#d93934', name: 'CIMB Thai' },
  GHBANK: { bg: '#f58220', name: 'Government Housing Bank' },
  GSB:    { bg: '#ec068d', name: 'Government Savings Bank' },
  KBANK:  { bg: '#4ba55a', name: 'Kasikorn Bank' },
  KK:     { bg: '#429ac5', name: 'Kiatnakin Phatra Bank' },
  KTB:    { bg: '#00a3e3', name: 'Krungthai Bank' },
  LHBANK: { bg: '#ffffff', name: 'Land and Houses Bank' },
  SCB:    { bg: '#462279', name: 'Siam Commercial Bank' },
  TBANK:  { bg: '#f37022', name: 'Thanachart Bank' },
  TISCO:  { bg: '#ffffff', name: 'TISCO Bank' },
  TMB:    { bg: '#0079c1', name: 'TMB Bank' },
  UOB:    { bg: '#002469', name: 'United Overseas Bank' },
  TTB:    { bg: '#ffffff', name: 'TTB Bank' },
};

// ─── Component ────────────────────────────────────────────────────────────────
// Figma: 80×80px, border-radius=12px

export const Bank = ({ bank, logoSrc, alt, className }: BankProps) => {
  const { bg, name } = bankMeta[bank];
  const src = logoSrc ?? `/images/icons/banks/${bank}.svg`;

  return (
    <div
      className={clsx('relative w-20 h-20 rounded-xl overflow-hidden shrink-0', className)}
      style={{ backgroundColor: bg }}
      title={name}
    >
      <Image
        src={src}
        alt={alt ?? name}
        fill
        className="object-contain p-[15%]"
        sizes="80px"
      />
    </div>
  );
};

Bank.displayName = 'Bank';
