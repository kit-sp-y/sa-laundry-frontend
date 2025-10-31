import { api } from "@/lib/axios";

export interface UpdateCouponData {
	cp_name: string;
	cp_price: number;
}

export async function updateCoupon(id: string, data: UpdateCouponData){
	const response = await api.put(`/coupons/${id}`, data);
	return response.data;
}
