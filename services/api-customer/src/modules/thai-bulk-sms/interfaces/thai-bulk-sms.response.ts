export interface ThaiBulkSmsSendResponse {
  remaining_credit: number;
  total_use_credit: number;
  credit_type: 'corporate' | string;
  phone_number_list: ThaiBulkSmsPhoneItem[];
  bad_phone_number_list: ThaiBulkSmsBadPhoneItem[];
  // ผู้ให้บริการอาจมีฟิลด์อื่น ๆ เพิ่มเข้ามาได้
  [k: string]: any;
}

export interface ThaiBulkSmsPhoneItem {
  number: string;
  message_id: string;
  used_credit: number;
}

export interface ThaiBulkSmsBadPhoneItem {
  number: string;
  reason?: string;
}
