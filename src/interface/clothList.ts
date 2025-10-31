import { ClothResponse } from "./clothes";

export interface clothListResponse {
    id: string;
    cloth_type: string;
    quantity: number;
    price: number;
    sub_total_cost: number;
    cloth: ClothResponse;
}