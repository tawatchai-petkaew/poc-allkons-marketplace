import { customerAPI } from "@/libs/axios";
import { ApiResponse } from "@/types/common.type";

export interface IUploadFileResponse {
  url: string;
  key: string;
  fileName: string;
  id: number;
  name: string;
}

export const uploadFile = async (formData: FormData) => {
  const { data: responseData } = await customerAPI.post<
    ApiResponse<IUploadFileResponse[]>
  >("/draft/upload-document-cis", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return responseData;
};

export const uploadPublicFile = async (formData: FormData) => {
  const { data: responseData } = await customerAPI.post<IUploadFileResponse>(
    "/file-upload/upload",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );
  return responseData;
};
