import Cookies from 'js-cookie';
import { customerAPI } from '../../../utils/axios';

const prefix = '/v2/buyer-project';

export interface CreateProjectRequest {
  name: string;
  userId: number;
  organizeId: number;
}

export interface ProjectResponse {
  id: number;
  name: string;
}

const auth = Cookies.get('auth');
const authData = auth ? JSON.parse(auth) : null;

export const getMyProjects = async ({
  name,
}: {
  name: string;
}): Promise<ProjectResponse[]> => {
  const { data } = await customerAPI.get(`${prefix}`, {
    params: { name },
    headers: {
      Authorization: `Bearer ${authData?.accessToken}`,
    },
  });
  return data;
};

export const createProject = async (data: CreateProjectRequest) => {
  const auth = Cookies.get('auth');
  const authData = auth ? JSON.parse(auth) : null;
  const { data: responseData } = await customerAPI.post(`${prefix}`, data, {
    headers: {
      Authorization: `Bearer ${authData?.accessToken}`,
    },
  });
  return responseData;
};

export const deleteProject = async (projectId: number) => {
  const auth = Cookies.get('auth');
  const authData = auth ? JSON.parse(auth) : null;
  const { data: responseData } = await customerAPI.delete(
    `${prefix}/${projectId}`,
    {
      headers: {
        Authorization: `Bearer ${authData?.accessToken}`,
      },
    }
  );
  return responseData;
};
