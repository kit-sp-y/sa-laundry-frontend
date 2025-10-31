"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import AdminNavbar from "@/components/AdminNavbar";
import { getOrderInfo } from "@/api/orders/GET";
import { order } from "@/interface/orders";
import { getClothListByOrderId } from "@/api/cloth_lists/GET";
import { clothListResponse } from "@/interface/clothList";

export default function OrderDetailPage() {
	const params = useParams();
	const paramId = params.id as string;
	const router = useRouter();
	const [order, setOrder] = useState<order | null>(null);
	const [clothList, setClothList] = useState<clothListResponse[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchOrder = async () => {
			try {
				setLoading(true);
				const data = await getOrderInfo(paramId);
				const clothListData = await getClothListByOrderId(paramId);
				setOrder(data);
				setClothList(clothListData);
			} catch (error) {
				console.error("Error fetching order:", error);
			} finally {
				setLoading(false);
			}
		};

		fetchOrder();
	}, [paramId]);

	const getStatusColor = (status: string) => {
		switch (status) {
			case "pending":
			case "รอดำเนินการ":
				return "bg-yellow-100 text-yellow-700";
			case "processing":
			case "กำลังซัก/อบ":
			case "กำลังรีด":
				return "bg-blue-100 text-blue-700";
			case "completed":
			case "เสร็จสิ้น":
				return "bg-green-100 text-green-700";
			case "cancelled":
				return "bg-red-100 text-red-700";
			default:
				return "bg-gray-100 text-gray-700";
		}
	};

	const getStatusIcon = (status: string) => {
		if (!status) return null;

		if (status === "completed" || status === "เสร็จสิ้น") {
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
						d="M5 13l4 4L19 7"
					/>
				</svg>
			);
		} else if (status === "processing" || status.includes("กำลัง")) {
			return (
				<svg
					className="h-5 w-5 animate-spin"
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
			);
		} else if (status === "pending" || status === "รอดำเนินการ") {
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
						d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
					/>
				</svg>
			);
		} else if (status === "cancelled") {
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
						d="M6 18L18 6M6 6l12 12"
					/>
				</svg>
			);
		}
		return null;
	};

	if (loading) {
		return (
			<div className="min-h-screen bg-gray-50">
				<AdminNavbar />
				<div className="flex items-center justify-center py-20">
					<div className="text-center">
						<div className="mb-4 inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-[#FF971D] border-r-transparent"></div>
						<p className="text-gray-600">กำลังโหลดข้อมูล...</p>
					</div>
				</div>
			</div>
		);
	}

	if (!order) {
		return (
			<div className="min-h-screen bg-gray-50">
				<AdminNavbar />
				<div className="mx-auto max-w-6xl px-4 py-8">
					<div className="rounded-lg border-2 border-dashed border-gray-300 bg-white px-6 py-16 text-center">
						<p className="text-lg font-medium text-gray-700">
							ไม่พบข้อมูลคำสั่งซื้อ
						</p>
						<button
							onClick={() => router.push("/admin/orders")}
							className="mt-4 text-sm text-[#FF971D] hover:underline"
						>
							← กลับไปหน้ารายการคำสั่งซื้อ
						</button>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gray-50">
			<AdminNavbar />

			<div className="mx-auto max-w-6xl px-4 py-8">
				{/* Header */}
				<div className="mb-8">
					<button
						onClick={() => router.push("/admin/orders")}
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
						กลับไปหน้ารายการคำสั่งซื้อ
					</button>
					<h1 className="text-3xl font-bold text-gray-800">
						รายละเอียดคำสั่งซื้อ
					</h1>
					<p className="mt-2 text-gray-600">
						หมายเลขคำสั่งซื้อ: {order?.id || "N/A"}
					</p>
				</div>

				{/* Order Status Card */}
				<div className="mb-8 overflow-hidden rounded-xl bg-gradient-to-br from-[#FF971D] via-[#FF8C00] to-[#FF6B00] p-8 shadow-lg">
					<div className="flex items-center justify-between">
						<div className="flex-1">
							<div className="mb-4 flex items-center gap-3">
								<div className="flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-md">
									<svg
										className="h-7 w-7 text-[#FF971D]"
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
									<h2 className="text-2xl font-bold text-white">
										{order?.service_type || "N/A"}
									</h2>
									<p className="flex items-center gap-2 text-sm text-orange-100">
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
										{order?.order_date
											? new Date(order.order_date).toLocaleDateString("th-TH", {
													year: "numeric",
													month: "long",
													day: "numeric",
											  })
											: "N/A"}
									</p>
								</div>
							</div>
						</div>
						<div
							className={`flex items-center gap-2 rounded-full px-6 py-3 font-semibold shadow-md ${getStatusColor(
								order?.order_status || ""
							)}`}
						>
							{getStatusIcon(order?.order_status || "")}
							<span>{order?.order_status || "N/A"}</span>
						</div>
					</div>

					{/* Stats Grid */}
					<div className="mt-6 grid grid-cols-2 gap-4">
						<div className="rounded-xl bg-white/20 backdrop-blur-sm p-4 text-center">
							<div className="flex items-center justify-center gap-2 text-sm text-orange-100 mb-2">
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
										d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
									/>
								</svg>
								จำนวนผ้า
							</div>
							<p className="text-4xl font-bold text-white">
								{order?.total_cloth || 0}
							</p>
							<p className="text-sm text-orange-100">ชิ้น</p>
						</div>

						<div className="rounded-xl bg-white/20 backdrop-blur-sm p-4 text-center">
							<div className="flex items-center justify-center gap-2 text-sm text-orange-100 mb-2">
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
										d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
									/>
								</svg>
								ราคารวม
							</div>
							<p className="text-4xl font-bold text-white">
								{order?.total_cost ? order.total_cost.toLocaleString() : "0"}
							</p>
							<p className="text-sm text-orange-100">บาท</p>
						</div>
					</div>
				</div>

				{/* Customer Information Card */}
				<div className="mb-8 rounded-xl bg-white p-8 shadow-sm">
					<div className="mb-6 flex items-center gap-3 border-b border-gray-200 pb-4">
						<div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-600">
							<svg
								className="h-5 w-5 text-white"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
								/>
							</svg>
						</div>
						<h2 className="text-xl font-semibold text-gray-800">
							ข้อมูลลูกค้า
						</h2>
					</div>

					<div className="grid grid-cols-1 gap-6 md:grid-cols-2">
						{/* Customer Name */}
						<div>
							<label className="mb-2 block text-sm font-medium text-gray-600">
								<div className="flex items-center gap-2">
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
											d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
										/>
									</svg>
									ชื่อลูกค้า
								</div>
							</label>
							<div className="rounded-lg border-2 border-gray-200 bg-gradient-to-br from-gray-50 to-gray-100 px-4 py-3">
								<p className="font-semibold text-gray-900">
									{order?.user?.name || "N/A"}
								</p>
							</div>
						</div>

						{/* Phone Number */}
						<div>
							<label className="mb-2 block text-sm font-medium text-gray-600">
								<div className="flex items-center gap-2">
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
											d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
										/>
									</svg>
									หมายเลขโทรศัพท์
								</div>
							</label>
							<div className="rounded-lg border-2 border-gray-200 bg-gradient-to-br from-gray-50 to-gray-100 px-4 py-3">
								<p className="font-semibold text-gray-900">
									{order?.user?.phone_number || "N/A"}
								</p>
							</div>
						</div>
					</div>
				</div>

				{/* Order Date Card */}
				<div className="mb-8 rounded-xl bg-white p-8 shadow-sm">
					<div className="mb-6 flex items-center gap-3 border-b border-gray-200 pb-4">
						<div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-purple-600">
							<svg
								className="h-5 w-5 text-white"
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
						</div>
						<h2 className="text-xl font-semibold text-gray-800">
							วันที่สร้างคำสั่งซื้อ
						</h2>
					</div>

					<div className="flex items-center gap-4">
						<div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-green-100 to-green-200">
							<svg
								className="h-7 w-7 text-green-600"
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
						</div>
						<div className="flex-1">
							<p className="text-2xl font-bold text-gray-900">
								{order?.order_date
									? new Date(order.order_date).toLocaleDateString("th-TH", {
											year: "numeric",
											month: "long",
											day: "numeric",
									  })
									: "N/A"}
							</p>
							<p className="mt-1 text-sm text-gray-600">
								เวลา:{" "}
								{order?.order_date
									? new Date(order.order_date).toLocaleTimeString("th-TH", {
											hour: "2-digit",
											minute: "2-digit",
									  })
									: "N/A"}
							</p>
						</div>
					</div>

					{/* Payment Method Section */}
					{order?.payment_method && (
						<div className="mt-6 rounded-lg border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-yellow-50 p-4">
							<div className="flex items-center gap-2 text-amber-800">
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
								<span className="font-semibold">วิธีการชำระเงิน:</span>
								<span className="font-medium">{order.payment_method}</span>
							</div>
						</div>
					)}
				</div>

				{/* Cloth List Card */}
				<div className="rounded-xl bg-white p-8 shadow-sm">
					<div className="mb-6 flex items-center gap-3 border-b border-gray-200 pb-4">
						<div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-indigo-600">
							<svg
								className="h-5 w-5 text-white"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
								/>
							</svg>
						</div>
						<h2 className="text-xl font-semibold text-gray-800">รายการผ้า</h2>
					</div>

					{clothList.length === 0 ? (
						<div className="py-12 text-center">
							<div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
								<svg
									className="h-8 w-8 text-gray-400"
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
							</div>
							<p className="text-gray-500">ไม่มีรายการผ้า</p>
						</div>
					) : (
						<div className="overflow-hidden rounded-lg border border-gray-200">
							<table className="min-w-full divide-y divide-gray-200">
								<thead className="bg-gradient-to-r from-gray-50 to-gray-100">
									<tr>
										<th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-700">
											ประเภทผ้า
										</th>
										<th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider text-gray-700">
											จำนวน
										</th>
										<th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-gray-700">
											ราคา/ชิ้น
										</th>
										<th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-gray-700">
											รวม
										</th>
									</tr>
								</thead>
								<tbody className="divide-y divide-gray-200 bg-white">
									{clothList.map((item) => (
										<tr key={item.id} className="transition hover:bg-gray-50">
											<td className="px-6 py-4">
												<div className="flex items-center gap-3">
													<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-100 to-indigo-200">
														<svg
															className="h-5 w-5 text-indigo-600"
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
													</div>
													<span className="font-medium text-gray-900">
														{item.cloth_type}
													</span>
												</div>
											</td>
											<td className="px-6 py-4 text-center">
												<span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-800">
													{item.quantity} ชิ้น
												</span>
											</td>
											<td className="px-6 py-4 text-right font-medium text-gray-700">
												{item.cloth.cloth_price
													? item.cloth.cloth_price.toLocaleString()
													: "0"}{" "}
												฿
											</td>
											<td className="px-6 py-4 text-right">
												<span className="text-lg font-bold text-indigo-600">
													{item.sub_total_cost
														? item.sub_total_cost.toLocaleString()
														: "0"}{" "}
													฿
												</span>
											</td>
										</tr>
									))}
								</tbody>
								<tfoot className="bg-gradient-to-r from-indigo-50 to-purple-50">
									<tr>
										<td
											colSpan={3}
											className="px-6 py-4 text-right text-sm font-semibold text-gray-700"
										>
											ยอดรวมทั้งหมด
										</td>
										<td className="px-6 py-4 text-right">
											<span className="text-2xl font-bold text-indigo-600">
												{order?.total_cost
													? order.total_cost.toLocaleString()
													: "0"}{" "}
												฿
											</span>
										</td>
									</tr>
								</tfoot>
							</table>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
