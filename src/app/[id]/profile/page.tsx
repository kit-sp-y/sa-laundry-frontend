"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import CustomerNavbar from "@/components/CustomerNavbar";
import { useAuth } from "@/hooks/useAuth";

interface UserData {
  id: number;
  name: string;
  nickname: string;
  phone_number: string;
  role: string;
}

export default function CustomerProfilePage() {
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
        router.replace(`/${data.id}/profile`);
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

      <div className="mx-auto max-w-4xl px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800">โปรไฟล์</h1>
          <p className="mt-2 text-gray-600">จัดการข้อมูลส่วนตัวของคุณ</p>
        </div>

        {/* Profile Card */}
        <div className="rounded-lg bg-white p-8 shadow-sm">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-800">ข้อมูลส่วนตัว</h2>
          </div>

          <div className="space-y-6">
            {/* Name */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                ชื่อ-นามสกุล
              </label>
              <p className="rounded-lg border-2 border-gray-200 bg-gray-50 px-4 py-3 text-gray-900">
                {userData?.name || "-"}
              </p>
            </div>

            {/* Nickname */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                ชื่อเล่น
              </label>
              <p className="rounded-lg border-2 border-gray-200 bg-gray-50 px-4 py-3 text-gray-900">
                {userData?.nickname || "-"}
              </p>
            </div>

            {/* Phone Number */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                หมายเลขโทรศัพท์
              </label>
              <p className="rounded-lg border-2 border-gray-200 bg-gray-50 px-4 py-3 text-gray-900">
                {userData?.phone_number || "-"}
              </p>
            </div>

            {/* Role (Read-only) */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                ประเภทผู้ใช้
              </label>
              <p className="rounded-lg border-2 border-gray-200 bg-gray-50 px-4 py-3 text-gray-900">
                {userData?.role === "customer" ? "ลูกค้า" : userData?.role || "-"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
