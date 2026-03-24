import { ButtonVariantType } from 'antd/es/button';
import {
  Colors,
  LabelSize,
  LabelType,
  UniqueLeadingIcon,
} from '../../components/Label/Label';

export const resolveType = (
  typeArg: LabelType,
  size?: LabelSize
): {
  variant: ButtonVariantType;
  borderRadius: number;
} => {
  switch (typeArg) {
    case 'PILL_GHOST':
    case 'PILL_LIGHT':
      return { variant: 'filled', borderRadius: 24 };
    case 'PILL_OUTLINED':
      return { variant: 'outlined', borderRadius: 24 };
    case 'PILL_SOLID':
      return { variant: 'solid', borderRadius: 24 };
    case 'PILL_MODERN':
      return { variant: 'outlined', borderRadius: 24 };
    case 'BADGE_GHOST':
      return {
        variant: 'filled',
        borderRadius: size === 'small' || size === 'middle' ? 4 : 6,
      };
    case 'BADGE_OUTLINED':
      return {
        variant: 'outlined',
        borderRadius: size === 'small' || size === 'middle' ? 4 : 6,
      };
    case 'BADGE_SOLID':
      return {
        variant: 'solid',
        borderRadius: size === 'small' || size === 'middle' ? 4 : 6,
      };
    case 'BADGE_MODERN':
      return {
        variant: 'filled',
        borderRadius: size === 'small' || size === 'middle' ? 4 : 6,
      };
    default:
      return {
        variant: 'outlined',
        borderRadius: size === 'small' || size === 'middle' ? 4 : 6,
      };
  }
};

export const resolveMinWidth = (arg: LabelSize): number => {
  switch (arg) {
    case 'small':
      return 20;
    case 'middle':
      return 24;
    case 'large':
      return 28;
    default:
      return 24;
  }
};

export const colorToVar = (arg: Colors): string => {
  switch (arg) {
    case 'error':
      return 'var(--color-error)';
    case 'warning':
      return 'var(--color-warning)';
    case 'success':
      return 'var(--color-success)';
    case 'info':
      return 'var(--color-info)';
    case 'brand':
      return 'var(--color-brand-00)';
    case 'purple':
      return 'var(--color-lavender-purple-20)';
    default:
      return 'var(--color-neutral-40)';
  }
};

export const resolveTextColor = (typeArg: string, colorArg: Colors) => {
  if (
    typeArg === 'PILL_MODERN' ||
    typeArg === 'BADGE_MODERN' ||
    typeArg === 'PILL_LIGHT'
  ) {
    return 'var(--color-neutral-p-60)';
  } else if (typeArg === 'BADGE_SOLID' || typeArg === 'PILL_SOLID') {
    return 'var(--color-neutral-p-95)';
  } else {
    return colorToVar(colorArg);
  }
};

export const resolveBackground = (
  typeArg: LabelType,
  colorArg: Colors
): string => {
  switch (typeArg) {
    case 'PILL_OUTLINED':
    case 'BADGE_OUTLINED':
      return '#FFFFFF';
    case 'PILL_LIGHT':
      return 'var(--color-neutral-p-90)';
    case 'BADGE_MODERN':
      return 'var(--color-neutral-p-95)';
    case 'PILL_MODERN':
      return 'var(--color-neutral-95)';
    case 'PILL_GHOST':
    case 'BADGE_GHOST':
      switch (colorArg) {
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
    default:
      return colorToVar(colorArg);
  }
};
export const border = (typeArg: LabelType): string => {
  if (
    typeArg === 'PILL_SOLID' ||
    typeArg === 'BADGE_SOLID' ||
    typeArg === 'PILL_LIGHT'
  ) {
    return 'none';
  }
  return '1px solid';
};

export const resolveBorderColor = (
  typeArg: LabelType,
  colorArg: Colors
): string => {
  switch (typeArg) {
    case 'PILL_MODERN':
    case 'BADGE_MODERN':
      return '#DEE1E6';
    case 'BADGE_SOLID':
    case 'PILL_SOLID':
    case 'PILL_LIGHT':
      return '';
    case 'PILL_GHOST':
    case 'BADGE_GHOST':
      switch (colorArg) {
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

    default:
      return colorToVar(colorArg);
  }
};

export const pillSpacingWithRoundedLeadingIcon = (
  typeArg: LabelType,
  sizeArg: LabelSize,
  uniqueLeadingIcon?: UniqueLeadingIcon
): number => {
  if (
    ((uniqueLeadingIcon === 'FLAG' || uniqueLeadingIcon === 'AVATAR') &&
      typeArg === 'PILL_GHOST') ||
    typeArg === 'PILL_LIGHT' ||
    typeArg === 'PILL_MODERN' ||
    typeArg === 'PILL_OUTLINED' ||
    typeArg === 'PILL_SOLID'
  ) {
    if (sizeArg === 'small') {
      return -4;
    } else if (sizeArg === 'middle') {
      return -2;
    }
  }
  return 0;
};
