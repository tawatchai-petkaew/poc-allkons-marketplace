"use client";

import { useReducer, useCallback, useEffect } from "react";
import { Form } from "antd";
import {
  AuthState,
  AuthAction,
  AuthFlow,
  Step,
  OtpData,
  BlockInfo,
  AuthForms,
  PhoneFormFields,
  OtpFormFields,
  PasswordFormFields,
  ProfileFormFields,
  OrganizationFormFields,
  PhoneRegisterFormFields,
  ExistingOrganization,
} from "@/app/login/types";
import {
  INITIAL_AUTH_STATE,
  FLOW_STEPS,
  ALL_STEPS_ORDER,
  STEP_CONFIG,
} from "@/app/login/constants";

// ===== Reducer =====
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case "SET_FLOW":
      return { ...state, flow: action.payload };
    case "SET_STEP":
      return { ...state, currentStep: action.payload };
    case "SET_PHONE_NUMBER":
      return { ...state, phoneNumber: action.payload };
    case "SET_OTP_DATA":
      return { ...state, otpData: action.payload };
    case "SET_PASSWORD":
      return { ...state, password: action.payload };
    case "SET_BLOCK_INFO":
      return { ...state, blockInfo: action.payload };
    case "SET_RESEND_OTP_SUCCESS":
      return { ...state, isSuccessResendOtp: action.payload };
    case "SET_REGISTER_SUCCESS":
      return { ...state, isRegisterSuccess: action.payload };
    case "SET_AUTH_DATA":
      return { ...state, authData: action.payload };
    case "SET_EXISTING_ORGANIZATIONS":
      return { 
        ...state, 
        existingRegisteredIndividualOrgs: action.payload.registeredIndividualOrgs,
        existingJuristicOrgs: action.payload.juristicOrgs,
      };
    case "RESET_STATE":
      return INITIAL_AUTH_STATE;
    default:
      return state;
  }
};

// ===== Custom Hook =====
export const useAuthFlow = () => {
  const [state, dispatch] = useReducer(authReducer, INITIAL_AUTH_STATE);

  // Form instances
  const [loginForm] = Form.useForm<PhoneFormFields>();
  const [registerForm] = Form.useForm<PhoneRegisterFormFields>();
  const [otpForm] = Form.useForm<OtpFormFields>();
  const [passwordForm] = Form.useForm<PasswordFormFields>();
  const [profileForm] = Form.useForm<ProfileFormFields>();
  const [organizationForm] = Form.useForm<OrganizationFormFields>();

  const forms: AuthForms = {
    loginForm,
    registerForm,
    otpForm,
    passwordForm,
    profileForm,
    organizationForm,
  };

  // ===== Core Actions =====
  const setFlow = useCallback((flow: AuthFlow) => {
    dispatch({ type: "SET_FLOW", payload: flow });
  }, []);

  const setStep = useCallback((step: Step) => {
    dispatch({ type: "SET_STEP", payload: step });
  }, []);

  const setPhoneNumber = useCallback((phone: string | null) => {
    dispatch({ type: "SET_PHONE_NUMBER", payload: phone });
  }, []);

  const setOtpData = useCallback((data: OtpData) => {
    dispatch({ type: "SET_OTP_DATA", payload: data });
  }, []);

  const setPassword = useCallback((password: string) => {
    dispatch({ type: "SET_PASSWORD", payload: password });
  }, []);

  const setBlockInfo = useCallback((info: BlockInfo) => {
    dispatch({ type: "SET_BLOCK_INFO", payload: info });
  }, []);

  const setResendOtpSuccess = useCallback((success: boolean) => {
    dispatch({ type: "SET_RESEND_OTP_SUCCESS", payload: success });
  }, []);

  const setRegisterSuccess = useCallback((success: boolean) => {
    dispatch({ type: "SET_REGISTER_SUCCESS", payload: success });
  }, []);

  const setAuthData = useCallback((authData: { accessToken: string; authCenter: { accessToken: string; expiresIn: string; refreshExpiresIn: number; refreshToken: string } } | null) => {
    dispatch({ type: "SET_AUTH_DATA", payload: authData });
  }, []);

  const setExistingOrganizations = useCallback((payload: { registeredIndividualOrgs: ExistingOrganization[] | null; juristicOrgs: ExistingOrganization[] | null }) => {
    dispatch({ type: "SET_EXISTING_ORGANIZATIONS", payload });
  }, []);

  const resetAllForms = useCallback(() => {
    loginForm.resetFields();
    registerForm.resetFields();
    otpForm.resetFields();
    passwordForm.resetFields();
    profileForm.resetFields();
    organizationForm.resetFields();
  }, [loginForm, registerForm, otpForm, passwordForm, profileForm, organizationForm]);

  const resetState = useCallback(() => {
    dispatch({ type: "RESET_STATE" });
    resetAllForms();
  }, [resetAllForms]);

  // ===== Flow Navigation =====

  // Start login flow
  const startLoginFlow = useCallback(() => {
    resetAllForms();
    setFlow("login");
    setStep(Step.LOGIN);
  }, [setFlow, setStep, resetAllForms]);

  // Start register flow
  const startRegisterFlow = useCallback(() => {
    resetAllForms();
    setFlow("register");
    setStep(Step.REGISTER);
  }, [setFlow, setStep, resetAllForms]);

  // Start complete-profile flow (edge case: login with incomplete profile)
  const startCompleteProfileFlow = useCallback(
    (authData: { accessToken: string; authCenter: { accessToken: string; expiresIn: string; refreshExpiresIn: number; refreshToken: string } }) => {
      setFlow("complete-profile");
      setAuthData(authData);
      setStep(Step.SET_PROFILE);
    },
    [setFlow, setAuthData, setStep],
  );

  // Start complete-organization flow (edge case: login with profile completed but organization incomplete)
  const startCompleteOrganizationFlow = useCallback(
    (authData: { accessToken: string; authCenter: { accessToken: string; expiresIn: string; refreshExpiresIn: number; refreshToken: string } }) => {
      setFlow("complete-profile");
      setAuthData(authData);
      setStep(Step.SET_ORGANIZATION);
    },
    [setFlow, setAuthData, setStep],
  );

  // Go to next step in current flow
  const goToNextStep = useCallback(() => {
    const flowSteps = FLOW_STEPS[state.flow];
    const currentIndex = flowSteps.indexOf(state.currentStep);

    if (currentIndex < flowSteps.length - 1) {
      const nextStep = flowSteps[currentIndex + 1];
      setStep(nextStep);
      return nextStep;
    }
    return null;
  }, [state.flow, state.currentStep, setStep]);

  // Go to previous step in current flow
  const goToPrevStep = useCallback(() => {
    const flowSteps = FLOW_STEPS[state.flow];
    const currentIndex = flowSteps.indexOf(state.currentStep);

    if (currentIndex > 0) {
      const prevStep = flowSteps[currentIndex - 1];
      setStep(prevStep);
      return prevStep;
    }
    return null;
  }, [state.flow, state.currentStep, setStep]);

  // Direct navigation
  const goToStep = useCallback(
    (step: Step) => {
      setStep(step);
    },
    [setStep],
  );

  // Go to OTP step
  const goToOtp = useCallback(() => {
    setStep(Step.OTP);
    setResendOtpSuccess(true);
  }, [setStep, setResendOtpSuccess]);

  // Go to set password step
  const goToSetPassword = useCallback(() => {
    setStep(Step.SET_PASSWORD);
    otpForm.resetFields();
  }, [setStep, otpForm]);

  // Go to set profile step
  const goToSetProfile = useCallback(() => {
    setStep(Step.SET_PROFILE);
  }, [setStep]);

  // Go to set organization step
  const goToSetOrganization = useCallback(() => {
    setStep(Step.SET_ORGANIZATION);
  }, [setStep]);

  // Go to success step
  const goToSuccess = useCallback(() => {
    setStep(Step.SUCCESS);
    setRegisterSuccess(true);
  }, [setStep, setRegisterSuccess]);

  // Go to blocked state
  const goToBlocked = useCallback(
    (countdownTime: number) => {
      setBlockInfo({ isBlocked: true, countdownTime });
      setStep(Step.BLOCKED);
    },
    [setBlockInfo, setStep],
  );

  // Handle back navigation
  const goBack = useCallback(() => {
    const { currentStep, flow } = state;

    // Handle blocked state
    if (currentStep === Step.BLOCKED) {
      setBlockInfo({ isBlocked: false, countdownTime: 0 });
      if (flow === "login") {
        startLoginFlow();
      } else {
        startRegisterFlow();
      }
      otpForm.resetFields();
      return;
    }

    // Handle navigation based on current step
    switch (currentStep) {
      case Step.OTP:
        setResendOtpSuccess(false);
        setBlockInfo({ isBlocked: false, countdownTime: 0 });
        otpForm.resetFields();
        if (flow === "login") {
          startLoginFlow();
        } else {
          startRegisterFlow();
        }
        break;

      // SET_PASSWORD, SET_PROFILE, SET_ORGANIZATION cannot go back
      case Step.SET_PASSWORD:
      case Step.SET_PROFILE:
      case Step.SET_ORGANIZATION:
        // No back navigation for these steps
        return;

      default:
        break;
    }
  }, [state, setBlockInfo, setResendOtpSuccess, otpForm, startLoginFlow, startRegisterFlow]);

  // ===== Countdown Effect =====
  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    if (state.blockInfo.isBlocked && state.blockInfo.countdownTime > 0) {
      intervalId = setInterval(() => {
        const newTime = state.blockInfo.countdownTime - 1;
        if (newTime <= 0) {
          setBlockInfo({ isBlocked: false, countdownTime: 0 });
          if (state.flow === "login") {
            startLoginFlow();
          } else {
            startRegisterFlow();
          }
        } else {
          setBlockInfo({ ...state.blockInfo, countdownTime: newTime });
        }
      }, 1000);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [state.blockInfo, state.flow, setBlockInfo, startLoginFlow, startRegisterFlow]);

  // ===== Utilities =====
  const formatPhoneNumber = useCallback((phone: string): string => {
    return phone.startsWith("0") ? phone.slice(1) : phone;
  }, []);

  const formatCountdownTime = useCallback((seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, "0")} : ${remainingSeconds.toString().padStart(2, "0")}`;
  }, []);

  const calculateBlockTime = useCallback((blockUntil: string): number => {
    const blockUntilTime = new Date(blockUntil).getTime();
    const currentTime = new Date().getTime();
    return Math.max(Math.floor((blockUntilTime - currentTime) / 1000), 0);
  }, []);

  const canGoBack = useCallback((): boolean => {
    const config = STEP_CONFIG[state.currentStep];
    return config?.canGoBack ?? false;
  }, [state.currentStep]);

  const isLoginFlow = useCallback((): boolean => {
    return state.flow === "login";
  }, [state.flow]);

  const isRegisterFlow = useCallback((): boolean => {
    return state.flow === "register";
  }, [state.flow]);

  const isCompleteProfileFlow = useCallback((): boolean => {
    return state.flow === "complete-profile";
  }, [state.flow]);

  // Get step index for animation
  const getStepIndex = useCallback((step: Step): number => {
    return ALL_STEPS_ORDER.indexOf(step);
  }, []);

  // Get transform class for animation
  // Active panel gets z-10 so it's always on top.
  // Non-active panels get pointer-events-none + invisible + z-0 to
  // prevent them from intercepting clicks on the active panel.
  const getTransformClass = useCallback(
    (targetStep: Step): string => {
      const currentIndex = getStepIndex(state.currentStep);
      const targetIndex = getStepIndex(targetStep);

      if (currentIndex === targetIndex) return "translate-x-0 z-10";
      if (currentIndex < targetIndex)
        return "translate-x-full pointer-events-none invisible z-0";
      return "-translate-x-full pointer-events-none invisible z-0";
    },
    [state.currentStep, getStepIndex],
  );

  return {
    state,
    forms,
    actions: {
      // Core actions
      setFlow,
      setStep,
      setPhoneNumber,
      setOtpData,
      setPassword,
      setBlockInfo,
      setResendOtpSuccess,
      setRegisterSuccess,
      setAuthData,
      setExistingOrganizations,
      resetState,
      resetAllForms,
      // Flow navigation
      startLoginFlow,
      startRegisterFlow,
      startCompleteProfileFlow,
      startCompleteOrganizationFlow,
      goToNextStep,
      goToPrevStep,
      goToStep,
      goToOtp,
      goToSetPassword,
      goToSetProfile,
      goToSetOrganization,
      goToSuccess,
      goToBlocked,
      goBack,
    },
    utils: {
      formatPhoneNumber,
      formatCountdownTime,
      calculateBlockTime,
      canGoBack,
      isLoginFlow,
      isRegisterFlow,
      isCompleteProfileFlow,
      getStepIndex,
      getTransformClass,
    },
  };
};
