import { api } from "@/lib/axios";
import { CouponResponse } from "@/interface/coupons";

export async function getCoupons(): Promise<CouponResponse[]> {
	const response = await api.get("/coupons");
	return response.data as CouponResponse[];
}

export async function getCouponById(id: string): Promise<CouponResponse> {
	const response = await api.get(`/coupons/${id}`);
	return response.data as CouponResponse;
}
