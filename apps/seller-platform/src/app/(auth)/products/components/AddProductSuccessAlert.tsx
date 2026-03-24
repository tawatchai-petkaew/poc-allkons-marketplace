"use client";

import { useEffect, useState } from "react";
import { Alert } from "antd";
import { STORAGE_KEYS, ADD_PRODUCT_SUCCESS_MESSAGES } from "../constants/products.constants";

interface AddProductSuccessData {
  products: number;
  merchants: number;
}

export const AddProductSuccessAlert = () => {
  const [successData, setSuccessData] = useState<AddProductSuccessData | null>(
    null
  );

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.ADD_PRODUCT_SUCCESS);
      if (stored) {
        const data = JSON.parse(stored) as AddProductSuccessData;
        setSuccessData(data);
        localStorage.removeItem(STORAGE_KEYS.ADD_PRODUCT_SUCCESS);
      }
    } catch (error) {
      console.error("Failed to read add product success data:", error);
    }
  }, []);

  if (!successData) {
    return null;
  }

  return (
    <div className="mb-6">
      <Alert
        message={ADD_PRODUCT_SUCCESS_MESSAGES.TITLE}
        description={ADD_PRODUCT_SUCCESS_MESSAGES.DESCRIPTION(successData.products, successData.merchants)}
        type="success"
        showIcon
        closable
        onClose={() => setSuccessData(null)}
      />
    </div>
  );
};
