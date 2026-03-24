export interface JwtPayloadInterface {
  userId: number;
  userUuid: string;
  sub: string;
  phoneNumber: string;
  merchantId?: number | null;
  merchantUuid?: string | null;
  merchantSlug?: string | null;
  organizeId?: number | null;
  organizationId?: number | null;
  membershipStatus?: string | null;
  lastAccessedAt?: string | null;
  context?: string;
  type?: string;
  iat?: number;
}

export interface BuyerJwtPayload {
  userId: number;
  userUuid: string;
  sub: string;
  phoneNumber: string;
  organizationId?: number | null;
  organizeId?: number | null;
  organizeUuid?: string | null;
  membershipStatus?: string | null;
}

export interface MerchantJwtPayload {
  userId: number;
  userUuid: string;
  sub: string;
  phoneNumber: string;
  merchantId?: number | null;
  merchantUuid?: string | null;
  merchantSlug?: string | null;
  lastAccessedAt?: string | null;
}
