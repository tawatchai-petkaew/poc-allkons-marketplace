import dayjs from 'dayjs';

// Date utility functions
// Add shared date utilities here when needed

export const formatDate = (date: Date | string, format: string = 'YYYY-MM-DD'): string => {
  return dayjs(date).format(format);
};
