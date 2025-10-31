import { api } from "@/lib/axios";

export interface UpdateClothData {
	cloth_name: string;
	cloth_price: number;
	category: string;
}

export async function updateCloth(id: string, data: UpdateClothData) {
	const response = await api.put(`/cloths/${id}`, data);
	return response.data;
}
