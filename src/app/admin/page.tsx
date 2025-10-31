"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AdminNavbar from "@/components/AdminNavbar";
import { useAuth } from "@/hooks/useAuth";
import { order } from "@/interface/orders";
import { getOrders } from "@/api/orders/GET";
import { getCustomers } from "@/api/customers/GET";
import { customerResponse } from "@/interface/customers";

interface DashboardStats {
	totalOrders: number;
	pendingOrders: number;
	processingOrders: number;
	completedOrders: number;
	totalRevenue: number;
	totalCustomers: number;
}

export default function AdminDashboardPage() {
	const router = useRouter();
	const { isAuthorized } = useAuth("admin"); // ป้องกันการเข้าถึงถ้าไม่ใช่ admin

  const [customers, setCustomers] = useState<customerResponse[]>([]);
	const [stats, setStats] = useState<DashboardStats | null>(null);
	const [recentOrders, setRecentOrders] = useState<order[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		if (!isAuthorized) return;
		fetchDashboardData();
	}, [isAuthorized]);

	const fetchDashboardData = async () => {
		try {
			setLoading(true);
			const orders = await getOrders();
			const customers = await getCustomers();
			setRecentOrders(orders);
			setCustomers(customers);

			// คำนวณ stats หลังจากได้ข้อมูลแล้ว
			const Stats: DashboardStats = {
				totalOrders: orders.length,
				// รอดำเนินการ
				pendingOrders: orders.filter(
					(order) => order.order_status === "รอดำเนินการ"
				).length,
				// กำลังดำเนินการ (กำลังซัก, กำลังอบ, กำลังรีด)
				processingOrders: orders.filter(
					(order) => 
						order.order_status === "กำลังซัก" || 
						order.order_status === "กำลังอบ" || 
						order.order_status === "กำลังรีด"
				).length,
				// ดำเนินการเสร็จสิ้น (ดำเนินการเสร็จสิ้น, คำสั่งซื้อเสร็จสิ้น)
				completedOrders: orders.filter(
					(order) => 
						order.order_status === "ดำเนินการเสร็จสิ้น" || 
						order.order_status === "คำสั่งซื้อสำเร็จ"
				).length,
				totalRevenue: orders.reduce(
					(acc, order) => acc + order.total_cost,
					0
				),
				totalCustomers: customers.length,
			};
			setStats(Stats);
		} catch (error) {
			console.error("Error fetching orders:", error);
		} finally {
			setLoading(false);
		}
	};

	const getStatusColor = (status: string) => {
		switch (status) {
			case "คำสั่งซื้อสำเร็จ":
			case "ดำเนินการเสร็จสิ้น":
				return "bg-green-100 text-green-700 border-green-300";
			case "กำลังรีด":
				return "bg-cyan-100 text-cyan-700 border-cyan-300";
			case "กำลังอบ":
				return "bg-purple-100 text-purple-700 border-purple-300";
			case "กำลังซัก":
				return "bg-blue-100 text-blue-700 border-blue-300";
			case "รอดำเนินการ":
				return "bg-yellow-100 text-yellow-700 border-yellow-300";
			default:
				return "bg-gray-100 text-gray-700 border-gray-300";
		}
	};

	// แสดง loading ขณะตรวจสอบสิทธิ์
	if (!isAuthorized) {
		return (
			<div className="min-h-screen bg-gray-50">
				<AdminNavbar />
				<div className="flex items-center justify-center py-20">
					<div className="text-center">
						<div className="mb-4 inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-[#FF971D] border-r-transparent"></div>
						<p className="text-gray-600">กำลังตรวจสอบสิทธิ์...</p>
					</div>
				</div>
			</div>
		);
	}

	if (loading) {
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
				<div className="mb-8">
					<h1 className="text-3xl font-bold text-gray-800">แดชบอร์ด</h1>
					<p className="mt-2 text-gray-600">ภาพรวมของระบบ P.P. LAUNDRY</p>
				</div>

				{/* Stats Cards */}
				<div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
					{/* Total Orders */}
					<div className="rounded-lg bg-white p-6 shadow-sm transition hover:shadow-md">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm font-medium text-gray-600">
									คำสั่งซื้อทั้งหมด
								</p>
								<p className="mt-2 text-3xl font-bold text-gray-800">
									{stats?.totalOrders}
								</p>
							</div>
							<div className="rounded-full bg-blue-100 p-3">
								<svg
									className="h-8 w-8 text-blue-600"
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
						</div>
					</div>

					{/* Pending Orders */}
					<div className="rounded-lg bg-white p-6 shadow-sm transition hover:shadow-md">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm font-medium text-gray-600">รอดำเนินการ</p>
								<p className="mt-2 text-3xl font-bold text-yellow-600">
									{stats?.pendingOrders}
								</p>
							</div>
							<div className="rounded-full bg-yellow-100 p-3">
								<svg
									className="h-8 w-8 text-yellow-600"
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
						</div>
					</div>

					{/* Processing Orders */}
					<div className="rounded-lg bg-white p-6 shadow-sm transition hover:shadow-md">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm font-medium text-gray-600">
									กำลังดำเนินการ
								</p>
								<p className="mt-2 text-3xl font-bold text-cyan-600">
									{stats?.processingOrders}
								</p>
							</div>
							<div className="rounded-full bg-cyan-100 p-3">
								<svg
									className="h-8 w-8 text-cyan-600"
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
							</div>
						</div>
					</div>

					{/* Completed Orders */}
					<div className="rounded-lg bg-white p-6 shadow-sm transition hover:shadow-md">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm font-medium text-gray-600">
									เสร็จสิ้นแล้ว
								</p>
								<p className="mt-2 text-3xl font-bold text-green-600">
									{stats?.completedOrders}
								</p>
							</div>
							<div className="rounded-full bg-green-100 p-3">
								<svg
									className="h-8 w-8 text-green-600"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
									/>
								</svg>
							</div>
						</div>
					</div>

					{/* Total Revenue */}
					<div className="rounded-lg bg-white p-6 shadow-sm transition hover:shadow-md">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm font-medium text-gray-600">
									รายได้ทั้งหมด
								</p>
								<p className="mt-2 text-3xl font-bold text-[#FF971D]">
									{stats?.totalRevenue.toLocaleString()} ฿
								</p>
							</div>
							<div className="rounded-full bg-orange-100 p-3">
								<svg
									className="h-8 w-8 text-[#FF971D]"
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
							</div>
						</div>
					</div>

					{/* Total Customers */}
					<div className="rounded-lg bg-white p-6 shadow-sm transition hover:shadow-md">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm font-medium text-gray-600">
									ลูกค้าทั้งหมด
								</p>
								<p className="mt-2 text-3xl font-bold text-purple-600">
									{stats?.totalCustomers}
								</p>
							</div>
							<div className="rounded-full bg-purple-100 p-3">
								<svg
									className="h-8 w-8 text-purple-600"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
									/>
								</svg>
							</div>
						</div>
					</div>
				</div>

				{/* Recent Orders */}
				<div className="rounded-lg bg-white p-6 shadow-sm">
					<div className="mb-4 flex items-center justify-between">
						<h2 className="text-xl font-bold text-gray-800">
							คำสั่งซื้อล่าสุด
						</h2>
						<button
							onClick={() => router.push("/admin/orders")}
							className="text-sm font-medium text-[#FF971D] transition hover:text-[#e68619]"
						>
							ดูทั้งหมด →
						</button>
					</div>

					<div className="space-y-3">
						{recentOrders.map((order) => (
							<div
								key={order.id}
								className="flex items-center justify-between rounded-lg border border-gray-200 p-4 transition hover:border-gray-300 hover:bg-gray-50"
							>
								<div className="flex items-center gap-4">
									<div>
										<p className="font-semibold text-gray-800">{order.id}</p>
										<p className="text-sm text-gray-600">{order.user.name}</p>
									</div>
								</div>

								<div className="flex items-center gap-4">
									<p className="text-sm text-gray-600">
										{new Date(order.order_date).toLocaleDateString("th-TH", {
											month: "short",
											day: "numeric",
											hour: "2-digit",
											minute: "2-digit",
										})}
									</p>
									<span
										className={`rounded-full border px-4 py-1.5 text-sm font-medium ${getStatusColor(
											order.order_status
										)}`}
									>
										{order.order_status}
									</span>
									<button
										onClick={() => router.push(`/admin/orders/${order.id}`)}
										className="rounded-full bg-[#FF971D] px-4 py-1.5 text-sm font-medium text-white transition hover:bg-[#e68619]"
									>
										ดูรายละเอียด
									</button>
								</div>
							</div>
						))}
					</div>
				</div>
			</div>
		</div>
	);
}
