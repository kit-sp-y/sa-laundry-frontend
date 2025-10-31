import { UserCoupon } from "@/interface/userCoupon";
import { api } from "@/lib/axios";

export async function updateUserCoupon(id: string, data: UserCoupon) {
    const res = await api.put(`/user_coupons/${id}`, data);
    return res.data as UserCoupon;
}