export interface IExitRequest {
  id: number;
  leaveStatus: string;
  createdAt: string;
  updatedAt: string;
  user: {
    id: number;
    email: string;
    firstNameTh: string;
    lastNameTh: string;
  };
  role: {
    id: number;
    name: string;
    displayName: string;
  };
}

export interface IExitRequestsResponse {
  meta: {
    page: number;
    pageLimit: number;
    totalItems: number;
    totalPages: number;
  };
  items: IExitRequest[];
}