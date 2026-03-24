import { ILocationResponse } from "@/interfaces/location/location.response.interface";
import { customerAPI } from "@/libs/axios";

export const getLocations = async (text: string) => {
  const { data } = await customerAPI.get<ILocationResponse[]>(
    `/locations/search?keyword=${text}`,
  );
  return data;
};
