import { UserCoupon } from "@/interface/userCoupon";
import { api } from "@/lib/axios";

export async function createUserCoupon(data: UserCoupon) {
    const res = await api.post(`/user_coupons/`, data);
    return res.data as UserCoupon;
}