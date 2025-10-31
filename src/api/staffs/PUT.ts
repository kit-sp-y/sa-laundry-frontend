import { api } from "@/lib/axios";

export interface UpdateStaffData {
  name: string;
  nickname: string;
  phone_number: string;
  role: string;
}

export async function updateStaff(id: string, data: UpdateStaffData) {
  try {
    const response = await api.put(`/users/${id}`, data);
    console.log("Update staff response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error in updateStaff API:", error);
    throw error;
  }
}