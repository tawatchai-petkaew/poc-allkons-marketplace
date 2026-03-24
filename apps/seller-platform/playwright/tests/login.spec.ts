import { test, expect } from "@playwright/test";
import LoginPage from "../page-objects/LoginPage";
import { TEST_DATA } from "../fixtures/test-data";

test.setTimeout(120_000);

test.describe("Register Flow", () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.goto();
  });

  test("should complete register flow with phone and password", async () => {
    // Step 1: Start registration flow
    const phone = TEST_DATA.auth.phone;
    await loginPage.registerWithPhone(phone);

    // Step 2: Submit OTP (defaults to 999999)
    await loginPage.submitOtp();

    // Step 3: Set password
    const password = TEST_DATA.auth.password;
    await loginPage.setPassword(password);

    // Step 4: Fill personal info form
    const { firstName, lastName, email } = TEST_DATA.personalInfo;
    await loginPage.fillPersonalInfo(firstName, lastName, email);

    // Step 5: Fill identity info form
    const { registrationNumber, idCard, registrationName, accountType } =
      TEST_DATA.identityInfo;
    await loginPage.fillIdentityForm(
      registrationNumber,
      idCard,
      registrationName,
      accountType,
    );

    // Step 6: Accept consent modal
    await loginPage.acceptConsent();

    // Step 7: Create shop and verify dashboard
    const { shopName } = TEST_DATA.shopInfo;
    await loginPage.createShop(shopName);
  });
});
