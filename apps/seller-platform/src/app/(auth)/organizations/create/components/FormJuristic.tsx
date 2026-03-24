"use client";

import React, { useState } from "react";
import { FormInstance } from "antd";
import {
  JuristicForm,
  JuristicFormFields,
} from "@/components/Form/Organization/JuristicForm";

// ===========================================
// Types
// ===========================================

interface FormJuristicProps {
  form: FormInstance<JuristicFormFields>;
  onVerificationChange?: (isVerified: boolean) => void;
}

// ===========================================
// Component
// ===========================================

const FormJuristic: React.FC<FormJuristicProps> = ({
  form,
  onVerificationChange,
}) => {
  const [isSuccessCheckTaxId, setIsSuccessCheckTaxId] = useState(false);

  const handleVerificationChange = (isVerified: boolean) => {
    setIsSuccessCheckTaxId(isVerified);
    onVerificationChange?.(isVerified);
  };

  return (
    <JuristicForm
      form={form}
      isSuccessCheckTaxId={isSuccessCheckTaxId}
      setIsSuccessCheckTaxId={handleVerificationChange}
      withFormWrapper={true}
    />
  );
};

export default FormJuristic;
