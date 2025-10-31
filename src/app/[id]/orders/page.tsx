"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import CustomerNavbar from "@/components/CustomerNavbar";
import { useAuth } from "@/hooks/useAuth";
import { getOrdersById } from "@/api/orders/GET";
import { order } from "@/interface/orders";

export default function CustomerOrdersPage() {
  const router = useRouter();
  const params = useParams();
  const customerId = params.id as string;
  const { isAuthorized } = useAuth("customer");
  
  const [orders, setOrders] = useState<order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("ทั้งหมด");

  useEffect(() => {
    if (!isAuthorized) {
      return;
    }

    // ตรวจสอบว่า id ตรงกับ user ที่ login หรือไม่
    const userDataStr = localStorage.getItem("user_data");
    if (userDataStr) {
      const userData = JSON.parse(userDataStr);
      if (userData.id && String(userData.id) !== String(customerId)) {
        router.replace(`/${userData.id}/orders`);
        return;
      }
    }

    const fetchOrders = async () => {
      try {
        setLoading(true);
        const data = await getOrdersById(customerId);
        setOrders(data);
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [isAuthorized, customerId, router]);

  const filteredOrders = orders.filter((order) => {
    if (statusFilter === "ทั้งหมด") return true;
    if (statusFilter === "รอดำเนินการ") return order.order_status === "รอดำเนินการ";
    if (statusFilter === "กำลังดำเนินการ") {
      return (
        order.order_status === "กำลังซัก" ||
        order.order_status === "กำลังอบ" ||
        order.order_status === "กำลังรีด"
      );
    }
    if (statusFilter === "เสร็จสิ้น") {
      return (
        order.order_status === "ดำเนินการเสร็จสิ้น" ||
        order.order_status === "คำสั่งซื้อสำเร็จ"
      );
    }
    return true;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "คำสั่งซื้อสำเร็จ":
      case "ดำเนินการเสร็จสิ้น":
        return "text-green-600 bg-green-50";
      case "กำลังรีด":
        return "text-cyan-600 bg-cyan-50";
      case "กำลังอบ":
        return "text-purple-600 bg-purple-50";
      case "กำลังซัก":
        return "text-blue-600 bg-blue-50";
      case "รอดำเนินการ":
        return "text-yellow-600 bg-yellow-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-gray-50">
        <CustomerNavbar customerId={customerId} />
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
      <CustomerNavbar customerId={customerId} />

      <div className="mx-auto max-w-7xl px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800">คำสั่งซื้อทั้งหมด</h1>
        </div>

        {/* Filter Tabs */}
        <div className="mb-6 flex gap-2">
          {["ทั้งหมด", "รอดำเนินการ", "กำลังดำเนินการ", "เสร็จสิ้น"].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                statusFilter === status
                  ? "bg-[#FF971D] text-white"
                  : "bg-white text-gray-700 hover:bg-gray-100"
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        {/* Orders Table */}
        {loading ? (
          <div className="rounded-lg bg-white p-8 text-center shadow-sm">
            <div className="mb-4 inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-[#FF971D] border-r-transparent"></div>
            <p className="text-gray-600">กำลังโหลดข้อมูล...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="rounded-lg bg-white p-8 text-center shadow-sm">
            <p className="text-gray-500">ไม่พบคำสั่งซื้อ</p>
          </div>
        ) : (
          <div className="rounded-lg bg-white p-6 shadow-sm">
            {/* Table Header */}
            <div className="mb-4 grid grid-cols-12 gap-4 border-b-2 border-gray-200 pb-3 text-center font-semibold text-gray-700">
              <div className="col-span-2">หมายเลขคำสั่งซื้อ</div>
              <div className="col-span-3">ประเภทบริการ</div>
              <div className="col-span-2">จำนวนชิ้น</div>
              <div className="col-span-3">สถานะคำสั่งซื้อ</div>
            </div>

            {/* Table Rows */}
            <div className="space-y-3">
              {filteredOrders.map((order) => (
                <div
                  key={order.id}
                  className="grid grid-cols-12 items-center gap-4 rounded-lg border-2 border-gray-200 bg-white px-4 py-4 text-center transition hover:border-gray-300 hover:shadow-sm"
                >
                  <div className="col-span-2 font-semibold text-gray-900">{order.id}</div>
                  <div className="col-span-3 text-gray-900">{order.service_type}</div>
                  <div className="col-span-2 text-gray-900">{order.total_cloth}</div>
                  <div className="col-span-3">
                    <span className={`inline-block rounded-full px-4 py-1 text-sm font-medium ${getStatusColor(order.order_status)}`}>
                      {order.order_status}
                    </span>
                  </div>
                  <div className="col-span-2">
                    <button 
                      onClick={() => router.push(`/${customerId}/orders/${order.id}`)}
                      className="rounded-lg bg-[#FF971D] px-6 py-2 text-sm font-medium text-white transition hover:bg-[#e68619]"
                    >
                      ตรวจสอบ
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
