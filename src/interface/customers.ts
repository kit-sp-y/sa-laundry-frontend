import { order } from "./orders";
import { UserCoupon } from "./userCoupon";

export interface customerResponse {
    id: number;
    name: string;
    nickname: string;
    phone_number: string;

    order : order[];
    userCoupon : UserCoupon[];
}