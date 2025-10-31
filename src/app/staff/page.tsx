"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import CashierNavbar from "@/components/StaffNavbar";
import { useAuth } from "@/hooks/useAuth";
import { getOrders } from "@/api/orders/GET";
import { order } from "@/interface/orders";

export default function StaffOrdersPage() {
  const router = useRouter();
  const { isAuthorized } = useAuth(["cashier", "laundryAttendant"]);
  
  const [orders, setOrders] = useState<order[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    if (!isAuthorized) return;
    fetchOrders();
  }, [isAuthorized]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await getOrders();
      setOrders(data);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = orders.filter((order) => {
    const matchesSearch = 
      order.id.toString().includes(searchTerm.toLowerCase()) ||
      order.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.service_type?.toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchesStatus = false;
    if (statusFilter === "all") {
      matchesStatus = true;
    } else if (statusFilter === "รอดำเนินการ") {
      matchesStatus = order.order_status === "รอดำเนินการ";
    } else if (statusFilter === "กำลังดำเนินการ") {
      matchesStatus = 
        order.order_status === "กำลังซัก" ||
        order.order_status === "กำลังอบ" ||
        order.order_status === "กำลังรีด";
    } else if (statusFilter === "เสร็จสิ้น") {
      matchesStatus = 
        order.order_status === "ดำเนินการเสร็จสิ้น" ||
        order.order_status === "คำสั่งซื้อสำเร็จ";
    }
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "คำสั่งซื้อสำเร็จ":
      case "ดำเนินการเสร็จสิ้น":
        return "bg-green-100 text-green-700";
      case "กำลังรีด":
        return "bg-cyan-100 text-cyan-700";
      case "กำลังอบ":
        return "bg-purple-100 text-purple-700";
      case "กำลังซัก":
        return "bg-blue-100 text-blue-700";
      case "รอดำเนินการ":
        return "bg-yellow-100 text-yellow-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getStatusIcon = (status: string) => {
    if (!status) return null;
    
    if (status === "คำสั่งซื้อสำเร็จ" || status === "ดำเนินการเสร็จสิ้น") {
      return (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    } else if (status === "กำลังซัก" || status === "กำลังอบ" || status === "กำลังรีด") {
      return (
        <svg className="h-5 w-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      );
    } else if (status === "รอดำเนินการ") {
      return (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    }
    return null;
  };  // แสดง loading ขณะตรวจสอบสิทธิ์
  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-gray-50">
        <CashierNavbar />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="mb-4 inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-[#FF971D] border-r-transparent"></div>
            <p className="text-gray-600">กำลังตรวจสอบสิทธิ์...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <CashierNavbar />

      <div className="mx-auto max-w-7xl px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">คำสั่งซื้อทั้งหมด</h1>
          <p className="mt-2 text-gray-600">จัดการและติดตามสถานะคำสั่งซื้อ</p>
        </div>

        {/* Search and Filter Bar */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row">
          {/* Search Box */}
          <div className="relative flex-1">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="ค้นหาด้วยหมายเลข, ชื่อลูกค้า หรือประเภทบริการ..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border-2 border-gray-300 bg-white py-3 pl-11 pr-4 text-gray-900 shadow-sm outline-none transition focus:border-[#FF971D] focus:ring-2 focus:ring-[#FF971D]/20"
            />
          </div>

          {/* Filter Dropdown */}
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full appearance-none rounded-lg border-2 border-gray-300 bg-white py-3 pl-11 pr-10 text-gray-900 shadow-sm outline-none transition focus:border-[#FF971D] focus:ring-2 focus:ring-[#FF971D]/20 sm:w-auto"
            >
              <option value="all">ทุกสถานะ</option>
              <option value="รอดำเนินการ">รอดำเนินการ</option>
              <option value="กำลังดำเนินการ">กำลังดำเนินการ</option>
              <option value="เสร็จสิ้น">เสร็จสิ้น</option>
            </select>
            <svg
              className="pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-4">
          <p className="text-sm text-gray-600">
            พบ <span className="font-semibold text-gray-800">{filteredOrders.length}</span> รายการจากทั้งหมด <span className="font-semibold text-gray-800">{orders.length}</span> คำสั่งซื้อ
          </p>
        </div>

        {/* Orders List */}
        {loading ? (
          <div className="rounded-lg bg-white p-12 text-center shadow-sm">
            <div className="mb-4 inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-[#FF971D] border-r-transparent"></div>
            <p className="text-gray-600">กำลังโหลดข้อมูล...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="rounded-lg border-2 border-dashed border-gray-300 bg-white p-12 text-center shadow-sm">
            <svg className="mx-auto mb-4 h-16 w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-lg font-medium text-gray-700">
              {searchTerm || statusFilter !== "all" ? "ไม่พบคำสั่งซื้อที่ตรงกับเงื่อนไขการค้นหา" : "ยังไม่มีคำสั่งซื้อ"}
            </p>
            {(searchTerm || statusFilter !== "all") && (
              <p className="mt-2 text-sm text-gray-500">
                ลองค้นหาด้วยคำอื่นหรือเปลี่ยนตัวกรอง
              </p>
            )}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-2">
            {filteredOrders.map((order) => (
              <div
                key={order.id}
                className="group rounded-lg border-2 border-gray-200 bg-white p-6 shadow-sm transition hover:border-[#FF971D] hover:shadow-md"
              >
                {/* Order Header */}
                <div className="mb-4 flex items-start justify-between">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-800">#{order.id}</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {order.order_date
                        ? new Date(order.order_date).toLocaleDateString("th-TH", {
                            year: "numeric",
                            month: "long",
                            day: "numeric"
                          })
                        : "N/A"}
                    </p>
                  </div>
                  <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-medium ${getStatusColor(order.order_status || "")}`}>
                    {getStatusIcon(order.order_status || "")}
                    {order.order_status || "N/A"}
                  </span>
                </div>

                {/* Order Details */}
                <div className="mb-4 space-y-3 border-t border-gray-100 pt-4">
                  <div className="flex items-center gap-3 text-gray-700">
                    <svg className="h-5 w-5 flex-shrink-0 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span className="text-sm font-medium">ลูกค้า:</span>
                    <span className="text-sm">{order.user?.name || "N/A"}</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-700">
                    <svg className="h-5 w-5 flex-shrink-0 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                    <span className="text-sm font-medium">ประเภท:</span>
                    <span className="text-sm">{order.service_type || "N/A"}</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-700">
                    <svg className="h-5 w-5 flex-shrink-0 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                    <span className="text-sm font-medium">จำนวน:</span>
                    <span className="text-sm">{order.total_cloth || 0} ชิ้น</span>
                  </div>
                </div>

                {/* Order Footer */}
                <div className="flex items-center justify-between border-t border-gray-100 pt-4">
                  <div>
                    <p className="text-xs text-gray-500">ราคารวม</p>
                    <p className="text-2xl font-bold text-[#FF971D]">
                      {order.total_cost ? order.total_cost.toLocaleString() : "0"} ฿
                    </p>
                  </div>
                  <button
                    onClick={() => router.push(`/staff/orders/${order.id}`)}
                    className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-[#FF971D] to-[#FF6B00] px-4 py-2 text-sm font-medium text-white shadow-md transition hover:shadow-lg"
                  >
                    ดูรายละเอียด
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
