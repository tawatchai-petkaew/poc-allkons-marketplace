/**
 * Test data fixtures
 * Centralized configuration for test credentials and URLs
 */

// Generate unique email for each test run to avoid duplicate email errors
function generateUniqueEmail(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `test_${timestamp}_${random}@example.com`;
}

export const TEST_DATA = {
  baseUrl:
    process.env.PLAYWRIGHT_BASE_URL ||
    "https://marketplace-seller-sit.allkons.com", // Default to localhost for local testing
  auth: {
    phone: process.env.TEST_PHONE || "0925329011",
    password: process.env.TEST_PASSWORD || "P@ssw0rd",
  },
  personalInfo: {
    firstName: process.env.TEST_FIRST_NAME || "นิว",
    lastName: process.env.TEST_LAST_NAME || "ออโต้เมท",
    email: process.env.TEST_EMAIL || generateUniqueEmail(),
  },
  identityInfo: {
    registrationNumber: process.env.TEST_REGISTRATION_NUMBER || "9278953570915",
    idCard: process.env.TEST_ID_CARD || "6759700673858",
    registrationName: process.env.TEST_REGISTRATION_NAME || "นิว ออโต้เมท",
    accountType:
      (process.env.TEST_ACCOUNT_TYPE as
        | "REGISTERED_INDIVIDUAL"
        | "CORPORATE") || "REGISTERED_INDIVIDUAL",
  },
  shopInfo: {
    shopName: process.env.TEST_SHOP_NAME || "นิว ออโต้เมทค้าส่ง",
  },
};
