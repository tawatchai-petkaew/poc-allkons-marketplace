"use client";

import React, { useState } from "react";
import { FormInstance } from "antd";
import {
  RegisteredIndividualForm,
  RegisteredIndividualFormFields,
} from "@/components/Form/Organization/RegisteredIndividualForm";

// ===========================================
// Types
// ===========================================

interface FormRegisteredIndividualProps {
  form: FormInstance<RegisteredIndividualFormFields>;
  onVerificationChange?: (isVerified: boolean) => void;
}

// ===========================================
// Component
// ===========================================

const FormRegisteredIndividual: React.FC<FormRegisteredIndividualProps> = ({
  form,
  onVerificationChange,
}) => {
  const [
    isSuccessCheckRegistrationNumber,
    setIsSuccessCheckRegistrationNumber,
  ] = useState(false);

  const handleVerificationChange = (isVerified: boolean) => {
    setIsSuccessCheckRegistrationNumber(isVerified);
    onVerificationChange?.(isVerified);
  };

  return (
    <RegisteredIndividualForm
      form={form}
      isSuccessCheckRegistrationNumber={isSuccessCheckRegistrationNumber}
      setIsSuccessCheckRegistrationNumber={handleVerificationChange}
      withFormWrapper={true}
    />
  );
};

export default FormRegisteredIndividual;
