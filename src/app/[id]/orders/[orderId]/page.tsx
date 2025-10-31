"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import CustomerNavbar from "@/components/CustomerNavbar";
import { useAuth } from "@/hooks/useAuth";
import { getOrderInfo } from "@/api/orders/GET";
import { order } from "@/interface/orders";
import { clothListResponse } from "@/interface/clothList";
import { getClothListByOrderId } from "@/api/cloth_lists/GET";

export default function CustomerOrderDetailPage() {
  const router = useRouter();
  const params = useParams();
  const customerId = params.id as string;
  const orderId = params.orderId as string;
  const { isAuthorized } = useAuth("customer");
  
  const [order, setOrder] = useState<order | null>(null);
  const [clothLists, setClothLists] = useState<clothListResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthorized) return;

    // ตรวจสอบว่า id ตรงกับ user ที่ login หรือไม่
    const userDataStr = localStorage.getItem("user_data");
    if (userDataStr) {
      const userData = JSON.parse(userDataStr);
      if (userData.id && String(userData.id) !== String(customerId)) {
        router.replace(`/${userData.id}/orders`);
        return;
      }
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await getOrderInfo(orderId);
        const cloths = await getClothListByOrderId(orderId);
        console.log("Order data:", data);
        console.log("Cloth lists:", cloths);
        setOrder(data);
        setClothLists(cloths);
      } catch (error) {
        console.error("Error fetching order detail:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [isAuthorized, customerId, orderId, router]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "คำสั่งซื้อเสร็จสิ้น":
        return "bg-green-100 text-green-700";
      case "กำลังดำเนินการ":
        return "bg-blue-100 text-blue-700";
      case "กำลังซัก":
        return "bg-cyan-100 text-cyan-700";
      case "กำลังอบ":
      case "กำลังอัก/อบ":
        return "bg-indigo-100 text-indigo-700";
      case "รอดำเนินการ":
        return "bg-yellow-100 text-yellow-700";
      case "ยกเลิก":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "คำสั่งซื้อเสร็จสิ้น":
        return (
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case "กำลังดำเนินการ":
      case "กำลังซัก":
      case "กำลังอบ":
      case "กำลังอัก/อบ":
        return (
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case "รอดำเนินการ":
        return (
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        );
      case "ยกเลิก":
        return (
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      default:
        return null;
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "ไม่ระบุ";
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "ไม่ระบุ";
    
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    
    const monthNames = [
      "ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.",
      "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."
    ];
    
    return `${day} ${monthNames[month - 1]} ${year + 543} ${hours}:${minutes} น.`;
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <CustomerNavbar customerId={customerId} />
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
        <CustomerNavbar customerId={customerId} />
        <div className="mx-auto max-w-5xl px-4 py-8">
          <div className="rounded-lg bg-white p-12 text-center shadow-sm">
            <svg className="mx-auto mb-4 h-16 w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="mb-4 text-lg font-medium text-gray-700">ไม่พบคำสั่งซื้อ</p>
            <button
              onClick={() => router.push(`/${customerId}/orders`)}
              className="rounded-lg bg-[#FF971D] px-6 py-2 text-white transition hover:bg-[#e68619]"
            >
              กลับไปหน้าคำสั่งซื้อ
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <CustomerNavbar customerId={customerId} />

      <div className="mx-auto max-w-6xl px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push(`/${customerId}/orders`)}
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
              <p className="mt-2 text-gray-600">#{order.id.substring(0, 8).toUpperCase()}</p>
            </div>
            <div className={`flex items-center gap-2 rounded-lg px-4 py-2 ${getStatusColor(order.order_status)}`}>
              {getStatusIcon(order.order_status)}
              <span className="font-semibold">{order.order_status}</span>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left Column - Main Content */}
          <div className="space-y-6 lg:col-span-2">
            {/* Order Items */}
            <div className="rounded-lg bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-semibold text-gray-800 border-b border-gray-200 pb-3">
                รายการผ้า
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">ประเภทผ้า</th>
                      <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">หมวดหมู่</th>
                      <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">จำนวน</th>
                      <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">ราคา/ชิ้น</th>
                      <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">รวม</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {clothLists && clothLists.length > 0 ? (
                      clothLists.map((item) => (
                        <tr key={item.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm text-gray-900">{item.cloth?.cloth_name || "ไม่ระบุ"}</td>
                          <td className="px-4 py-3 text-center text-sm text-gray-600">
                            <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700">
                              {item.cloth?.category || "ไม่ระบุ"}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center text-sm text-gray-900">{item.quantity}</td>
                          <td className="px-4 py-3 text-right text-sm text-gray-900">{item.cloth?.cloth_price?.toFixed(2) || "0.00"} ฿</td>
                          <td className="px-4 py-3 text-right text-sm font-medium text-gray-900">{item.sub_total_cost.toFixed(2)} ฿</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                          ไม่มีรายการผ้า
                        </td>
                      </tr>
                    )}
                  </tbody>
                  <tfoot className="bg-gray-50">
                    <tr>
                      <td colSpan={4} className="px-4 py-4 text-right text-base font-semibold text-gray-800">
                        ยอดรวมทั้งหมด:
                      </td>
                      <td className="px-4 py-4 text-right text-xl font-bold text-[#FF971D]">
                        {order.total_cost.toFixed(2)} ฿
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* Payment Method */}
            <div className="rounded-lg bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-semibold text-gray-800 border-b border-gray-200 pb-3">
                วิธีการชำระเงิน
              </h2>
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-green-50 p-3">
                  <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-gray-600">ชำระผ่าน</p>
                  <p className="text-lg font-semibold text-gray-900">{order.payment_method}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Order Info */}
          <div className="space-y-6">
            {/* Order Information */}
            <div className="rounded-lg bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-semibold text-gray-800 border-b border-gray-200 pb-3">
                ข้อมูลคำสั่งซื้อ
              </h2>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">หมายเลขคำสั่งซื้อ</p>
                  <p className="text-base font-semibold text-gray-900">#{order.id.substring(0, 8).toUpperCase()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">ประเภทบริการ</p>
                  <p className="text-base font-medium text-gray-900">{order.service_type}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">จำนวนชิ้นทั้งหมด</p>
                  <p className="text-base font-medium text-gray-900">{order.total_cloth} ชิ้น</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">วันที่สร้างคำสั่งซื้อ</p>
                  <div className="flex items-center gap-2 text-base text-gray-900">
                    <svg className="h-4 w-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>{formatDate(order.order_date)}</span>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">วันที่นัดรับ</p>
                  <div className="flex items-center gap-2 text-base text-gray-900">
                    <svg className="h-4 w-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{formatDate(order.pickup_date)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Customer Information */}
            <div className="rounded-lg bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-semibold text-gray-800 border-b border-gray-200 pb-3">
                ข้อมูลลูกค้า
              </h2>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">ชื่อลูกค้า</p>
                  <div className="flex items-center gap-2 text-base font-medium text-gray-900">
                    <svg className="h-4 w-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span>{order.user?.name || "ไม่ระบุ"}</span>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">ชื่อเล่น</p>
                  <div className="flex items-center gap-2 text-base font-medium text-gray-900">
                    <svg className="h-4 w-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{order.user?.nickname || "ไม่ระบุ"}</span>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">เบอร์โทรศัพท์</p>
                  <div className="flex items-center gap-2 text-base font-medium text-gray-900">
                    <svg className="h-4 w-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <span>{order.user?.phone_number || "ไม่ระบุ"}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Summary Card */}
            <div className="rounded-lg bg-gradient-to-r from-[#FF971D] to-[#FF6B00] p-6 shadow-lg text-white">
              <h3 className="mb-3 text-lg font-semibold">ยอดรวมทั้งหมด</h3>
              <p className="text-4xl font-bold">{order.total_cost.toFixed(2)} ฿</p>
              <p className="mt-2 text-sm opacity-90">{order.total_cloth} ชิ้น • {clothLists?.length || 0} รายการ</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
