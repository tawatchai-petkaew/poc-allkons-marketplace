export interface ProductMatchingSuggestionRequest {
  barcode: string | null;
  name: string | null;
  brand: string | null;
}

export interface ProductMatchingSuggestionResponse {
  matchType: 'matchBarcode' | 'matchSuggestion' | 'notMatch';
  row: number;
  product?: ProductMatchingInterface;
  suggestions?: ProductMatchingInterface[];
  pagination?: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

export interface ProductMatchingInterface {
  id: string;
  name: string;
  sku: string;
  brand: string;
  barcode: string;
}
