export type PaginationType<T> = {
  meta: {
    page: number;
    pageLimit: number;
    totalItems: number;
    totalPages: number;
  };
  items: T[]; // Array of generic ty
};
