/**
 * Common Constants
 * Shared constants used across multiple features
 */

// ============================================
// Pagination
// ============================================

export const PAGINATION_SIZE_OPTIONS = ['10', '25', '50', '100', '250'] as const;

export type PaginationSizeOption = typeof PAGINATION_SIZE_OPTIONS[number];
