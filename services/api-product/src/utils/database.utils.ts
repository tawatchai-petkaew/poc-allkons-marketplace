import { ValueTransformer } from 'typeorm';

/**
 * Transformer to convert PostgreSQL DECIMAL to JavaScript number
 * PostgreSQL returns DECIMAL as string to preserve precision
 * This converts it to number for easier calculation
 *
 * Usage in entity:
 * @Column({
 *   type: 'decimal',
 *   precision: 13,
 *   scale: 2,
 *   transformer: decimalTransformer,
 * })
 * price: number;
 */
export const decimalTransformer: ValueTransformer = {
  to: (value: number | null | undefined): number | null | undefined => value,
  from: (value: string | null | undefined): number | null => {
    if (value === null || value === undefined) return null;
    return parseFloat(value);
  },
};
