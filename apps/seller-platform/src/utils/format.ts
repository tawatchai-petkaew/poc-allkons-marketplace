import dayjs from "dayjs";

/**
 * Hash a name by showing 40% of characters and replacing the rest with asterisks
 */
export const hashName = (name: string): string => {
  if (!name || name.length <= 3) return name;
  const visibleChars = Math.ceil(name.length * 0.4); // Show 40% of characters
  const hashedPart = "*".repeat(name.length - visibleChars);
  return name.substring(0, visibleChars) + hashedPart;
};

/**
 * Hash email address (showing first 3 chars and domain)
 * Example: john.doe@example.com → joh*****@example.com
 */
export const hashEmail = (email: string): string => {
  if (!email || !email.includes("@")) return email;

  const [localPart, domain] = email.split("@");

  if (localPart.length <= 3) {
    return `${localPart[0]}***@${domain}`;
  }

  const visibleChars = 3;
  const hiddenLength = localPart.length - visibleChars;
  const hashedPart = "*".repeat(hiddenLength);

  return `${localPart.substring(0, visibleChars)}${hashedPart}@${domain}`;
};

export const removeLeadingZero = (phone: string): string => {
  if (phone[0] === "0") {
    return phone.slice(1);
  }
  return phone;
};

export const formatPhone = (phone: string): string => {
  if (!phone) return "";
  const cleaned = phone.replace(/\D/g, "");
  // Prepend leading 0 for 9-digit numbers (stored without country code prefix)
  const normalized = cleaned.length === 9 ? `0${cleaned}` : cleaned;
  const match = normalized.match(/^(\d{3})(\d{3})(\d{4})$/);
  if (match) {
    return `${match[1]}-${match[2]}-${match[3]}`;
  }
  return phone;
};

export const hashPhone = (phone: string): string => {
  if (!phone) return "";
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.length < 9) return phone;
  // Handle both 9-digit (without leading 0) and 10-digit phone numbers
  const formatted = cleaned.length === 9 ? `0${cleaned}` : cleaned;
  return `${formatted.substring(0, 3)}-***-**${formatted.substring(formatted.length - 2)}`;
};

export const formatFullName = (
  firstName: string,
  lastName: string,
  middleName?: string,
  isHashed?: boolean,
): string => {
  const first = isHashed ? hashName(firstName) : firstName;
  const last = isHashed ? hashName(lastName) : lastName;
  const middle = middleName
    ? isHashed
      ? hashName(middleName)
      : middleName
    : "";
  return `${first} ${middle ? middle + " " : ""}${last}`.trim();
};

export const resolvedRoleDisplayName = (roleName: string): string => {
  switch (roleName) {
    case "Owner":
      return "เจ้าของ";
    case "Member":
      return "สมาชิก";
    case "Admin":
      return "ผู้ดูแลระบบ";
    case "Super Admin":
      return "ผู้ดูแลระบบสูงสุด";
    default:
      return roleName;
  }
};

export const getFirstChar = (str: string): string => {
  if (!str) return "";
  return str.charAt(0).toUpperCase();
};

/**
 * Format number with comma separators and fixed decimals
 */
export const formatNumber = (
  num: number | string | undefined | null,
  decimals = 0,
): string => {
  if (num === undefined || num === null) return "-";
  const val = typeof num === "string" ? parseFloat(num) : num;
  if (isNaN(val)) return "-";
  return val.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
};

/**
 * Format date time string using dayjs
 */
export const formatDateTime = (
  date: string | number | Date | undefined | null,
  format = "DD/MM/YYYY HH:mm",
): string => {
  if (!date) return "-";
  const d = dayjs(date);
  if (!d.isValid()) return "-";
  return d.format(format);
};
