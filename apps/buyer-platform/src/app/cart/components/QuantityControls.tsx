import CustomButton from '@/components/Button';
import TextField from '@/components/DataEntry/TextField';

interface QuantityControlsProps {
  value: number;
  onIncrement: () => void;
  onDecrement: () => void;
  onChange: (value: number) => void;
  onBlur?: (value: number) => void;
  disabled?: boolean;
  min?: number;
  max?: number;
  loading?: boolean;
}

/**
 * Reusable quantity control component with increment/decrement buttons
 *
 * Features:
 * - Increment/Decrement buttons
 * - Direct number input
 * - Validation (min/max)
 * - Disabled state
 *
 * @example
 * <QuantityControls
 *   value={localCount}
 *   onIncrement={increment}
 *   onDecrement={decrement}
 *   onChange={handleChange}
 *   onBlur={handleBlur}
 * />
 */
export default function QuantityControls({
  value,
  onIncrement,
  onDecrement,
  onChange,
  onBlur,
  disabled = false,
  min = 1,
  max = 99999999,
  loading = false,
}: QuantityControlsProps) {
  return (
    <div className="flex items-center gap-1">
      <CustomButton
        icon={<i className="ri-subtract-fill"></i>}
        variant="outlined"
        color="neutral"
        onClick={onDecrement}
        disabled={value <= min || disabled || loading}
        size="small"
      />
      <div className="relative !w-[84px] !h-[32px]">
        <TextField
          value={value}
          type="number"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={String(max).length}
          onChange={(e) => {
            const inputValue = e.target.value.toString();

            let newValue = Number(inputValue);
            if (isNaN(newValue)) return;

            // Cap at min if below minimum
            if (newValue < min) {
              newValue = min;
            }

            // Cap at max value if exceeds
            if (newValue > max) {
              newValue = max;
            }

            onChange(newValue);
          }}
          onBlur={(e) => {
            let newValue = Number(e.target.value);

            // Cap at min/max
            if (newValue < min) {
              newValue = min;
            } else if (newValue > max) {
              newValue = max;
            }

            if (onBlur) {
              onBlur(newValue);
            } else {
              onChange(newValue);
            }
          }}
          disabled={disabled}
          className="!w-[84px] !h-[32px] !rounded-lg !text-center"
        />
        {/* {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background-primary bg-opacity-80 rounded-lg">
            <Spin size="small" />
          </div>
        )} */}
      </div>
      <CustomButton
        icon={<i className="ri-add-fill"></i>}
        variant="outlined"
        color="neutral"
        onClick={onIncrement}
        disabled={value >= max || disabled || loading}
        size="small"
      />
    </div>
  );
}
