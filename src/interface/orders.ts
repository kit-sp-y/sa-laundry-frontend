import { customerResponse } from "./customers";
import { clothListResponse } from "./clothList";

export interface order {
    id: string;
    service_type: string;
    order_status: string;
    total_cloth: number;
    total_cost: number;
    order_date: string;
    pickup_date: string;
    payment_method: string;
    user: customerResponse;
    cloth_lists: clothListResponse[];
}