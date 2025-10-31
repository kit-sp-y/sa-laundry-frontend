"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AdminNavbar from "@/components/AdminNavbar";
import { order } from "@/interface/orders";
import { getOrders } from "@/api/orders/GET";

export default function AdminOrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ทั้งหมด");

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const data = await getOrders();
        setOrders(data);
        setFilteredOrders(data);
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();

  }, []);

  useEffect(() => {
    let filtered = orders;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (order) =>
          order.id.toString().includes(searchTerm.toLowerCase()) ||
          order.service_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.user.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (statusFilter !== "ทั้งหมด") {
      filtered = filtered.filter((order) => order.order_status === statusFilter);
    }

    setFilteredOrders(filtered);
  }, [searchTerm, statusFilter, orders]);

  const handleViewDetails = (orderId: string) => {
    router.push(`/admin/orders/${orderId}`);
  };

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
          <h1 className="text-3xl font-bold text-gray-800">คำสั่งซื้อทั้งหมด</h1>
          <p className="mt-2 text-gray-600">จัดการและติดตามสถานะคำสั่งซื้อ</p>
        </div>

        {/* Search and Filter */}
        <div className="mb-6 flex gap-4">
          <div className="flex-1">
            <div className="relative">
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
          </div>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
              <svg className="h-5 w-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="appearance-none rounded-lg border-2 border-gray-300 bg-white text-gray-600 py-3 pl-11 pr-10 shadow-sm outline-none transition focus:border-[#FF971D] focus:ring-2 focus:ring-[#FF971D]/20"
            >
              <option value="ทั้งหมด">สถานะทั้งหมด</option>
              <option value="รอดำเนินการ">รอดำเนินการ</option>
              <option value="กำลังซัก/อบ">กำลังซัก/อบ</option>
              <option value="กำลังรีด">กำลังรีด</option>
              <option value="เสร็จสิ้น">เสร็จสิ้น</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4">
              <svg className="h-5 w-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <p className="mb-6 text-sm text-gray-500">
          พบ <span className="font-semibold text-gray-700">{filteredOrders.length}</span> รายการจากทั้งหมด <span className="font-semibold text-gray-700">{orders.length}</span> คำสั่งซื้อ
        </p>

        {/* Orders Table */}
        <div className="space-y-3">
          {/* Table Header */}
          <div className="grid grid-cols-7 gap-4 rounded-lg bg-gradient-to-r from-[#FF971D] to-[#FF6B00] px-6 py-4 font-semibold text-white shadow-md">
            <div>รหัส</div>
            <div>ชื่อลูกค้า</div>
            <div>ประเภทบริการ</div>
            <div className="text-center">จำนวนผ้า</div>
            <div className="text-center">ราคารวม</div>
            <div className="text-center">สถานะ</div>
            <div className="text-center">จัดการ</div>
          </div>

          {/* Table Rows */}
          {filteredOrders.length > 0 ? (
            filteredOrders.map((order) => (
              <div
                key={order.id}
                className="grid grid-cols-7 gap-4 rounded-lg border-2 border-gray-200 bg-white px-6 py-4 shadow-sm transition hover:border-[#FF971D] hover:shadow-md"
              >
                <div className="flex items-center">
                  <div>
                    <p className="font-semibold text-gray-800">
                      {order.id}
                    </p>
                    <p className="text-xs text-gray-500">{order.order_date}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <div>
                    <p className="font-medium text-gray-800">{order.user.name}</p>
                    <p className="text-xs text-gray-500">{order.user.phone_number}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                    </svg>
                    {order.service_type}
                  </span>
                </div>
                <div className="flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-lg font-bold text-gray-800">{order.total_cloth}</p>
                    <p className="text-xs text-gray-500">ชิ้น</p>
                  </div>
                </div>
                <div className="flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-lg font-bold text-[#FF971D]">{order.total_cost}</p>
                    <p className="text-xs text-gray-500">บาท</p>
                  </div>
                </div>
                <div className="flex items-center justify-center">
                  <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${
                    order.order_status === "เสร็จสิ้น" 
                      ? "bg-green-100 text-green-700 border border-green-300"
                      : order.order_status === "กำลังรีด"
                      ? "bg-cyan-100 text-cyan-700 border border-cyan-300"
                      : order.order_status === "กำลังซัก/อบ"
                      ? "bg-blue-100 text-blue-700 border border-blue-300"
                      : "bg-yellow-100 text-yellow-700 border border-yellow-300"
                  }`}>
                    {order.order_status === "เสร็จสิ้น" && (
                      <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    )}
                    {order.order_status === "กำลังรีด" && (
                      <svg className="h-3 w-3 animate-pulse" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                      </svg>
                    )}
                    {order.order_status === "กำลังซัก/อบ" && (
                      <svg className="h-3 w-3 animate-spin" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                      </svg>
                    )}
                    {order.order_status === "รอดำเนินการ" && (
                      <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                      </svg>
                    )}
                    {order.order_status}
                  </span>
                </div>
                <div className="flex items-center justify-center">
                  <button
                    onClick={() => handleViewDetails(order.id)}
                    className="inline-flex items-center gap-2 rounded-lg bg-[#FF971D] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#e68619] hover:shadow-md"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    ดูรายละเอียด
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-lg border-2 border-dashed border-gray-300 bg-white px-6 py-16 text-center shadow-sm">
              <svg className="mx-auto mb-4 h-16 w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <p className="text-lg font-medium text-gray-700">
                {searchTerm || statusFilter !== "ทั้งหมด"
                  ? "ไม่พบคำสั่งซื้อที่ตรงกับเงื่อนไขการค้นหา"
                  : "ยังไม่มีคำสั่งซื้อ"}
              </p>
              {(searchTerm || statusFilter !== "ทั้งหมด") && (
                <p className="mt-2 text-sm text-gray-500">
                  ลองค้นหาด้วยคำอื่นหรือเปลี่ยนตัวกรองสถานะ
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
