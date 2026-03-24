'use client';

import Typography from '@/components/Typography';
import { colorToVar, resolveMinWidth } from '../../utils/Label/label-utils';
import './custom.css';

export type Colors =
  | 'neutral'
  | 'brand'
  | 'warning'
  | 'error'
  | 'info'
  | 'purple'
  | 'success';

export type LabelType =
  | 'PILL_GHOST'
  | 'PILL_OUTLINED'
  | 'PILL_SOLID'
  | 'PILL_MODERN'
  | 'PILL_LIGHT'
  | 'BADGE_GHOST'
  | 'BADGE_OUTLINED'
  | 'BADGE_SOLID'
  | 'BADGE_MODERN';

export type LabelSize = 'small' | 'middle' | 'large';

export type UniqueLeadingIcon = 'DOT' | 'AVATAR' | 'FLAG';
type LabelVariant = 'outlined' | 'solid' | 'ghost' | 'modern';
type LabelRounding = 'rounded' | 'pill';
type LabelProps = {
  size?: LabelSize;
  rounding?: LabelRounding;
  color?: Colors;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
  variant?: LabelVariant;
  noBorder?: boolean;
  text?: string;
};

export const Label: React.FC<LabelProps> = ({
  color,
  size = 'middle',
  rounding = 'rounded',
  prefix,
  suffix,
  variant = 'outlined',
  noBorder = false,
  text = '',
}) => {
  const borderRadiusMapStyle: Record<
    LabelSize,
    Record<LabelRounding, string>
  > = {
    small: {
      rounded: '4px',
      pill: '9999px',
    },
    middle: {
      rounded: '4px',
      pill: '9999px',
    },
    large: {
      rounded: '6px',
      pill: '9999px',
    },
  };

  const resolveBackgroundGhost = (color: Colors): string => {
    switch (color) {
      case 'neutral':
        return 'var(--color-neutral-p-95)';
      case 'brand':
        return 'var(--color-purple-p-90)';
      case 'purple':
        return 'var(--color-lavender-purple-p-90)';
      case 'warning':
        return 'var(--color-warning-p-90)';
      case 'error':
        return 'var(--color-error-p-90)';
      case 'info':
        return 'var(--color-info-p-90)';
      case 'success':
        return 'var(--color-success-p-90)';
      default:
        return 'none';
    }
  };

  const resolveBorderColor = (color: Colors): string => {
    switch (color) {
      case 'neutral':
        return 'var(--color-neutral-p-80)';
      case 'brand':
        return 'var(--color-brand-p-60)';
      case 'purple':
        return 'var(--color-lavender-purple-p-60)';
      case 'warning':
        return 'var(--color-warning-p-60)';
      case 'error':
        return 'var(--color-error-p-60)';
      case 'info':
        return 'var(--color-info-p-60)';
      case 'success':
        return 'var(--color-success-p-60)';
      default:
        return 'none';
    }
  };

  const backgroundMapStyle: Record<LabelVariant, string> = {
    outlined: 'transparent',
    solid: colorToVar(color || 'neutral'),
    ghost: resolveBackgroundGhost(color || 'neutral'),
    modern: 'var(--color-neutral-p-90)',
  };

  const textColorClassName: Record<LabelVariant, Record<Colors, string>> = {
    outlined: {
      neutral: '!text-neutral',
      brand: '!text-brand',
      warning: '!text-warning-p20',
      error: '!text-error',
      info: '!text-info',
      purple: '!text-purple',
      success: '!text-success',
    },
    solid: {
      neutral: '!text-white',
      brand: '!text-white',
      warning: '!text-white',
      error: '!text-white',
      info: '!text-white',
      purple: '!text-white',
      success: '!text-white',
    },
    ghost: {
      neutral: '!text-neutral',
      brand: '!text-brand',
      warning: '!text-warning',
      error: '!text-error',
      info: '!text-info',
      purple: '!text-purple',
      success: '!text-success',
    },
    modern: {
      neutral: '!text-neutral',
      brand: '!text-brand',
      warning: '!text-warning',
      error: '!text-error',
      info: '!text-info',
      purple: '!text-purple',
      success: '!text-success',
    },
  };

  return (
    <div
      style={{
        background: backgroundMapStyle[variant],
        minWidth: resolveMinWidth(size),
        flexShrink: 0,
        height: resolveMinWidth(size),
        paddingLeft: '8px',
        paddingRight: '8px',
        borderRadius: borderRadiusMapStyle[size][rounding],
        color: 'white',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        // gap: size === "small" ? "4px" : "8px",
        gap: '4px',
        border: `${
          noBorder
            ? 'none'
            : `1px solid ${
                variant === 'modern'
                  ? '#DEE1E6'
                  : resolveBorderColor(color || 'neutral')
              }`
        }`,
        cursor: 'pointer',
      }}
    >
      {prefix && <>{prefix}</>}
      <Typography
        variant={
          size == 'small'
            ? 'paragraph-extra-small'
            : size == 'middle'
              ? 'paragraph-small'
              : 'paragraph-medium'
        }
        className={`font-regular ${
          variant === 'modern'
            ? '!text-neutral-40'
            : textColorClassName[variant][color || 'neutral']
        }`}
      >
        {text || 'Label'}
      </Typography>
      {suffix && <>{suffix}</>}
    </div>
  );
};
