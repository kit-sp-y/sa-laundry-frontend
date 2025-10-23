import { api } from "../../../lib/axios";

export async function login(req: Request) {
  const res = await api.post("/users/login", req);
  return res.data;
}