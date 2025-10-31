"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AdminNavbar from "@/components/AdminNavbar";
import { useAuth } from "@/hooks/useAuth";
import { get } from "axios";
import { getCustomers } from "@/api/customers/GET";

interface Customer {
  id: number;
  name: string;
  nickname: string;
  phone_number: string;
}

export default function AdminCustomersPage() {
  const router = useRouter();
  const { isAuthorized } = useAuth("admin");
  
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNavbar />

      <div className="mx-auto max-w-7xl px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">ลูกค้าทั้งหมด</h1>
          <p className="mt-2 text-gray-600">จัดการข้อมูลลูกค้าทั้งหมด</p>
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
            พบ {filteredCustomers.length} รายการจากทั้งหมด {customers.length} คน
          </p>
        </div>

        {/* Customers Table */}
        <div className="space-y-3">
          {/* Table Header */}
          <div className="grid grid-cols-12 gap-4 rounded-lg bg-gradient-to-r from-[#FF971D] to-[#FF6B00] px-6 py-4 font-semibold text-white shadow-md">
            <div className="col-span-5">ชื่อ</div>
            <div className="col-span-3">ชื่อเล่น</div>
            <div className="col-span-3">หมายเลขโทรศัพท์</div>
          </div>

          {/* Table Rows */}
          {filteredCustomers.length > 0 ? (
            filteredCustomers.map((customer) => (
              <div
                key={customer.id}
                className="grid grid-cols-12 items-center gap-4 rounded-lg border-2 border-gray-200 bg-white px-6 py-4 shadow-sm transition hover:border-[#FF971D] hover:shadow-md"
              >
                <div className="col-span-5 font-medium text-gray-900">{customer.name}</div>
                <div className="col-span-3 text-gray-700">{customer.nickname}</div>
                <div className="col-span-3 text-gray-700">{customer.phone_number}</div>
                <div className="col-span-1 text-right">
                  <button
                    onClick={() => router.push(`/admin/customers/${customer.id}`)}
                    className="rounded-lg bg-[#FF971D] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#e68619] hover:shadow-md"
                  >
                    เลือก
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-lg border-2 border-dashed border-gray-300 bg-white px-6 py-16 text-center shadow-sm">
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
          )}
        </div>
      </div>
    </div>
  );
}
