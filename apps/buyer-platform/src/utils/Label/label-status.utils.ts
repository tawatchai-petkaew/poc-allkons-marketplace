export const resolveBackground = (statusArg: string): string => {
  switch (statusArg) {
    case 'closed':
      return 'var(--color-neutral-p-90)';
    case 'todo':
      return 'var(--color-dark-orange-p-90)';
    case 'edit':
      return 'var(--color-info-subtle)';
    case 'failed':
      return 'var(--color-error-subtle)';
    case 'pending':
      return 'var(--color-info-subtle)';
    case 'success':
      return 'var(--color-success-subtle)';
    case 'canceled':
      return 'var(--color-error-subtle)';
    case 'draft':
      return 'var(--color-lavender-purple-p-90)';
  }
  return '';
};

export const resolveColor = (statusArg: string): string => {
  switch (statusArg) {
    case 'closed':
      return 'var(--color-neutral-90)';
    case 'todo':
      return 'var(--color-dark-orange-00)';
    case 'edit':
      return 'var(--color-info)';
    case 'failed':
      return 'var(--color-error)';
    case 'pending':
      return 'var(--color-info)';
    case 'success':
      return 'var(--color-success)';
    case 'canceled':
      return 'var(--color-error)';
    case 'draft':
      return 'var(--color-lavender-purple-00)';
  }
  return '';
};

export const resolveLeadingIcon = (statusArg: string): string => {
  switch (statusArg) {
    case 'closed':
      return 'ri-close-circle-fill';
    case 'todo':
      return 'ri-circle-line';
    case 'edit':
      return 'ri-pencil-fill';
    case 'failed':
      return 'ri-error-warning-fill';
    case 'pending':
      return 'ri-time-fill';
    case 'success':
      return 'ri-checkbox-circle-fill';
    case 'canceled':
      return 'ri-close-circle-fill';
    case 'draft':
      return 'ri-draft-fill';
  }
  return '';
};

export const resolveText = (statusArg: string): string => {
  switch (statusArg) {
    case 'closed':
      return 'Closed';
    case 'todo':
      return 'To do';
    case 'edit':
      return 'Edit';
    case 'failed':
      return 'Failed';
    case 'pending':
      return 'Pending';
    case 'success':
      return 'Success';
    case 'canceled':
      return 'Canceled';
    case 'draft':
      return 'Draft';
    default:
      return '';
  }
};
