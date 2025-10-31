"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AdminNavbar from "@/components/AdminNavbar";
import { useAuth } from "@/hooks/useAuth";
import { getAllStaffs } from "@/api/staffs/GET";
import { createStaff } from "@/api/staffs/POST";

interface Staff {
  id: number;
  name: string;
  nickname: string;
  phone_number: string;
  role: string;
}

export default function AdminStaffsPage() {
  const router = useRouter();
  const { isAuthorized } = useAuth("admin");
  
  const [staffs, setStaffs] = useState<Staff[]>([]);
  const [filteredStaffs, setFilteredStaffs] = useState<Staff[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Form data for new staff
  const [newStaffForm, setNewStaffForm] = useState({
    name: "",
    nickname: "",
    phone_number: "",
    password: "",
    role: "cashier"
  });

  useEffect(() => {
    if (!isAuthorized) return;
    fetchStaffs();
  }, [isAuthorized]);

  const fetchStaffs = async () => {
    try {
      setLoading(true);
      const allStaffs = await getAllStaffs();
      setStaffs(allStaffs);
      setFilteredStaffs(allStaffs);
    } catch (error) {
      console.error("Error fetching staffs:", error);
    } finally {
      setLoading(false);
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "cashier":
        return "แคชเชียร์";
      case "laundryAttendant":
        return "พนักงานซัก";
      case "admin":
        return "ผู้ดูแลระบบ";
      default:
        return role;
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "cashier":
        return "bg-blue-100 text-blue-700";
      case "laundryAttendant":
        return "bg-green-100 text-green-700";
      case "admin":
        return "bg-purple-100 text-purple-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  useEffect(() => {
    let filtered = staffs;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (staff) =>
          staff.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          staff.nickname.toLowerCase().includes(searchTerm.toLowerCase()) ||
          staff.phone_number.includes(searchTerm)
      );
    }

    setFilteredStaffs(filtered);
  }, [searchTerm, staffs]);

  const handleOpenAddModal = () => {
    setNewStaffForm({
      name: "",
      nickname: "",
      phone_number: "",
      password: "",
      role: "cashier"
    });
    setIsAddModalOpen(true);
  };

  const handleCloseAddModal = () => {
    setIsAddModalOpen(false);
    setNewStaffForm({
      name: "",
      nickname: "",
      phone_number: "",
      password: "",
      role: "cashier"
    });
  };

  const handleInputChange = (field: string, value: string) => {
    setNewStaffForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddStaff = async () => {
    // Validate form
    if (!newStaffForm.name.trim() || !newStaffForm.nickname.trim() || 
        !newStaffForm.phone_number.trim() || !newStaffForm.password.trim()) {
      alert("กรุณากรอกข้อมูลให้ครบถ้วน");
      return;
    }

    try {
      setSaving(true);
      
      // Call API to create staff
      await createStaff({
        name: newStaffForm.name,
        nickname: newStaffForm.nickname,
        phone_number: newStaffForm.phone_number,
        password: newStaffForm.password,
        role: newStaffForm.role
      });
      
      // Refresh staff list
      await fetchStaffs();
      
      alert("เพิ่มพนักงานสำเร็จ");
      handleCloseAddModal();
    } catch (error) {
      console.error("Error adding staff:", error);
      alert("เกิดข้อผิดพลาดในการเพิ่มพนักงาน");
    } finally {
      setSaving(false);
    }
  };

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
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">พนักงานทั้งหมด</h1>
            <p className="mt-2 text-gray-600">จัดการข้อมูลพนักงานทั้งหมด</p>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={handleOpenAddModal}
              className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-[#FF971D] to-[#FF6B00] px-6 py-2.5 text-sm font-medium text-white shadow-lg transition hover:shadow-xl"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              เพิ่มพนักงาน
            </button>
          </div>
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
            พบ <span className="font-semibold text-gray-700">{filteredStaffs.length}</span> รายการจากทั้งหมด <span className="font-semibold text-gray-700">{staffs.length}</span> คน
          </p>
        </div>

        {/* Staffs Table */}
        <div className="space-y-3">
          {/* Table Header */}
          <div className="grid grid-cols-12 gap-4 rounded-lg bg-gradient-to-r from-[#FF971D] to-[#FF6B00] px-6 py-4 font-semibold text-white shadow-md">
            <div className="col-span-4">ชื่อ</div>
            <div className="col-span-2">ชื่อเล่น</div>
            <div className="col-span-2">หมายเลขโทรศัพท์</div>
            <div className="col-span-3">ตำแหน่ง</div>
          </div>

          {/* Table Rows */}
          {filteredStaffs.length > 0 ? (
            filteredStaffs.map((staff) => (
              <div
                key={staff.id}
                className="grid grid-cols-12 items-center gap-4 rounded-lg border-2 border-gray-200 bg-white px-6 py-4 shadow-sm transition hover:border-[#FF971D] hover:shadow-md"
              >
                <div className="col-span-4 font-medium text-gray-900">{staff.name}</div>
                <div className="col-span-2 text-gray-700">{staff.nickname}</div>
                <div className="col-span-2 text-gray-700">{staff.phone_number}</div>
                <div className="col-span-3">
                  <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${getRoleBadgeColor(staff.role)}`}>
                    {getRoleLabel(staff.role)}
                  </span>
                </div>
                <div className="col-span-1 text-right">
                  <button
                    onClick={() => router.push(`/admin/staffs/${staff.id}`)}
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              <p className="text-lg font-medium text-gray-700">
                {searchTerm ? "ไม่พบพนักงานที่ตรงกับเงื่อนไขการค้นหา" : "ยังไม่มีข้อมูลพนักงาน"}
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

      {/* Add Staff Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-500 bg-opacity-75 p-4">
          <div className="w-full max-w-2xl rounded-lg bg-white shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-gray-200 bg-gradient-to-r from-[#FF971D] to-[#FF6B00] px-6 py-4 rounded-t-lg">
              <h3 className="text-xl font-semibold text-white">เพิ่มพนักงานใหม่</h3>
              <button
                onClick={handleCloseAddModal}
                disabled={saving}
                className="text-white hover:text-gray-200 transition disabled:opacity-50"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              {/* Name */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  ชื่อ-นามสกุล <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newStaffForm.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  className="w-full rounded-lg border-2 border-gray-300 px-4 py-3 text-gray-900 focus:border-[#FF971D] focus:outline-none focus:ring-2 focus:ring-[#FF971D]/20"
                  placeholder="กรอกชื่อ-นามสกุล"
                  disabled={saving}
                />
              </div>

              {/* Nickname */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  ชื่อเล่น <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newStaffForm.nickname}
                  onChange={(e) => handleInputChange("nickname", e.target.value)}
                  className="w-full rounded-lg border-2 border-gray-300 px-4 py-3 text-gray-900 focus:border-[#FF971D] focus:outline-none focus:ring-2 focus:ring-[#FF971D]/20"
                  placeholder="กรอกชื่อเล่น"
                  disabled={saving}
                />
              </div>

              {/* Phone Number */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  หมายเลขโทรศัพท์ <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  value={newStaffForm.phone_number}
                  onChange={(e) => handleInputChange("phone_number", e.target.value)}
                  className="w-full rounded-lg border-2 border-gray-300 px-4 py-3 text-gray-900 focus:border-[#FF971D] focus:outline-none focus:ring-2 focus:ring-[#FF971D]/20"
                  placeholder="กรอกหมายเลขโทรศัพท์"
                  disabled={saving}
                />
              </div>

              {/* Password */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  รหัสผ่าน <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  value={newStaffForm.password}
                  onChange={(e) => handleInputChange("password", e.target.value)}
                  className="w-full rounded-lg border-2 border-gray-300 px-4 py-3 text-gray-900 focus:border-[#FF971D] focus:outline-none focus:ring-2 focus:ring-[#FF971D]/20"
                  placeholder="กรอกรหัสผ่าน"
                  disabled={saving}
                />
                <p className="mt-1 text-xs text-gray-500">
                  ใช้สำหรับเข้าสู่ระบบ (ควรมีความยาวอย่างน้อย 6 ตัวอักษร)
                </p>
              </div>

              {/* Role */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  ตำแหน่ง <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    value={newStaffForm.role}
                    onChange={(e) => handleInputChange("role", e.target.value)}
                    className="w-full appearance-none rounded-lg border-2 border-gray-300 bg-white px-4 py-3 pr-10 text-gray-900 focus:border-[#FF971D] focus:outline-none focus:ring-2 focus:ring-[#FF971D]/20"
                    disabled={saving}
                  >
                    <option value="cashier">แคชเชียร์</option>
                    <option value="laundryAttendant">พนักงานซัก</option>
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

              {/* Info */}
              <div className="rounded-lg bg-blue-50 border-2 border-blue-200 p-4">
                <div className="flex gap-3">
                  <svg className="h-6 w-6 flex-shrink-0 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p className="text-sm font-medium text-blue-800">หมายเหตุ</p>
                    <p className="mt-1 text-sm text-blue-700">
                      กรุณากรอกข้อมูลให้ครบถ้วน ตำแหน่งงานจะกำหนดสิทธิ์การเข้าถึงระบบของพนักงาน
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex gap-3 border-t border-gray-200 bg-gray-50 px-6 py-4 rounded-b-lg">
              <button
                onClick={handleCloseAddModal}
                disabled={saving}
                className="flex-1 rounded-lg border-2 border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleAddStaff}
                disabled={saving}
                className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-green-500 to-green-600 px-4 py-2.5 text-sm font-medium text-white shadow-lg transition hover:shadow-xl disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                    กำลังบันทึก...
                  </>
                ) : (
                  <>
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    บันทึก
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
