import { LoginResponse } from "@/interface/auth";
import { api } from "@/lib/axios";

export async function login(
  phone_number: string,
  password: string
): Promise<LoginResponse> {
  const res = await api.post<LoginResponse>(
    "/users/login",
    { phone_number, password },
    {
      withCredentials: true,
    }
  );
  return res.data;
}