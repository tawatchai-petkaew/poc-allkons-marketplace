import { Page, Locator, expect } from "@playwright/test";
import { TEST_DATA } from "../fixtures/test-data";

export default class LoginPage {
  readonly page: Page;

  // login form
  readonly txtAuthWelcome: Locator;
  readonly titleAuth: Locator;
  readonly groupLoginMethod: Locator;
  readonly alertLoginError: Locator;
  readonly inputLoginPhone: Locator;
  readonly btnGoRegister: Locator;
  readonly btnLoginSubmit: Locator;
  readonly inputLoginUsername: Locator;
  readonly inputLoginPassword: Locator;

  // otp form
  readonly formOtp: Locator;
  readonly txtOtpTitle: Locator;
  readonly txtOtpSentTo: Locator;
  readonly txtOtpRefCode: Locator;
  readonly groupOtp: Locator;
  readonly btnOtpResend: Locator;
  readonly btnOtpConfirm: Locator;

  // register form
  readonly formRegisterStart: Locator;
  readonly inputRegisterPhone: Locator;
  readonly btnGoLogin: Locator;
  readonly btnRegisterSubmit: Locator;

  // set-password form
  readonly formRegisterPassword: Locator;
  readonly inputPassword: Locator;
  readonly barPasswordStrength: Locator;
  readonly txtPasswordStrengthLabel: Locator;
  readonly inputConfirmPassword: Locator;
  readonly rulePasswordMin8: Locator;
  readonly rulePasswordAlnum: Locator;
  readonly rulePasswordMatch: Locator;
  readonly btnPasswordNext: Locator;

  // register personal info form
  readonly formRegisterPersonal: Locator;
  readonly badgeRegisterStep: Locator;
  readonly inputFirstName: Locator;
  readonly inputLastName: Locator;
  readonly inputTelNumber: Locator;
  readonly inputEmail: Locator;
  readonly checkboxConsentTerms: Locator;
  readonly checkboxConsentMarketing: Locator;
  readonly linkTermsOfService: Locator;
  readonly linkPrivacyPolicy: Locator;
  readonly linkMarketingPolicy: Locator;
  readonly btnPersonalNext: Locator;

  // register identity form (for registered individual)
  readonly formRegisterIdentity: Locator;
  readonly groupAccountType: Locator;
  readonly cardAccountTypeSoleProp: Locator;
  readonly cardAccountTypeCorporate: Locator;
  readonly inputRegistrationNumber: Locator;
  readonly btnIdCardVerify: Locator;
  readonly inputIdCard: Locator;
  readonly inputRegistrationName: Locator;
  readonly btnAcceptRegister: Locator;

  // consent modal form
  readonly modalContent: Locator;
  readonly btnScrollDownConsent: Locator;
  readonly checkboxConsentAccept: Locator;
  readonly btnAcceptConsent: Locator;

  // shop creation form
  readonly inputShopName: Locator;
  readonly btnCreateShop: Locator;
  readonly txtDashboardWelcome: Locator;

  constructor(page: Page) {
    this.page = page;

    // login form selectors
    this.txtAuthWelcome = page.getByTestId("txt--auth-welcome");
    this.titleAuth = page.getByTestId("title--auth");
    this.groupLoginMethod = page.getByTestId("group--login-method");
    this.alertLoginError = page.getByTestId("alert--login-error");
    this.inputLoginPhone = page.getByTestId("input--login-phone");
    this.btnGoRegister = page.getByTestId("btn--go-register");
    this.btnLoginSubmit = page.getByTestId("btn--login-submit");
    this.inputLoginUsername = page.getByTestId("input--login-username");
    this.inputLoginPassword = page.getByTestId("input--login-password");

    // otp form selectors
    this.formOtp = page.getByTestId("form--otp");
    this.txtOtpTitle = page.getByTestId("txt--otp-title");
    this.txtOtpSentTo = page.getByTestId("txt--otp-sent-to");
    this.txtOtpRefCode = page.getByTestId("txt--otp-ref-code");
    this.groupOtp = page.getByTestId("group--otp");
    this.btnOtpResend = page.getByTestId("btn--otp-resend");
    this.btnOtpConfirm = page.getByTestId("btn--otp-confirm");

    // register form selectors
    this.formRegisterStart = page.getByTestId("form--register-start");
    this.inputRegisterPhone = page.getByTestId("input--register-phone");
    this.btnGoLogin = page.getByTestId("btn--go-login");
    this.btnRegisterSubmit = page.getByTestId("btn--register-submit");

    // set-password form selectors
    this.formRegisterPassword = page.getByTestId("form--register-password");
    this.inputPassword = page.getByTestId("input--password");
    this.barPasswordStrength = page.getByTestId("bar--password-strength");
    this.txtPasswordStrengthLabel = page.getByTestId(
      "txt--password-strength-label",
    );
    this.inputConfirmPassword = page.getByTestId("input--confirm-password");
    this.rulePasswordMin8 = page.getByTestId("rule--password-min-8");
    this.rulePasswordAlnum = page.getByTestId("rule--password-alnum");
    this.rulePasswordMatch = page.getByTestId("rule--password-match");
    this.btnPasswordNext = page.getByTestId("btn--password-next");

    // register personal info form selectors
    this.formRegisterPersonal = page.getByTestId("form--register-personal");
    this.badgeRegisterStep = page.getByTestId("badge--register-step");
    this.inputFirstName = page.getByTestId("login-text-field-first-name");
    this.inputLastName = page.getByTestId("input--last-name");
    this.inputTelNumber = page.getByTestId("input--tel-number");
    this.inputEmail = page.getByTestId("input--email");
    this.checkboxConsentTerms = page.getByTestId("checkbox--consent-terms");
    this.checkboxConsentMarketing = page.getByTestId(
      "checkbox--consent-marketing",
    );
    this.linkTermsOfService = page.getByTestId("link--terms-of-service");
    this.linkPrivacyPolicy = page.getByTestId("link--privacy-policy");
    this.linkMarketingPolicy = page.getByTestId("link--marketing-policy");
    this.btnPersonalNext = page.getByTestId("btn--personal-next");

    // register identity form selectors (for registered individual)
    this.formRegisterIdentity = page.getByTestId("form--register-identity");
    this.groupAccountType = page.getByTestId("group--account-type");
    this.cardAccountTypeSoleProp = page.getByTestId(
      "card--account-type-sole-prop",
    );
    this.cardAccountTypeCorporate = page.getByTestId(
      "card--account-type-corporate",
    );
    this.inputRegistrationNumber = page.getByTestId(
      "input--registration-number",
    );
    this.btnIdCardVerify = page.getByTestId("btn--id-card-verify");
    this.inputIdCard = page.getByTestId("input--id-card");
    this.inputRegistrationName = page.getByTestId(
      "login-text-field-registration-name",
    );
    this.btnAcceptRegister = page.getByTestId("btn--accept-register");

    // consent modal form selectors
    this.modalContent = page.locator(".ant-modal-content");
    // Two scroll buttons exist (mobile + desktop) — use first visible one
    this.btnScrollDownConsent = page
      .getByTestId("btn--consent-scroll-down")
      .first();
    this.checkboxConsentAccept = page.getByTestId("checkbox--consent-accept");
    this.btnAcceptConsent = page.getByTestId("btn--consent-accept");

    // shop creation form selectors
    this.inputShopName = page.getByTestId("login-text-field-shop-name");
    this.btnCreateShop = page.getByTestId("btn--shop-create");
    this.txtDashboardWelcome = page.getByText("Welcome to Dashboard");
  }

  async goto() {
    await this.page.goto(`${TEST_DATA.baseUrl}/login`);
    await expect(this.inputLoginPhone).toBeVisible();
  }

  /**
   * Fill the phone login fields and submit.
   */
  async loginWithPhone(phone: string) {
    await this.inputLoginPhone.fill(phone);
    await expect(this.btnLoginSubmit).toBeEnabled();
    await this.btnLoginSubmit.click();
  }

  /**
   * Fill the username/password login fields and submit.
   */
  async loginWithUsername(username: string, password: string) {
    await expect(this.inputLoginUsername).toBeVisible();
    await expect(this.inputLoginPassword).toBeVisible();
    await this.inputLoginUsername.fill(username);
    await this.inputLoginPassword.fill(password);
    await expect(this.btnLoginSubmit).toBeEnabled();
    await this.btnLoginSubmit.click();
  }

  /**
   * Start registration flow by clicking the link, filling the phone,
   * and submitting the register form.
   */
  async registerWithPhone(phone: string) {
    // assume we are on login page
    await expect(this.btnGoRegister).toBeVisible();
    await this.btnGoRegister.click({ force: true });
    await expect(this.formRegisterStart).toBeVisible({ timeout: 10000 });
    // Wait for slide animation (duration-500) to complete
    await this.page.waitForTimeout(600);
    await expect(this.inputRegisterPhone).toBeVisible();
    await this.inputRegisterPhone.fill(phone);
    await expect(this.btnRegisterSubmit).toBeEnabled();
    await this.btnRegisterSubmit.click({ force: true });
  }

  /**
   * Fill the OTP input field-by-field (6 separate inputs) with code digits.
   * Each digit is entered into its corresponding OTP input box.
   * Defaults to using 999999 if no code provided.
   */
  async submitOtp(code: string = "999999") {
    // Wait for OTP form after API calls (checkRegister + sendToken)
    await expect(this.formOtp).toBeVisible({ timeout: 15000 });
    // Wait for slide animation (duration-500) to complete
    await this.page.waitForTimeout(600);

    // Fill each OTP input individually
    const otpDigits = code.split("");
    for (let i = 0; i < otpDigits.length && i < 6; i++) {
      const otpInput = this.page.locator(
        `input[aria-label="OTP Input ${i + 1}"]`,
      );
      await expect(otpInput).toBeVisible();
      await otpInput.fill(otpDigits[i]);
    }

    // After filling all digits, the form may auto-submit via Ant Design OTP.
    // Check if password form already appeared; if not, click the confirm button.
    const alreadySubmitted = await this.formRegisterPassword
      .isVisible()
      .catch(() => false);

    if (!alreadySubmitted) {
      await expect(this.btnOtpConfirm).toBeEnabled();
      await this.btnOtpConfirm.click({ force: true });
    }

    // Wait for password form to appear after OTP submission
    await expect(this.formRegisterPassword).toBeVisible({ timeout: 15000 });
    // Wait for slide animation (duration-500) to complete
    await this.page.waitForTimeout(600);
  }

  /**
   * Fill password and confirm password fields then submit.
   * Defaults to using the same value for both inputs.
   */
  async setPassword(password: string) {
    await expect(this.formRegisterPassword).toBeVisible();
    await expect(this.inputPassword).toBeVisible();
    await expect(this.inputConfirmPassword).toBeVisible();
    await this.inputPassword.fill(password);
    await this.inputConfirmPassword.fill(password);
    await expect(this.btnPasswordNext).toBeEnabled();
    await this.btnPasswordNext.click({ force: true });
    // Wait for personal info form after API call (registerAccountAndUser)
    await expect(this.formRegisterPersonal).toBeVisible({ timeout: 15000 });
    // Wait for slide animation (duration-500) to complete
    await this.page.waitForTimeout(600);
  }

  /**
   * Fill personal information form with first name, last name, and email.
   * Automatically checks both consent checkboxes and submits the form.
   */
  async fillPersonalInfo(firstName: string, lastName: string, email: string) {
    await expect(this.formRegisterPersonal).toBeVisible();
    await expect(this.inputFirstName).toBeVisible();
    await expect(this.inputLastName).toBeVisible();
    await expect(this.inputEmail).toBeVisible();

    // Fill personal information
    await this.inputFirstName.fill(firstName);
    await this.inputLastName.fill(lastName);
    await this.inputEmail.fill(email);

    // Check consent checkboxes using `.check({ force: true })` to bypass overlay interception
    await expect(this.checkboxConsentTerms).toBeVisible();
    await this.checkboxConsentTerms.check({ force: true });

    await expect(this.checkboxConsentMarketing).toBeVisible();
    await this.checkboxConsentMarketing.check({ force: true });

    // Submit form
    await expect(this.btnPersonalNext).toBeEnabled();
    await this.btnPersonalNext.click({ force: true });
    // Wait for identity form after API calls (checkEmail + registerProfile + getConsent + sendConsent)
    await expect(this.formRegisterIdentity).toBeVisible({ timeout: 30000 });
    // Wait for slide animation (duration-500) to complete
    await this.page.waitForTimeout(600);
  }

  /**
   * Fill registered individual identity form.
   * Defaults to selecting sole proprietor account type.
   */
  async fillIdentityForm(
    registrationNumber: string,
    idCard: string,
    registrationName: string,
    accountType:
      | "REGISTERED_INDIVIDUAL"
      | "CORPORATE" = "REGISTERED_INDIVIDUAL",
  ) {
    await expect(this.formRegisterIdentity).toBeVisible({ timeout: 10000 });
    await expect(this.groupAccountType).toBeVisible();
    // Wait for network to be idle to ensure overlays complete
    await this.page.waitForLoadState("networkidle");

    // Select account type (default: Sole Proprietor)
    if (accountType === "REGISTERED_INDIVIDUAL") {
      await this.cardAccountTypeSoleProp.click({ force: true });
    } else {
      await this.cardAccountTypeCorporate.click({ force: true });
    }

    // Fill registration number
    await expect(this.inputRegistrationNumber).toBeVisible();
    await this.inputRegistrationNumber.fill(registrationNumber);

    // Wait for verification (assumes auto-verification or button click)
    await expect(this.btnIdCardVerify).toBeVisible();
    if (!(await this.btnIdCardVerify.isDisabled())) {
      await this.btnIdCardVerify.click({ force: true });
    }

    // Fill ID card number
    await expect(this.inputIdCard).toBeVisible();
    await this.inputIdCard.fill(idCard);

    // Fill registration name
    await expect(this.inputRegistrationName).toBeVisible();
    await this.inputRegistrationName.fill(registrationName);

    // wait for validation/network activity to settle before checking button
    await this.page.waitForLoadState("networkidle");

    // Submit form (allow extra time for button to enable)
    await expect(this.btnAcceptRegister).toBeEnabled({ timeout: 15000 });
    await this.btnAcceptRegister.click({ force: true });
  }

  /**
   * Accept consent modal for terms and conditions.
   * Scrolls down to view checkbox, checks it, and submits consent.
   */
  async acceptConsent() {
    // Wait for modal to be visible
    await expect(this.modalContent).toBeVisible({ timeout: 15000 });

    // Scroll the consent content to bottom directly via JS
    // (avoids issues with mobile/desktop conditional scroll buttons)
    await this.modalContent.evaluate((modal) => {
      const scrollContainer = modal.querySelector(".overflow-y-auto");
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    });
    await this.page.waitForTimeout(500);

    // Check the consent checkbox
    await expect(this.checkboxConsentAccept).toBeVisible();
    await this.checkboxConsentAccept.click({ force: true });

    // Click accept button
    await expect(this.btnAcceptConsent).toBeEnabled();
    await this.btnAcceptConsent.click({ force: true });
  }

  /**
   * Create shop by filling shop name and submitting the form.
   * Verifies dashboard loaded by waiting for "Welcome to Dashboard" text.
   */
  async createShop(shopName: string) {
    // Fill shop name
    await expect(this.inputShopName).toBeVisible();
    await this.inputShopName.fill(shopName);

    // Click create shop button
    await expect(this.btnCreateShop).toBeEnabled();
    await this.btnCreateShop.click({ force: true });

    // Verify dashboard loaded (allow time for navigation and session setup)
    await expect(this.txtDashboardWelcome).toBeVisible({ timeout: 30000 });
  }
}
