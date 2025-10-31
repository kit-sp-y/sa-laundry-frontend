import { staffsResponse } from "@/interface/staffs";
import { api } from "@/lib/axios";

export const getStaffs = async () => {
  const response = await api.get("/users/role/staff", {
    withCredentials: true,
  });
  return response.data;
};

export const getCashiers = async () => {
  const response = await api.get("/users/role/cashier", { withCredentials: true });
  return response.data as staffsResponse[];
};

export const getLaundryAttendants = async () => {
  const response = await api.get("/users/role/laundryAttendant", { withCredentials: true });
  return response.data as staffsResponse[];
};

export const getAllStaffs = async () => {
  const [cashiers, laundryAttendants] = await Promise.all([
    getCashiers(),
    getLaundryAttendants()
  ]);
  const data: staffsResponse []= [...cashiers, ...laundryAttendants];

  return data;
};

export const getStaffById = async (id: string) => {
  const response = await api.get(`/users/id/${id}`, { withCredentials: true });
  return response.data as staffsResponse;
}
