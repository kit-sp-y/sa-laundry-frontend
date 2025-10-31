import { UserCoupon } from "@/interface/userCoupon";
import { api } from "@/lib/axios";

export async function getUserCoupons(id: string) {
    const res = await api.get(`/user_coupons/user/${id}`);
    return res.data as UserCoupon[];
}