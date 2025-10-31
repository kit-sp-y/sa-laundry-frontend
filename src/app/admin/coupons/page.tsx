"use client";

import { useState, useEffect } from "react";
import AdminNavbar from "@/components/AdminNavbar";
import { useAuth } from "@/hooks/useAuth";
import { CouponResponse } from "@/interface/coupons";
import { getCoupons } from "@/api/coupons/GET";
import { updateCoupon, UpdateCouponData } from "@/api/coupons/PUT";

export default function CouponsPage() {
	const { isAuthorized } = useAuth("admin");
	const [coupons, setCoupons] = useState<CouponResponse[]>([]);
	const [loading, setLoading] = useState(true);
	const [editingCoupon, setEditingCoupon] = useState<CouponResponse | null>(
		null
	);
	const [formData, setFormData] = useState<UpdateCouponData>({
		cp_name: "",
		cp_price: 0,
	});
	const [saving, setSaving] = useState(false);

	useEffect(() => {
		if (!isAuthorized) return;
		fetchCoupons();
	}, [isAuthorized]);

	const fetchCoupons = async () => {
		try {
			setLoading(true);
			const data = await getCoupons();
			setCoupons(data);
		} catch (error) {
			console.error("Error fetching coupons:", error);
		} finally {
			setLoading(false);
		}
	};

	const handleEdit = (coupon: CouponResponse, e: React.MouseEvent) => {
		e.stopPropagation();
		setEditingCoupon(coupon);
		setFormData({
			cp_name: coupon.cp_name,
			cp_price: coupon.cp_price,
		});
	};

	const handleCloseModal = () => {
		setEditingCoupon(null);
		setFormData({ cp_name: "", cp_price: 0 });
		setSaving(false);
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!editingCoupon) return;

		try {
			setSaving(true);
			// ส่งเฉพาะราคา ไม่ส่งชื่อคูปอง
			await updateCoupon(editingCoupon.id, {
				cp_name: editingCoupon.cp_name, // ใช้ชื่อเดิม
				cp_price: formData.cp_price
			});
			await fetchCoupons();
			handleCloseModal();
		} catch (error) {
			console.error("Error updating coupon:", error);
			alert("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
		} finally {
			setSaving(false);
		}
	};

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
						<h1 className="text-3xl font-bold text-gray-800">คูปอง</h1>
						<p className="mt-2 text-gray-600">
							รายการคูปองทั้งหมด {coupons.length} รายการ
						</p>
					</div>
				</div>

				{/* Coupons Grid */}
				<div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
					{coupons.map((coupon) => (
						<div
							key={coupon.id}
							className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-purple-500 via-pink-500 to-rose-500 p-[2px] shadow-lg transition-all duration-300 hover:shadow-2xl hover:-translate-y-1"
						>
							<div className="h-full rounded-xl bg-white p-6">
								{/* Icon Header */}
								<div className="mb-4 flex items-start gap-3">
									<div className="rounded-xl bg-gradient-to-br from-purple-100 to-pink-100 p-3">
										<svg
											className="h-7 w-7 text-purple-600"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
												d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"
											/>
										</svg>
									</div>
									<div className="flex-1 min-w-0">
										<h3 className="text-lg font-bold text-gray-800 mb-1 truncate">
											{coupon.cp_name}
										</h3>
										<span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-purple-100 to-pink-100 px-2.5 py-1 text-xs font-semibold text-purple-700">
											<svg
												className="h-3 w-3"
												fill="currentColor"
												viewBox="0 0 20 20"
											>
												<path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
											</svg>
											คูปองพิเศษ
										</span>
										<p className="text-xs text-gray-500 mt-1">รหัส: {coupon.id.slice(0, 8)}</p>
									</div>
								</div>

								{/* Price Card */}
								<div className="mb-4 rounded-xl bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 p-4 shadow-inner">
									<div className="flex items-center justify-between mb-2">
										<p className="text-xs font-bold text-gray-600 uppercase tracking-wider">
											มูลค่าคูปอง
										</p>
										<div className="rounded-full bg-gradient-to-r from-purple-500 to-pink-500 px-2 py-0.5">
											<span className="text-xs font-bold text-white">HOT</span>
										</div>
									</div>
									<div className="flex items-baseline gap-1.5">
										<span className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
											{coupon.cp_price}
										</span>
										<span className="text-xl font-bold text-purple-600">฿</span>
									</div>
									<p className="mt-1 text-xs text-gray-600">
										ส่วนลดสำหรับบริการซักรีด
									</p>
								</div>

								{/* Edit Button */}
								<button
									onClick={(e) => handleEdit(coupon, e)}
									className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 py-3 text-sm font-semibold text-white shadow-md transition-all duration-300 hover:from-purple-700 hover:via-pink-700 hover:to-rose-700 hover:shadow-lg active:scale-95"
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
									<span>แก้ไขคูปอง</span>
								</button>
							</div>
						</div>
					))}
				</div>

				{coupons.length === 0 && (
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
								d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"
							/>
						</svg>
						<p className="text-lg font-medium text-gray-600">ไม่พบคูปอง</p>
					</div>
				)}
			</div>

			{/* Edit Modal */}
			{editingCoupon && (
				<div
					className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
					onClick={handleCloseModal}
				>
					<div
						className="w-full max-w-md rounded-2xl bg-white shadow-2xl"
						onClick={(e) => e.stopPropagation()}
					>
						{/* Modal Header */}
						<div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6 rounded-t-2xl">
							<h2 className="text-2xl font-bold text-white">
								แก้ไขข้อมูลคูปอง
							</h2>
							<p className="text-purple-100 text-sm mt-1">
								{editingCoupon.cp_name}
							</p>
						</div>

						{/* Modal Body */}
						<form onSubmit={handleSubmit} className="p-6">
							<div className="space-y-4">
								{/* Coupon Name - Read Only */}
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-2">
										ชื่อคูปอง
									</label>
									<div className="w-full rounded-lg border border-gray-200 bg-gray-50 text-gray-600 px-4 py-2">
										{editingCoupon.cp_name}
									</div>
									<p className="text-xs text-gray-500 mt-1">
										* ชื่อคูปองไม่สามารถแก้ไขได้
									</p>
								</div>

								{/* Coupon Price */}
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-2">
										มูลค่า (บาท)
									</label>
									<input
										type="number"
										step="1"
										value={formData.cp_price}
										onChange={(e) =>
											setFormData({
												...formData,
												cp_price: parseFloat(e.target.value),
											})
										}
										className="w-full rounded-lg border border-gray-300 text-gray-700 px-4 py-2 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
										required
									/>
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
									className="flex-1 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-2 font-medium text-white transition hover:from-purple-700 hover:to-pink-700 disabled:opacity-50"
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
