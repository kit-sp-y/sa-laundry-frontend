export interface LoginResponse {
  token: string;
  role: string;
  user?: {
    id: number;
    name: string;
    phone_number: string;
    role: string;
  };
}