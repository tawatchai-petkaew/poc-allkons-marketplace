import { AuthState, Step, AuthFlow } from './types';

// // ===== Initial State (Mock SET_ORGANIZATION) =====
// export const INITIAL_AUTH_STATE: AuthState = {
//   flow: 'register',
//   currentStep: Step.SET_ORGANIZATION,
//   phoneNumber: '0812345678', // Mock phone number
//   otpData: { token: 'mock-token', refNo: 'mock-ref' },
//   password: 'mockPassword123',
//   blockInfo: { isBlocked: false, countdownTime: 0 },
//   isSuccessResendOtp: false,
//   isRegisterSuccess: false,
//   accessToken: 'mock-access-token',
// };

// // ===== Initial State (Mock SET_PROFILE) =====
// export const INITIAL_AUTH_STATE: AuthState = {
//   flow: 'register',
//   currentStep: Step.SET_PROFILE,
//   phoneNumber: '0812345678', // Mock phone number
//   otpData: { token: 'mock-token', refNo: 'mock-ref' },
//   password: 'mockPassword123',
//   blockInfo: { isBlocked: false, countdownTime: 0 },
//   isSuccessResendOtp: false,
//   isRegisterSuccess: false,
//   accessToken: 'mock-access-token',
// };

export const INITIAL_AUTH_STATE: AuthState = {
  flow: 'login',
  currentStep: Step.LOGIN,
  phoneNumber: null,
  otpData: { token: '', refNo: '' },
  password: '',
  blockInfo: { isBlocked: false, countdownTime: 0 },
  isSuccessResendOtp: false,
  isRegisterSuccess: false,
  accessToken: null,
};

// ===== Flow Step Orders =====
/**
 * Login Flow: LOGIN → OTP → (complete)
 * Register Flow: REGISTER → OTP → SET_PASSWORD → SET_PROFILE → SET_ORGANIZATION → SUCCESS
 * Complete Profile Flow: SET_PROFILE → SET_ORGANIZATION → (complete)
 */
export const FLOW_STEPS: Record<AuthFlow, Step[]> = {
  login: [Step.LOGIN, Step.OTP],
  register: [
    Step.REGISTER,
    Step.OTP,
    Step.SET_PASSWORD,
    Step.SET_PROFILE,
    Step.SET_ORGANIZATION,
    Step.SUCCESS,
  ],
  'complete-profile': [Step.SET_PROFILE, Step.SET_ORGANIZATION],
};

// ===== Step Configuration =====
export const STEP_CONFIG = {
  [Step.LOGIN]: {
    title: 'เข้าสู่ระบบ',
    canGoBack: false,
  },
  [Step.REGISTER]: {
    title: 'สมัครสมาชิก',
    canGoBack: false,
  },
  [Step.OTP]: {
    title: 'ยืนยัน OTP',
    canGoBack: true,
  },
  [Step.SET_PASSWORD]: {
    title: 'ตั้งรหัสผ่าน',
    canGoBack: false,
  },
  [Step.SET_PROFILE]: {
    title: 'ข้อมูลส่วนตัว',
    canGoBack: false,
  },
  [Step.SET_ORGANIZATION]: {
    title: 'ข้อมูลองค์กร',
    canGoBack: false,
  },
  [Step.BLOCKED]: {
    title: 'ถูกบล็อค',
    canGoBack: true,
  },
  [Step.SUCCESS]: {
    title: 'สำเร็จ',
    canGoBack: false,
  },
} as const;

// ===== All Steps Order (for animation) =====
export const ALL_STEPS_ORDER: Step[] = [
  Step.LOGIN,
  Step.REGISTER,
  Step.OTP,
  Step.SET_PASSWORD,
  Step.SET_PROFILE,
  Step.SET_ORGANIZATION,
  Step.BLOCKED,
  Step.SUCCESS,
];

// ===== Error Messages =====
export const ERROR_MESSAGES = {
  PHONE_NOT_REGISTERED: 'เบอร์โทรศัพท์นี้ยังไม่เคยสมัคร กรุณาสมัครสมาชิกก่อน',
  PHONE_ALREADY_REGISTERED:
    'เบอร์โทรศัพท์นี้ถูกใช้สมัครแล้วในระบบ กรุณาใช้เบอร์อื่น',
  OTP_INVALID: (remaining: number) =>
    `OTP ไม่ถูกต้อง กรุณากรอกใหม่ (เหลือ ${remaining} ครั้ง)`,
  OTP_BLOCKED_TITLE: 'คุณกรอก OTP ผิดเกินจำนวนที่กำหนด',
  OTP_BLOCKED_MESSAGE: 'เพื่อทำการลงทะเบียนอีกครั้ง',
} as const;

// ===== Success Messages =====
export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'เข้าสู่ระบบสำเร็จ',
  REGISTER_SUCCESS_TITLE: 'สมัครสมาชิกสำเร็จ',
  REGISTER_SUCCESS_MESSAGE:
    'เข้าสู่ระบบเพื่อเริ่มต้นใช้งานและเข้าถึงบริการทั้งหมด',
} as const;

// ===== Country Code =====
export const DEFAULT_COUNTRY_CODE = '66';

// ===== Consent IDs =====
export const DEFAULT_CONSENT_IDS = [3];

// ===== Platform =====
export const PLATFORM = 'BUYER';
