import { Themes } from '../../components/Label/LabelGroup';

export const resolveTextColor = (
  themeArg: Themes
): { context: string; label: string; icon: string; border: string } => {
  switch (themeArg) {
    case 'destructive':
      return {
        context: 'var(--color-error)',
        label: 'var(--color-error)',
        icon: 'var(--color-error)',
        border: 'none',
      };
    case 'warning':
      return {
        context: 'var(--color-warning-darker)',
        label: 'var(--color-warning-darker)',
        icon: 'var(--color-warning-darker)',
        border: 'none',
      };
    case 'primary':
      return {
        context: 'var(--color-brand-darker)',
        label: 'var(--color-background-primary)',
        icon: 'var(--color-background-primary)',
        border: 'none',
      };
    case 'gray':
    case 'success':
    case 'white':
      return {
        context: 'var(--color-success-darker)',
        label: 'var(--color-success-darker)',
        icon: 'var(--color-icon-secondary)',
        border: 'none',
      };
    case 'info':
      return {
        context: 'var(--color-info-darker)',
        label: 'var(--color-info-darker)',
        icon: 'var(--color-info-darker)',
        border: 'none',
      };
    default:
      return {
        context: 'var(--color-success-darker)',
        label: 'var(--color-success-darker)',
        icon: 'var(--color-icon-secondary)',
        border: 'var(--color-brand-lighter)',
      };
  }
};

export const resolveContextBackground = (themeArg: Themes): string => {
  switch (themeArg) {
    case 'destructive':
    case 'warning':
    case 'info':
    case 'success':
    case 'gray':
      return 'var(--color-background-primary)';
    default:
      return 'var(--color-success-subtle)';
  }
};

export const resolveBackground = (themeArg: Themes): string => {
  switch (themeArg) {
    case 'destructive':
      return 'var(--color-error-subtle)';
    case 'warning':
      return 'var(--color-warning-subtle)';
    case 'primary':
      return 'var(--color-success-darker)';
    case 'gray':
      return 'var(--color-background-secondary)';
    case 'success':
      return 'var(--color-success-subtle)';
    case 'info':
      return 'var(--color-info-subtle)';
    case 'white':
      return 'var(--color-background-primary)';
    default:
      return 'var(--color-background-primary)';
  }
};
