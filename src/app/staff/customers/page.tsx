"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import StaffNavbar from "@/components/StaffNavbar";
import { useAuth } from "@/hooks/useAuth";
import { getCustomers } from "@/api/customers/GET";
import { createCustomer, CreateCustomerData } from "@/api/customers/POST";

interface Customer {
  id: number;
  name: string;
  nickname: string;
  phone_number: string;
}

export default function StaffCustomersPage() {
  const router = useRouter();
  const { isAuthorized } = useAuth(["cashier", "laundryAttendant"]);
  
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<CreateCustomerData>({
    name: "",
    nickname: "",
    phone_number: "",
    password: "",
    role: "customer"
  });

  useEffect(() => {
    if (!isAuthorized) return;
    fetchCustomers();
  }, [isAuthorized]);

  const fetchCustomers = async () => {
      try {
        setLoading(true);
        const data = await getCustomers();
  
        setCustomers(data);
        setFilteredCustomers(data);
      } catch (error) {
        console.error("Error fetching customers:", error);
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    let filtered = customers;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (customer) =>
          customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          customer.nickname.toLowerCase().includes(searchTerm.toLowerCase()) ||
          customer.phone_number.includes(searchTerm)
      );
    }

    setFilteredCustomers(filtered);
  }, [searchTerm, customers]);

  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.nickname || !formData.phone_number || !formData.password) {
      alert("กรุณากรอกข้อมูลให้ครบถ้วน");
      return;
    }

    try {
      setSaving(true);
      console.log("Creating customer with data:", formData);
      
      const result = await createCustomer(formData);
      console.log("Customer created successfully:", result);
      
      // Reset form
      setFormData({
        name: "",
        nickname: "",
        phone_number: "",
        password: "",
        role: "customer"
      });
      
      // Close modal
      setShowCreateModal(false);
      
      // Refresh customer list
      await fetchCustomers();
      
      alert("สร้างบัญชีลูกค้าสำเร็จ");
    } catch (error) {
      console.error("Error creating customer:", error);
      
      // Type-safe error handling
      const axiosError = error && typeof error === 'object' && 'response' in error 
        ? error as { response?: { data?: { error?: string }; status?: number }; message?: string }
        : null;
      
      if (axiosError) {
        console.error("Error details:", {
          message: axiosError.message,
          response: axiosError.response?.data,
          status: axiosError.response?.status
        });
      }
      
      // Check if it's a duplicate phone number error
      if (axiosError?.response?.status === 409 || 
          (axiosError?.response?.data?.error && 
           (axiosError.response.data.error.includes("duplicate") || 
            axiosError.response.data.error.includes("ซ้ำ") ||
            axiosError.response.data.error.includes("unique")))) {
        alert("หมายเลขโทรศัพท์นี้ถูกใช้งานแล้ว");
        return;
      }
      
      if (axiosError?.response?.status === 400) {
        alert("ข้อมูลไม่ถูกต้อง กรุณาตรวจสอบและลองใหม่อีกครั้ง");
        return;
      }
      
      // For other errors, try to refresh and see if customer was actually created
      try {
        const beforeCount = customers.length;
        await fetchCustomers();
        
        // Check if a new customer was added
        // We'll fetch again to get the updated count
        const afterResponse = await getCustomers();
        
        if (afterResponse.length > beforeCount) {
          // Customer was created successfully despite the error
          console.log("Customer was created successfully despite error response");
          
          // Reset form and close modal
          setFormData({
            name: "",
            nickname: "",
            phone_number: "",
            password: "",
            role: "customer"
          });
          setShowCreateModal(false);
          
          alert("สร้างบัญชีลูกค้าสำเร็จ");
        } else {
          alert("เกิดข้อผิดพลาดในการสร้างบัญชีลูกค้า กรุณาลองใหม่อีกครั้ง");
        }
      } catch (refreshError) {
        console.error("Error refreshing customer list:", refreshError);
        alert("เกิดข้อผิดพลาดในการสร้างบัญชีลูกค้า กรุณาลองใหม่อีกครั้ง");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: keyof CreateCustomerData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-gray-50">
        <StaffNavbar />
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
      <StaffNavbar />

      <div className="mx-auto max-w-7xl px-4 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">ลูกค้าทั้งหมด</h1>
            <p className="mt-2 text-gray-600">ดูและจัดการข้อมูลลูกค้า</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-green-500 to-green-600 px-6 py-3 text-sm font-medium text-white shadow-lg transition hover:shadow-xl"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            สร้างบัญชีลูกค้า
          </button>
        </div>

        {/* Search Box */}
        <div className="mb-6">
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="ค้นหาด้วยชื่อ, ชื่อเล่น หรือเบอร์โทรศัพท์..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border-2 border-gray-300 bg-white py-3 pl-11 pr-4 text-gray-900 shadow-sm outline-none transition focus:border-[#FF971D] focus:ring-2 focus:ring-[#FF971D]/20"
            />
          </div>
          <p className="mt-2 text-sm text-gray-500">
            พบ <span className="font-semibold text-gray-700">{filteredCustomers.length}</span> รายการจากทั้งหมด <span className="font-semibold text-gray-700">{customers.length}</span> คน
          </p>
        </div>

        {/* Customers List */}
        {loading ? (
          <div className="rounded-lg bg-white p-12 text-center shadow-sm">
            <div className="mb-4 inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-[#FF971D] border-r-transparent"></div>
            <p className="text-gray-600">กำลังโหลดข้อมูล...</p>
          </div>
        ) : filteredCustomers.length === 0 ? (
          <div className="rounded-lg border-2 border-dashed border-gray-300 bg-white p-12 text-center shadow-sm">
            <svg className="mx-auto mb-4 h-16 w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <p className="text-lg font-medium text-gray-700">
              {searchTerm ? "ไม่พบลูกค้าที่ตรงกับเงื่อนไขการค้นหา" : "ยังไม่มีข้อมูลลูกค้า"}
            </p>
            {searchTerm && (
              <p className="mt-2 text-sm text-gray-500">
                ลองค้นหาด้วยคำอื่นหรือล้างคำค้นหา
              </p>
            )}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {filteredCustomers.map((customer) => (
              <div
                key={customer.id}
                className="group rounded-lg border-2 border-gray-200 bg-white p-6 shadow-sm transition hover:border-[#FF971D] hover:shadow-md"
              >
                {/* Customer Icon */}
                <div className="mb-4 flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-[#FF971D] to-[#FF6B00] text-white shadow-md">
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-800">{customer.name}</h3>
                    <p className="text-sm text-gray-500">({customer.nickname})</p>
                  </div>
                </div>

                {/* Customer Details */}
                <div className="mb-4 space-y-2 border-t border-gray-100 pt-4">
                  <div className="flex items-center gap-2 text-gray-700">
                    <svg className="h-5 w-5 flex-shrink-0 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <span className="text-sm">{customer.phone_number}</span>
                  </div>
                </div>

                {/* Action Button */}
                <button
                  onClick={() => router.push(`/staff/customers/${customer.id}`)}
                  className="w-full flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-[#FF971D] to-[#FF6B00] px-4 py-2.5 text-sm font-medium text-white shadow-md transition hover:shadow-lg"
                >
                  ดูรายละเอียด
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Customer Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl">
            {/* Modal Header */}
            <div className="mb-6 flex items-center justify-between border-b border-gray-200 pb-4">
              <h2 className="text-2xl font-bold text-gray-800">สร้างบัญชีลูกค้า</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="rounded-lg p-1 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleCreateCustomer} className="space-y-4">
              {/* Name */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  ชื่อ-นามสกุล <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  className="w-full rounded-lg border-2 border-gray-300 px-4 py-3 text-gray-900 focus:border-[#FF971D] focus:outline-none focus:ring-2 focus:ring-[#FF971D]/20"
                  placeholder="กรอกชื่อ-นามสกุล"
                  required
                />
              </div>

              {/* Nickname */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  ชื่อเล่น <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.nickname}
                  onChange={(e) => handleInputChange("nickname", e.target.value)}
                  className="w-full rounded-lg border-2 border-gray-300 px-4 py-3 text-gray-900 focus:border-[#FF971D] focus:outline-none focus:ring-2 focus:ring-[#FF971D]/20"
                  placeholder="กรอกชื่อเล่น"
                  required
                />
              </div>

              {/* Phone Number */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  หมายเลขโทรศัพท์ <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  value={formData.phone_number}
                  onChange={(e) => handleInputChange("phone_number", e.target.value)}
                  className="w-full rounded-lg border-2 border-gray-300 px-4 py-3 text-gray-900 focus:border-[#FF971D] focus:outline-none focus:ring-2 focus:ring-[#FF971D]/20"
                  placeholder="กรอกหมายเลขโทรศัพท์"
                  required
                />
              </div>

              {/* Password */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  รหัสผ่าน <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleInputChange("password", e.target.value)}
                  className="w-full rounded-lg border-2 border-gray-300 px-4 py-3 text-gray-900 focus:border-[#FF971D] focus:outline-none focus:ring-2 focus:ring-[#FF971D]/20"
                  placeholder="กรอกรหัสผ่าน"
                  required
                />
              </div>

              {/* Info Note */}
              <div className="rounded-lg bg-blue-50 border-2 border-blue-200 p-4">
                <div className="flex gap-3">
                  <svg className="h-5 w-5 flex-shrink-0 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-sm text-blue-800">
                    หมายเลขโทรศัพท์จะใช้สำหรับเข้าสู่ระบบ
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  disabled={saving}
                  className="flex-1 rounded-lg border-2 border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-green-500 to-green-600 px-4 py-3 text-sm font-medium text-white shadow-lg transition hover:shadow-xl disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                      กำลังสร้าง...
                    </>
                  ) : (
                    <>
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      สร้างบัญชี
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
