import { CouponResponse } from "./coupons";
import { customerResponse } from "./customers";

export interface UserCoupon {
    id: string;
    point_left: number;
    start_date: string;
    expire_date: string;
    coupons: CouponResponse;
    users: customerResponse;
}