"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import StaffNavbar from "@/components/StaffNavbar";
import { useAuth } from "@/hooks/useAuth";
import { order } from "@/interface/orders";
import { customerResponse } from "@/interface/customers";
import { getCustomerInfo } from "@/api/customers/GET";
import { getOrdersById } from "@/api/orders/GET";

export default function StaffCustomerDetailPage() {
	const router = useRouter();
	const params = useParams();
	const customerId = params.id as string;
	const { isAuthorized } = useAuth(["cashier", "laundryAttendant"]);

	const [customer, setCustomer] = useState<customerResponse | null>(null);
	const [orders, setOrders] = useState<order[]>([]);
	const [loading, setLoading] = useState(true);
	const [isEditing, setIsEditing] = useState(false);
	const [saving, setSaving] = useState(false);

	// Form state for editing
	const [formData, setFormData] = useState({
		name: "",
		nickname: "",
		phone_number: "",
	});

	useEffect(() => {
		if (!isAuthorized) return;

		const fetchCustomerDetail = async () => {
			try {
				setLoading(true);
				const customerInfo = await getCustomerInfo(customerId);
				const userOrders = await getOrdersById(customerId);
				setCustomer(customerInfo);
				setOrders(userOrders);
				setFormData({
					name: customerInfo.name,
					nickname: customerInfo.nickname,
					phone_number: customerInfo.phone_number,
				});
			} catch (error) {
				console.error("Error fetching customer detail:", error);
			} finally {
				setLoading(false);
			}
		};

		fetchCustomerDetail();
	}, [isAuthorized, customerId]);

	const handleEdit = () => {
		setIsEditing(true);
	};

	const handleCancel = () => {
		if (customer) {
			setFormData({
				name: customer.name,
				nickname: customer.nickname,
				phone_number: customer.phone_number,
			});
		}
		setIsEditing(false);
	};

	const handleSave = async () => {
		try {
			setSaving(true);

			// TODO: แทนที่ด้วย API call จริง
			// const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/users/${customerId}`, {
			//   method: "PUT",
			//   headers: {
			//     "Content-Type": "application/json",
			//     Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
			//   },
			//   body: JSON.stringify(formData),
			// });
			// const data = await response.json();

			// Simulate API delay
			await new Promise((resolve) => setTimeout(resolve, 500));

			// Update local state
			if (customer) {
				setCustomer({
					...customer,
					name: formData.name,
					nickname: formData.nickname,
					phone_number: formData.phone_number,
				});
			}

			setIsEditing(false);
			alert("บันทึกข้อมูลสำเร็จ");
		} catch (error) {
			console.error("Error updating customer:", error);
			alert("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
		} finally {
			setSaving(false);
		}
	};

	const handleInputChange = (field: string, value: string) => {
		setFormData((prev) => ({
			...prev,
			[field]: value,
		}));
	};

	const getStatusLabel = (status: string) => {
		switch (status) {
			case "pending":
				return "รอดำเนินการ";
			case "processing":
				return "กำลังดำเนินการ";
			case "completed":
				return "เสร็จสิ้น";
			case "cancelled":
				return "ยกเลิก";
			default:
				return status;
		}
	};

	const getStatusColor = (status: string) => {
		switch (status) {
			case "pending":
				return "bg-yellow-100 text-yellow-700";
			case "processing":
				return "bg-blue-100 text-blue-700";
			case "completed":
				return "bg-green-100 text-green-700";
			case "cancelled":
				return "bg-red-100 text-red-700";
			default:
				return "bg-gray-100 text-gray-700";
		}
	};

	const getPaymentIcon = (method: string) => {
		if (method.toLowerCase() === "coupon") {
			return (
				<svg
					className="h-5 w-5"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth={2}
						d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"
					/>
				</svg>
			);
		}
		return (
			<svg
				className="h-5 w-5"
				fill="none"
				stroke="currentColor"
				viewBox="0 0 24 24"
			>
				<path
					strokeLinecap="round"
					strokeLinejoin="round"
					strokeWidth={2}
					d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
				/>
			</svg>
		);
	};

	const getPaymentLabel = (method: string) => {
		return method.toLowerCase() === "coupon" ? "คูปอง" : "เงินสด";
	};

	const getPaymentColor = (method: string) => {
		return method.toLowerCase() === "coupon"
			? "bg-purple-100 text-purple-700"
			: "bg-emerald-100 text-emerald-700";
	};

	if (!isAuthorized || loading) {
		return (
			<div className="min-h-screen bg-gray-50">
				<StaffNavbar />
				<div className="flex items-center justify-center py-20">
					<div className="text-center">
						<div className="mb-4 inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-[#FF971D] border-r-transparent"></div>
						<p className="text-gray-600">กำลังโหลดข้อมูล...</p>
					</div>
				</div>
			</div>
		);
	}

	if (!customer) {
		return (
			<div className="min-h-screen bg-gray-50">
				<StaffNavbar />
				<div className="mx-auto max-w-6xl px-4 py-8">
					<div className="rounded-lg border-2 border-dashed border-gray-300 bg-white px-6 py-16 text-center">
						<p className="text-lg font-medium text-gray-700">
							ไม่พบข้อมูลลูกค้า
						</p>
						<button
							onClick={() => router.push("/staff/customers")}
							className="mt-4 text-sm text-[#FF971D] hover:underline"
						>
							← กลับไปหน้ารายการลูกค้า
						</button>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gray-50">
			<StaffNavbar />

			<div className="mx-auto max-w-6xl px-4 py-8">
				{/* Header */}
				<div className="mb-8">
					<button
						onClick={() => router.push("/staff/customers")}
						className="mb-4 flex items-center gap-2 text-sm text-gray-600 transition hover:text-[#FF971D]"
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
								d="M15 19l-7-7 7-7"
							/>
						</svg>
						กลับไปหน้ารายการลูกค้า
					</button>
					<h1 className="text-3xl font-bold text-gray-800">รายละเอียดลูกค้า</h1>
					<p className="mt-2 text-gray-600">ข้อมูลลูกค้า ID: {customerId}</p>
				</div>

				{/* Customer Information Card */}
				<div className="rounded-lg bg-white p-8 shadow-sm mb-8">
					<div className="mb-6 flex items-center justify-between border-b border-gray-200 pb-4">
						<h2 className="text-xl font-semibold text-gray-800">
							ข้อมูลส่วนตัว
						</h2>
						<div className="flex items-center gap-3">
							<div className="rounded-full bg-green-100 px-4 py-2 text-sm font-medium text-green-700">
								ลูกค้า
							</div>
							{!isEditing ? (
								<button
									onClick={handleEdit}
									className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-[#FF971D] to-[#FF6B00] px-4 py-2 text-sm font-medium text-white shadow-lg transition hover:shadow-xl"
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
									แก้ไข
								</button>
							) : (
								<div className="flex gap-2">
									<button
										onClick={handleCancel}
										disabled={saving}
										className="rounded-lg border-2 border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
									>
										ยกเลิก
									</button>
									<button
										onClick={handleSave}
										disabled={saving}
										className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-green-500 to-green-600 px-4 py-2 text-sm font-medium text-white shadow-lg transition hover:shadow-xl disabled:opacity-50"
									>
										{saving ? (
											<>
												<div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
												กำลังบันทึก...
											</>
										) : (
											<>
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
														d="M5 13l4 4L19 7"
													/>
												</svg>
												บันทึก
											</>
										)}
									</button>
								</div>
							)}
						</div>
					</div>

					<div className="space-y-6">
						{/* Name */}
						<div>
							<label className="mb-2 block text-sm font-medium text-gray-700">
								ชื่อ-นามสกุล
							</label>
							{isEditing ? (
								<input
									type="text"
									value={formData.name}
									onChange={(e) => handleInputChange("name", e.target.value)}
									className="w-full rounded-lg border-2 border-gray-300 px-4 py-3 text-gray-900 focus:border-[#FF971D] focus:outline-none focus:ring-2 focus:ring-[#FF971D]/20"
									placeholder="กรอกชื่อ-นามสกุล"
								/>
							) : (
								<div className="rounded-lg border-2 border-gray-200 bg-gray-50 px-4 py-3">
									<p className="text-gray-900">{customer.name}</p>
								</div>
							)}
						</div>

						{/* Nickname */}
						<div>
							<label className="mb-2 block text-sm font-medium text-gray-700">
								ชื่อเล่น
							</label>
							{isEditing ? (
								<input
									type="text"
									value={formData.nickname}
									onChange={(e) =>
										handleInputChange("nickname", e.target.value)
									}
									className="w-full rounded-lg border-2 border-gray-300 px-4 py-3 text-gray-900 focus:border-[#FF971D] focus:outline-none focus:ring-2 focus:ring-[#FF971D]/20"
									placeholder="กรอกชื่อเล่น"
								/>
							) : (
								<div className="rounded-lg border-2 border-gray-200 bg-gray-50 px-4 py-3">
									<p className="text-gray-900">{customer.nickname}</p>
								</div>
							)}
						</div>

						{/* Phone Number */}
						<div>
							<label className="mb-2 block text-sm font-medium text-gray-700">
								หมายเลขโทรศัพท์
							</label>
							{isEditing ? (
								<input
									type="tel"
									value={formData.phone_number}
									onChange={(e) =>
										handleInputChange("phone_number", e.target.value)
									}
									className="w-full rounded-lg border-2 border-gray-300 px-4 py-3 text-gray-900 focus:border-[#FF971D] focus:outline-none focus:ring-2 focus:ring-[#FF971D]/20"
									placeholder="กรอกหมายเลขโทรศัพท์"
								/>
							) : (
								<div className="rounded-lg border-2 border-gray-200 bg-gray-50 px-4 py-3">
									<p className="text-gray-900">{customer.phone_number}</p>
								</div>
							)}
						</div>
					</div>

					{/* Info Note */}
					{isEditing && (
						<div className="mt-8 rounded-lg bg-amber-50 border-2 border-amber-200 p-4">
							<div className="flex gap-3">
								<svg
									className="h-6 w-6 flex-shrink-0 text-amber-600"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
									/>
								</svg>
								<div>
									<p className="text-sm font-medium text-amber-800">คำเตือน</p>
									<p className="mt-1 text-sm text-amber-700">
										กรุณาตรวจสอบข้อมูลให้ถูกต้องก่อนบันทึก
									</p>
								</div>
							</div>
						</div>
					)}
				</div>

				{/* Order History Section */}
				<div className="rounded-lg bg-white p-8 shadow-sm">
					<div className="mb-6 flex items-center justify-between border-b border-gray-200 pb-4">
						<div>
							<h2 className="text-xl font-semibold text-gray-800">
								ประวัติการใช้บริการ
							</h2>
							<p className="mt-1 text-sm text-gray-600">
								รายการคำสั่งซื้อทั้งหมด{" "}
								<span className="font-semibold text-[#FF971D]">
									{orders.length}
								</span>{" "}
								รายการ
							</p>
						</div>
					</div>

					{orders.length > 0 ? (
						<div className="space-y-4">
							{orders.map((order) => (
								<div
									key={order.id}
									className="group relative overflow-hidden rounded-xl border-2 border-gray-200 bg-white transition-all duration-300 hover:border-[#FF971D] hover:shadow-lg"
								>
									<div className="p-6">
										<div className="mb-4 flex items-start justify-between">
											<div className="flex-1">
												<div className="mb-2 flex items-center gap-3">
													<div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#FF971D] to-[#FF6B00] text-white shadow-md">
														<svg
															className="h-5 w-5"
															fill="none"
															stroke="currentColor"
															viewBox="0 0 24 24"
														>
															<path
																strokeLinecap="round"
																strokeLinejoin="round"
																strokeWidth={2}
																d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
															/>
														</svg>
													</div>
													<div>
														<h3 className="text-lg font-bold text-gray-900">
															{order.service_type}
														</h3>
														<p className="flex items-center gap-2 text-sm text-gray-500">
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
																	d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
																/>
															</svg>
															{new Date(order.order_date).toLocaleDateString(
																"th-TH",
																{
																	year: "numeric",
																	month: "long",
																	day: "numeric",
																}
															)}
														</p>
													</div>
												</div>
											</div>
											<div
												className={`rounded-full px-4 py-2 text-sm font-semibold ${getStatusColor(
													order.order_status
												)}`}
											>
												<div className="flex items-center gap-2">
													{order.order_status === "completed" ? (
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
																d="M5 13l4 4L19 7"
															/>
														</svg>
													) : order.order_status === "processing" ? (
														<svg
															className="h-4 w-4 animate-spin"
															fill="none"
															stroke="currentColor"
															viewBox="0 0 24 24"
														>
															<path
																strokeLinecap="round"
																strokeLinejoin="round"
																strokeWidth={2}
																d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
															/>
														</svg>
													) : order.order_status === "pending" ? (
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
																d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
															/>
														</svg>
													) : order.order_status === "cancelled" ? (
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
																d="M6 18L18 6M6 6l12 12"
															/>
														</svg>
													) : null}
													{getStatusLabel(order.order_status)}
												</div>
											</div>
										</div>

										{/* Order Details Grid */}
										<div className="grid grid-cols-2 gap-4 rounded-lg bg-gray-50 p-4 mb-4">
											<div className="text-center">
												<div className="flex items-center justify-center gap-2 text-sm text-gray-600 mb-1">
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
															d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
														/>
													</svg>
													จำนวนชิ้น
												</div>
												<p className="text-2xl font-bold text-[#FF971D]">
													{order.total_cloth}
												</p>
												<p className="text-xs text-gray-500">ชิ้น</p>
											</div>

											<div className="text-center border-l border-gray-300">
												<div className="flex items-center justify-center gap-2 text-sm text-gray-600 mb-1">
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
															d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
														/>
													</svg>
													ราคารวม
												</div>
												<p className="text-2xl font-bold text-gray-900">
													{order.total_cost.toLocaleString()}
												</p>
												{order.payment_method === "Cash" ? (
													<p className="text-xs text-gray-500">บาท</p>
												) : (
													<p className="text-xs text-gray-500">คูปอง</p>
												)}
											</div>
										</div>

										{/* Payment Method & Action */}
										<div className="flex items-center justify-between gap-4">
											<div
												className={`flex items-center gap-2 rounded-lg px-4 py-2.5 ${getPaymentColor(
													order.payment_method
												)}`}
											>
												{getPaymentIcon(order.payment_method)}
												<span className="font-semibold">
													{getPaymentLabel(order.payment_method)}
												</span>
											</div>

											<button
												onClick={() => router.push(`/staff/orders/${order.id}`)}
												className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-[#FF971D] to-[#FF6B00] px-5 py-2.5 text-sm font-semibold text-white shadow-md transition hover:shadow-lg"
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
														d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
													/>
													<path
														strokeLinecap="round"
														strokeLinejoin="round"
														strokeWidth={2}
														d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
													/>
												</svg>
												ดูรายละเอียด
											</button>
										</div>

										{/* Hover Effect Indicator */}
										<div className="absolute bottom-0 left-0 h-1 w-0 bg-gradient-to-r from-[#FF971D] to-[#FF6B00] transition-all duration-300 group-hover:w-full"></div>
									</div>
								</div>
							))}
						</div>
					) : (
						<div className="rounded-xl border-2 border-dashed border-gray-300 bg-gradient-to-br from-gray-50 to-gray-100 px-6 py-20 text-center">
							<div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-md">
								<svg
									className="h-12 w-12 text-gray-400"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
									/>
								</svg>
							</div>
							<p className="text-xl font-semibold text-gray-700 mb-2">
								ยังไม่มีประวัติการใช้บริการ
							</p>
							<p className="text-sm text-gray-500">
								เมื่อลูกค้าใช้บริการ ประวัติจะแสดงที่นี่
							</p>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
