"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import CustomerNavbar from "@/components/CustomerNavbar";
import { useAuth } from "@/hooks/useAuth";

interface UserData {
  id: number;
  name: string;
  phone_number: string;
  role: string;
}

export default function CustomerDashboard() {
  const router = useRouter();
  const params = useParams();
  const customerId = params.id as string;
  const { isAuthorized } = useAuth("customer");
  
  const [userData, setUserData] = useState<UserData | null>(null);

  useEffect(() => {
    if (!isAuthorized) return;

    // โหลดข้อมูล user
    const userDataStr = localStorage.getItem("user_data");
    if (userDataStr) {
      const data = JSON.parse(userDataStr);
      setUserData(data);
      
      // ตรวจสอบว่า id ตรงกันหรือไม่
      if (data.id && data.id !== parseInt(customerId)) {
        // ถ้า id ไม่ตรง redirect ไปหน้าของตัวเอง
        router.replace(`/${data.id}`);
      }
    }
  }, [isAuthorized, customerId, router]);

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

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">
            ยินดีต้อนรับ{userData?.name ? `, ${userData.name}` : ""}
          </h1>
          <p className="mt-2 text-gray-600">หน้าสำหรับลูกค้า</p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div
            onClick={() => router.push(`/${customerId}/orders`)}
            className="cursor-pointer rounded-lg bg-white p-6 shadow-sm transition hover:shadow-md"
          >
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
              <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="mb-2 text-lg font-semibold text-gray-800">คำสั่งซื้อของฉัน</h3>
            <p className="mb-4 text-sm text-gray-600">ตรวจสอบสถานะคำสั่งซื้อ</p>
            <span className="inline-block rounded-lg bg-[#FF971D] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#e68619]">
              ดูคำสั่งซื้อ
            </span>
          </div>

          <div
            onClick={() => router.push(`/${customerId}/profile`)}
            className="cursor-pointer rounded-lg bg-white p-6 shadow-sm transition hover:shadow-md"
          >
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
              <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h3 className="mb-2 text-lg font-semibold text-gray-800">โปรไฟล์</h3>
            <p className="mb-4 text-sm text-gray-600">จัดการข้อมูลส่วนตัว</p>
            <span className="inline-block rounded-lg bg-[#FF971D] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#e68619]">
              ดูโปรไฟล์
            </span>
          </div>

          <div
            onClick={() => router.push(`/${customerId}/coupons`)}
            className="cursor-pointer rounded-lg bg-white p-6 shadow-sm transition hover:shadow-md"
          >
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-purple-100">
              <svg className="h-6 w-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
              </svg>
            </div>
            <h3 className="mb-2 text-lg font-semibold text-gray-800">คูปอง</h3>
            <p className="mb-4 text-sm text-gray-600">คูปองของคุณ</p>
            <span className="inline-block rounded-lg bg-[#FF971D] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#e68619]">
              ดูคูปอง
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
