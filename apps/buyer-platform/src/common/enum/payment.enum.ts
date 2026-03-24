export enum PaymentMethod {
  PG_CREDIT_CARD = 'PG_CREDIT_CARD',
  PG_PROMPTPAY = 'PG_PROMPTPAY',
  PG_BILL = 'PG_BILL',
  BANK_TRANSFER = 'BANK_TRANSFER',
  CREDIT_MERCHANT = 'CREDIT_MERCHANT',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  SUCCESS = 'SUCCESS',
  CANCELED = 'CANCELED',
  NEW = 'NEW',
}

export enum DeliveryType {
  PICKUP = 'PICKUP',
  AGENT_SERVICE = 'AGENT_SERVICE',
}

export enum DeliveryReceiveType {
  SENDONCE = 'SENDONCE',
  GRADUALLY = 'GRADUALLY',
}

export enum DeliveryBy {
  AGENT = 'AGENT',
  OUTSOURCE = 'OUTSOURCE',
}

export enum DeliveryTime {
  ANYTIME = 'ANYTIME',
  MORNING = 'MORNING',
  AFTERNOON = 'AFTERNOON',
}
