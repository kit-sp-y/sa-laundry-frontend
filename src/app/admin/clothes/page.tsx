"use client";

import { useState, useEffect } from "react";
import AdminNavbar from "@/components/AdminNavbar";
import { useAuth } from "@/hooks/useAuth";
import { ClothResponse } from "@/interface/clothes";
import { getClothes } from "@/api/clothes/GET";
import { updateCloth, UpdateClothData } from "@/api/clothes/PUT";

export default function ClothesPage() {
	const { isAuthorized } = useAuth("admin");
	const [clothes, setClothes] = useState<ClothResponse[]>([]);
	const [loading, setLoading] = useState(true);
	const [filter, setFilter] = useState<"all" | "Wash Dry" | "Dry Clean">("all");
	const [editingCloth, setEditingCloth] = useState<ClothResponse | null>(null);
	const [formData, setFormData] = useState<UpdateClothData>({
		cloth_name: "",
		cloth_price: 0,
		category: "Wash Dry",
	});
	const [saving, setSaving] = useState(false);

	useEffect(() => {
		if (!isAuthorized) return;
		fetchClothes();
	}, [isAuthorized]);

	const fetchClothes = async () => {
		try {
			setLoading(true);
			const data = await getClothes();
			setClothes(data);
		} catch (error) {
			console.error("Error fetching clothes:", error);
		} finally {
			setLoading(false);
		}
	};

	const handleEdit = (cloth: ClothResponse, e: React.MouseEvent) => {
		e.stopPropagation();
		setEditingCloth(cloth);
		setFormData({
			cloth_name: cloth.cloth_name,
			cloth_price: cloth.cloth_price,
			category: cloth.category,
		});
	};

	const handleCloseModal = () => {
		setEditingCloth(null);
		setFormData({
			cloth_name: "",
			cloth_price: 0,
			category: "Wash Dry",
		});
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!editingCloth) return;

		try {
			setSaving(true);
			await updateCloth(editingCloth.id, formData);
			await fetchClothes();
			handleCloseModal();
		} catch (error) {
			console.error("Error updating cloth:", error);
			alert("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
		} finally {
			setSaving(false);
		}
	};

	const filteredClothes = clothes.filter((cloth) =>
		filter === "all" ? true : cloth.category === filter
	);

	if (!isAuthorized || loading) {
		return (
			<div className="min-h-screen bg-gray-50">
				<AdminNavbar />
				<div className="flex items-center justify-center py-20">
					<div className="text-center">
						<div className="mb-4 inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-[#FF971D] border-r-transparent"></div>
						<p className="text-gray-600">กำลังโหลด...</p>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gray-50">
			<AdminNavbar />

			<div className="mx-auto max-w-7xl px-4 py-8">
				{/* Header */}
				<div className="mb-8 flex items-center justify-between">
					<div>
						<h1 className="text-3xl font-bold text-gray-800">ประเภทผ้า</h1>
						<p className="mt-2 text-gray-600">
							รายการประเภทผ้าทั้งหมด {clothes.length} รายการ
						</p>
					</div>
				</div>

				{/* Filters */}
				<div className="mb-6 flex gap-3">
					<button
						onClick={() => setFilter("all")}
						className={`rounded-lg px-6 py-2.5 font-medium transition ${
							filter === "all"
								? "bg-[#FF971D] text-white"
								: "bg-white text-gray-600 hover:bg-gray-100"
						}`}
					>
						ทั้งหมด ({clothes.length})
					</button>
					<button
						onClick={() => setFilter("Wash Dry")}
						className={`rounded-lg px-6 py-2.5 font-medium transition ${
							filter === "Wash Dry"
								? "bg-blue-600 text-white"
								: "bg-white text-gray-600 hover:bg-gray-100"
						}`}
					>
						ซักแห้ง (
						{clothes.filter((c) => c.category === "Wash Dry").length})
					</button>
					<button
						onClick={() => setFilter("Dry Clean")}
						className={`rounded-lg px-6 py-2.5 font-medium transition ${
							filter === "Dry Clean"
								? "bg-purple-600 text-white"
								: "bg-white text-gray-600 hover:bg-gray-100"
						}`}
					>
						ซักแห้ง พิเศษ (
						{clothes.filter((c) => c.category === "Dry Clean").length})
					</button>
				</div>

				{/* Clothes Grid */}
				<div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
					{filteredClothes.map((cloth) => (
						<div
							key={cloth.id}
							className="group relative overflow-hidden rounded-xl bg-white shadow-md transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
						>
							{/* Category Badge */}
							<div
								className={`absolute right-3 top-3 rounded-full px-3 py-1 text-xs font-semibold shadow-md ${
									cloth.category === "Wash Dry"
										? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white"
										: "bg-gradient-to-r from-purple-500 to-pink-500 text-white"
								}`}
							>
								{cloth.category}
							</div>

							{/* Card Content */}
							<div className="p-6">
								{/* Icon and Name */}
								<div className="mb-4 flex items-start gap-3">
									<div
										className={`rounded-lg p-3 ${
											cloth.category === "Wash Dry"
												? "bg-blue-100"
												: "bg-purple-100"
										}`}
									>
										<svg
											className={`h-6 w-6 ${
												cloth.category === "Wash Dry"
													? "text-blue-600"
													: "text-purple-600"
											}`}
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
												d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
											/>
										</svg>
									</div>
									<div className="flex-1 min-w-0">
										<h3 className="text-lg font-bold text-gray-800 truncate mb-1">
											{cloth.cloth_name}
										</h3>
										<p className="text-sm text-gray-500">รหัส: {cloth.id.slice(0, 8)}</p>
									</div>
								</div>

								{/* Price Section */}
								<div
									className={`mb-4 rounded-lg p-4 ${
										cloth.category === "Wash Dry"
											? "bg-gradient-to-br from-blue-50 to-cyan-50"
											: "bg-gradient-to-br from-purple-50 to-pink-50"
									}`}
								>
									<p className="mb-1 text-xs font-medium text-gray-600 uppercase tracking-wide">
										ราคาต่อชิ้น
									</p>
									<div className="flex items-baseline gap-1">
										<span
											className={`text-3xl font-bold ${
												cloth.category === "Wash Dry"
													? "text-blue-600"
													: "text-purple-600"
											}`}
										>
											{cloth.cloth_price}
										</span>
										<span
											className={`text-xl font-semibold ${
												cloth.category === "Wash Dry"
													? "text-blue-600"
													: "text-purple-600"
											}`}
										>
											฿
										</span>
									</div>
								</div>

								{/* Edit Button */}
								<button
									onClick={(e) => handleEdit(cloth, e)}
									className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-blue-500 py-3 text-sm font-semibold text-white shadow-md transition-all duration-300 hover:from-blue-700 hover:to-blue-600 hover:shadow-lg active:scale-95"
								>
									<svg
										className="h-4 w-4"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
										/>
									</svg>
									<span>แก้ไขข้อมูล</span>
								</button>
							</div>
						</div>
					))}
				</div>

				{filteredClothes.length === 0 && (
					<div className="rounded-lg bg-white p-12 text-center">
						<svg
							className="mx-auto mb-4 h-16 w-16 text-gray-400"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
							/>
						</svg>
						<p className="text-lg font-medium text-gray-600">
							ไม่พบประเภทผ้า
						</p>
					</div>
				)}
			</div>

			{/* Edit Modal */}
			{editingCloth && (
				<div
					className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
					onClick={handleCloseModal}
				>
					<div
						className="w-full max-w-md rounded-2xl bg-white shadow-2xl"
						onClick={(e) => e.stopPropagation()}
					>
						{/* Modal Header */}
						<div className="bg-gradient-to-r from-blue-600 to-blue-400 p-6 rounded-t-2xl">
							<h2 className="text-2xl font-bold text-white">
								แก้ไขข้อมูลประเภทผ้า
							</h2>
							<p className="text-blue-100 text-sm mt-1">
								{editingCloth.cloth_name}
							</p>
						</div>

						{/* Modal Body */}
						<form onSubmit={handleSubmit} className="p-6">
							<div className="space-y-4">
								{/* Cloth Name */}
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-2">
										ชื่อประเภทผ้า
									</label>
									<input
										type="text"
										value={formData.cloth_name}
										onChange={(e) =>
											setFormData({ ...formData, cloth_name: e.target.value })
										}
										className="w-full rounded-lg border border-gray-300 text-gray-700 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
										required
									/>
								</div>

								{/* Cloth Price */}
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-2">
										ราคา (บาท)
									</label>
									<input
										type="number"
										step="1"
										value={formData.cloth_price}
										onChange={(e) =>
											setFormData({
												...formData,
												cloth_price: parseFloat(e.target.value),
											})
										}
										className="w-full rounded-lg border border-gray-300 text-gray-700 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
										required
									/>
								</div>

								{/* Category */}
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-2">
										หมวดหมู่
									</label>
									<select
										value={formData.category}
										onChange={(e) =>
											setFormData({ ...formData, category: e.target.value })
										}
										className="w-full rounded-lg border border-gray-300 text-gray-700 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
										required
									>
										<option value="Wash Dry">Wash Dry</option>
										<option value="Dry Clean">Dry Clean</option>
									</select>
								</div>
							</div>

							{/* Modal Footer */}
							<div className="mt-6 flex gap-3">
								<button
									type="button"
									onClick={handleCloseModal}
									disabled={saving}
									className="flex-1 rounded-lg border border-gray-300 px-4 py-2 font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
								>
									ยกเลิก
								</button>
								<button
									type="submit"
									disabled={saving}
									className="flex-1 rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition hover:bg-blue-700 disabled:opacity-50"
								>
									{saving ? "กำลังบันทึก..." : "บันทึก"}
								</button>
							</div>
						</form>
					</div>
				</div>
			)}
		</div>
	);
}
