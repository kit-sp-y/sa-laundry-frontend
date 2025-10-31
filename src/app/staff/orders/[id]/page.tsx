"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import StaffNavbar from "@/components/StaffNavbar";
import { useAuth } from "@/hooks/useAuth";
import { getOrderInfo } from "@/api/orders/GET";
import { updateOrder } from "@/api/orders/PUT";
import { order } from "@/interface/orders";
import { getClothListByOrderId } from "@/api/cloth_lists/GET";
import { clothListResponse } from "@/interface/clothList";

export default function StaffOrderDetailPage() {
  const router = useRouter();
  const params = useParams();
  const orderId = params.id as string;
  const { isAuthorized } = useAuth(["cashier", "laundryAttendant"]);
  
  const [order, setOrder] = useState<order | null>(null);
  const [clothList, setClothList] = useState<clothListResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditingStatus, setIsEditingStatus] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isAuthorized) return;
    
    const fetchOrderDetail = async () => {
      try {
        setLoading(true);
        const orderData = await getOrderInfo(orderId);
        const clothListData = await getClothListByOrderId(orderId);
        
        setOrder(orderData);
        setClothList(clothListData);
        setNewStatus(orderData.order_status);
      } catch (error) {
        console.error("Error fetching order detail:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchOrderDetail();
  }, [isAuthorized, orderId]);

  const handleUpdateStatus = async () => {
    if (!order) return;
    
    try {
      setSaving(true);
      
      // ส่ง order ทั้งก้อนพร้อมกับ status ใหม่
      const updatedOrder = {
        ...order,
        order_status: newStatus,
      };
      
      await updateOrder(orderId, updatedOrder);
      
      setOrder(updatedOrder);
      setIsEditingStatus(false);
      alert("อัพเดทสถานะสำเร็จ");
    } catch (error) {
      console.error("Error updating status:", error);
      alert("เกิดข้อผิดพลาดในการอัพเดทสถานะ");
    } finally {
      setSaving(false);
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "รอดำเนินการ":
        return "รอดำเนินการ";
      case "กำลังซัก":
        return "กำลังซัก";
      case "กำลังอบ":
        return "กำลังอบ";
      case "กำลังรีด":
        return "กำลังรีด";
      case "ดำเนินการเสร็จสิ้น":
        return "ดำเนินการเสร็จสิ้น";
      case "คำสั่งซื้อสำเร็จ":
        return "คำสั่งซื้อสำเร็จ";
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "รอดำเนินการ":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "กำลังซัก":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "กำลังอบ":
        return "bg-purple-100 text-purple-700 border-purple-200";
      case "กำลังรีด":
        return "bg-indigo-100 text-indigo-700 border-indigo-200";
      case "ดำเนินการเสร็จสิ้น":
        return "bg-teal-100 text-teal-700 border-teal-200";
      case "คำสั่งซื้อสำเร็จ":
        return "bg-green-100 text-green-700 border-green-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "รอดำเนินการ":
        return (
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case "กำลังซัก":
      case "กำลังอบ":
      case "กำลังรีด":
        return (
          <svg className="h-6 w-6 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        );
      case "ดำเนินการเสร็จสิ้น":
      case "คำสั่งซื้อสำเร็จ":
        return (
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      default:
        return null;
    }
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

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50">
        <StaffNavbar />
        <div className="mx-auto max-w-6xl px-4 py-8">
          <div className="rounded-lg border-2 border-dashed border-gray-300 bg-white px-6 py-16 text-center">
            <p className="text-lg font-medium text-gray-700">ไม่พบข้อมูลคำสั่งซื้อ</p>
            <button
              onClick={() => router.push("/staff")}
              className="mt-4 text-sm text-[#FF971D] hover:underline"
            >
              ← กลับไปหน้าคำสั่งซื้อ
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
            onClick={() => router.push("/staff")}
            className="mb-4 flex items-center gap-2 text-sm text-gray-600 transition hover:text-[#FF971D]"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            กลับไปหน้าคำสั่งซื้อ
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">รายละเอียดคำสั่งซื้อ</h1>
              <p className="mt-2 text-gray-600">หมายเลข: {order.id}</p>
            </div>
            <div className={`flex items-center gap-3 rounded-lg border-2 px-6 py-3 ${getStatusColor(order.order_status)}`}>
              {getStatusIcon(order.order_status)}
              <span className="text-lg font-semibold">{getStatusLabel(order.order_status)}</span>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left Column - Order Details */}
          <div className="space-y-6 lg:col-span-2">
            {/* Customer Information */}
            <div className="rounded-lg bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-semibold text-gray-800 border-b border-gray-200 pb-3">
                ข้อมูลลูกค้า
              </h2>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span className="text-sm font-medium text-gray-500 w-24">ชื่อ:</span>
                  <span className="text-sm text-gray-900">{order.user?.name || "N/A"}</span>
                </div>
                <div className="flex items-center gap-3">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <span className="text-sm font-medium text-gray-500 w-24">เบอร์โทร:</span>
                  <span className="text-sm text-gray-900">{order.user?.phone_number || "N/A"}</span>
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div className="rounded-lg bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-semibold text-gray-800 border-b border-gray-200 pb-3">
                รายการผ้า
              </h2>
              <div className="space-y-2">
                {/* Table Header */}
                <div className="grid grid-cols-12 gap-4 rounded-lg bg-gray-100 px-4 py-3 text-sm font-semibold text-gray-700">
                  <div className="col-span-5">ประเภทผ้า</div>
                  <div className="col-span-2 text-center">จำนวน</div>
                  <div className="col-span-2 text-right">ราคา/ชิ้น</div>
                  <div className="col-span-3 text-right">รวม</div>
                </div>

                {/* Table Rows */}
                {clothList.length === 0 ? (
                  <div className="py-8 text-center text-gray-500">
                    ไม่มีรายการผ้า
                  </div>
                ) : (
                  clothList.map((item) => (
                    <div
                      key={item.id}
                      className="grid grid-cols-12 gap-4 rounded-lg border border-gray-200 px-4 py-3 text-sm hover:bg-gray-50"
                    >
                      <div className="col-span-5 text-gray-900">{item.cloth?.cloth_name || "N/A"}</div>
                      <div className="col-span-2 text-center text-gray-700">{item.quantity} ชิ้น</div>
                      <div className="col-span-2 text-right text-gray-700">
                        {item.cloth?.cloth_price?.toLocaleString() || 0} ฿
                      </div>
                      <div className="col-span-3 text-right font-medium text-gray-900">
                        {item.sub_total_cost?.toLocaleString() || 0} ฿
                      </div>
                    </div>
                  ))
                )}

                {/* Total */}
                <div className="mt-4 rounded-lg bg-gradient-to-r from-[#FF971D] to-[#FF6B00] px-4 py-4 text-white">
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-semibold">ยอดรวมทั้งหมด</span>
                    <span className="text-2xl font-bold">{order.total_cost?.toLocaleString() || 0} ฿</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Notes - Remove this section since order interface doesn't have notes */}
          </div>

          {/* Right Column - Status Management */}
          <div className="space-y-6">
            {/* Status Update */}
            <div className="rounded-lg bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-semibold text-gray-800 border-b border-gray-200 pb-3">
                จัดการสถานะ
              </h2>
              
              {!isEditingStatus ? (
                <button
                  onClick={() => setIsEditingStatus(true)}
                  className="w-full flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-[#FF971D] to-[#FF6B00] px-4 py-3 text-sm font-medium text-white shadow-lg transition hover:shadow-xl"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  เปลี่ยนสถานะ
                </button>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      เลือกสถานะใหม่
                    </label>
                    <div className="relative">
                      <select
                        value={newStatus}
                        onChange={(e) => setNewStatus(e.target.value)}
                        className="w-full appearance-none rounded-lg border-2 border-gray-300 bg-white px-4 py-3 pr-10 text-gray-900 focus:border-[#FF971D] focus:outline-none focus:ring-2 focus:ring-[#FF971D]/20"
                        disabled={saving}
                      >
                        <option value="รอดำเนินการ">รอดำเนินการ</option>
                        <option value="กำลังซัก">กำลังซัก</option>
                        <option value="กำลังอบ">กำลังอบ</option>
                        <option value="กำลังรีด">กำลังรีด</option>
                        <option value="ดำเนินการเสร็จสิ้น">ดำเนินการเสร็จสิ้น</option>
                        <option value="คำสั่งซื้อสำเร็จ">คำสั่งซื้อสำเร็จ</option>
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

                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setIsEditingStatus(false);
                        setNewStatus(order.order_status);
                      }}
                      disabled={saving}
                      className="flex-1 rounded-lg border-2 border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
                    >
                      ยกเลิก
                    </button>
                    <button
                      onClick={handleUpdateStatus}
                      disabled={saving}
                      className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-green-500 to-green-600 px-4 py-2 text-sm font-medium text-white shadow-lg transition hover:shadow-xl disabled:opacity-50"
                    >
                      {saving ? (
                        <>
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                          กำลังบันทึก...
                        </>
                      ) : (
                        <>
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          บันทึก
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Order Timeline */}
            <div className="rounded-lg bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-semibold text-gray-800 border-b border-gray-200 pb-3">
                ข้อมูลเพิ่มเติม
              </h2>
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-gray-500 mb-1">ประเภทบริการ</p>
                  <p className="text-sm font-medium text-gray-900">{order.service_type || "N/A"}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">จำนวนทั้งหมด</p>
                  <p className="text-sm font-medium text-gray-900">{order.total_cloth || 0} ชิ้น</p>
                </div>
                {order.payment_method && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1">วิธีการชำระเงิน</p>
                    <div className="flex items-center gap-2">
                      <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      <p className="text-sm font-medium text-gray-900">{order.payment_method}</p>
                    </div>
                  </div>
                )}
                <div>
                  <p className="text-xs text-gray-500 mb-1">วันที่สร้าง</p>
                  <p className="text-sm font-medium text-gray-900">
                    {order.order_date 
                      ? new Date(order.order_date).toLocaleDateString("th-TH", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit"
                        })
                      : "N/A"}
                  </p>
                </div>
                {order.pickup_date && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1">วันรับผ้า</p>
                    <p className="text-sm font-medium text-gray-900">
                      {new Date(order.pickup_date).toLocaleDateString("th-TH", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
