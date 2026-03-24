import { customerAPI } from '@/utils/axios';

const prefix = '/file-upload';

export const uploadFile = async (body: FormData) => {
  const { data } = await customerAPI.post(`${prefix}/upload`, body, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return data;
};
