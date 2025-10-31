"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import AdminNavbar from "@/components/AdminNavbar";
import { useAuth } from "@/hooks/useAuth";
import { getStaffById } from "@/api/staffs/GET";
import { updateStaff, UpdateStaffData } from "@/api/staffs/PUT";
import { staffsResponse } from "@/interface/staffs";

export default function AdminStaffDetailPage() {
  const router = useRouter();
  const params = useParams();
  const staffId = params.id as string;
  const { isAuthorized } = useAuth("admin");
  
  const [staff, setStaff] = useState<staffsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Form state for editing
  const [formData, setFormData] = useState({
    name: "",
    nickname: "",
    phone_number: "",
    role: ""
  });

  useEffect(() => {
    if (!isAuthorized) return;
    
    const fetchStaffDetail = async () => {
      try {
        setLoading(true);
        const data = await getStaffById(staffId);
        setStaff(data);
        setFormData({
          name: data.name,
          nickname: data.nickname,
          phone_number: data.phone_number,
          role: data.role
        });
      } catch (error) {
        console.error("Error fetching staff detail:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchStaffDetail();
  }, [isAuthorized, staffId]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    if (staff) {
      setFormData({
        name: staff.name,
        nickname: staff.nickname,
        phone_number: staff.phone_number,
        role: staff.role
      });
    }
    setIsEditing(false);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      const updateData: UpdateStaffData = {
        name: formData.name,
        nickname: formData.nickname,
        phone_number: formData.phone_number,
        role: formData.role
      };
      
      console.log("Saving staff data:", updateData);
      await updateStaff(staffId, updateData);
      
      console.log("Fetching updated staff data...");
      // Fetch updated data from server
      const updatedStaff = await getStaffById(staffId);
      console.log("Updated staff received:", updatedStaff);
      
      // Update local state with fresh data from server
      setStaff(updatedStaff);
      setFormData({
        name: updatedStaff.name,
        nickname: updatedStaff.nickname,
        phone_number: updatedStaff.phone_number,
        role: updatedStaff.role
      });
      
      setIsEditing(false);
      alert("บันทึกข้อมูลสำเร็จ");
    } catch (error) {
      console.error("Error updating staff:", error);
      alert("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
      
      // Restore original data on error
      if (staff) {
        setFormData({
          name: staff.name,
          nickname: staff.nickname,
          phone_number: staff.phone_number,
          role: staff.role
        });
      }
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
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

  if (!isAuthorized || loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AdminNavbar />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="mb-4 inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-[#FF971D] border-r-transparent"></div>
            <p className="text-gray-600">กำลังโหลดข้อมูล...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!staff) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AdminNavbar />
        <div className="mx-auto max-w-4xl px-4 py-8">
          <div className="rounded-lg border-2 border-dashed border-gray-300 bg-white px-6 py-16 text-center">
            <p className="text-lg font-medium text-gray-700">ไม่พบข้อมูลพนักงาน</p>
            <button
              onClick={() => router.push("/admin/staffs")}
              className="mt-4 text-sm text-[#FF971D] hover:underline"
            >
              ← กลับไปหน้ารายการพนักงาน
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNavbar />

      <div className="mx-auto max-w-4xl px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push("/admin/staffs")}
            className="mb-4 flex items-center gap-2 text-sm text-gray-600 transition hover:text-[#FF971D]"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            กลับไปหน้ารายการพนักงาน
          </button>
          <h1 className="text-3xl font-bold text-gray-800">รายละเอียดพนักงาน</h1>
          <p className="mt-2 text-gray-600">ข้อมูลพนักงาน ID: {staffId}</p>
        </div>

        {/* Staff Information Card */}
        <div className="rounded-lg bg-white p-8 shadow-sm">
          <div className="mb-6 flex items-center justify-between border-b border-gray-200 pb-4">
            <h2 className="text-xl font-semibold text-gray-800">ข้อมูลส่วนตัว</h2>
            <div className="flex items-center gap-3">
              <div className={`rounded-full px-4 py-2 text-sm font-medium ${
                staff.role === "admin" 
                  ? "bg-purple-100 text-purple-700"
                  : staff.role === "cashier"
                  ? "bg-blue-100 text-blue-700"
                  : "bg-green-100 text-green-700"
              }`}>
                {getRoleLabel(staff.role)}
              </div>
              {!isEditing ? (
                <button
                  onClick={handleEdit}
                  className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-[#FF971D] to-[#FF6B00] px-4 py-2 text-sm font-medium text-white shadow-lg transition hover:shadow-xl"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  แก้ไข
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={handleCancel}
                    disabled={saving}
                    className="rounded-lg border-2 border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
                  >
                    ยกเลิก
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-green-500 to-green-600 px-4 py-2 text-sm font-medium text-white shadow-lg transition hover:shadow-xl disabled:opacity-50"
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
              )}
            </div>
          </div>

          <div className="space-y-6">
            {/* Name */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                ชื่อ-นามสกุล
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  className="w-full rounded-lg border-2 border-gray-300 px-4 py-3 text-gray-900 focus:border-[#FF971D] focus:outline-none focus:ring-2 focus:ring-[#FF971D]/20"
                  placeholder="กรอกชื่อ-นามสกุล"
                />
              ) : (
                <div className="rounded-lg border-2 border-gray-200 bg-gray-50 px-4 py-3">
                  <p className="text-gray-900">{staff.name}</p>
                </div>
              )}
            </div>

            {/* Nickname */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                ชื่อเล่น
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.nickname}
                  onChange={(e) => handleInputChange("nickname", e.target.value)}
                  className="w-full rounded-lg border-2 border-gray-300 px-4 py-3 text-gray-900 focus:border-[#FF971D] focus:outline-none focus:ring-2 focus:ring-[#FF971D]/20"
                  placeholder="กรอกชื่อเล่น"
                />
              ) : (
                <div className="rounded-lg border-2 border-gray-200 bg-gray-50 px-4 py-3">
                  <p className="text-gray-900">{staff.nickname}</p>
                </div>
              )}
            </div>

            {/* Phone Number */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                หมายเลขโทรศัพท์
              </label>
              {isEditing ? (
                <input
                  type="tel"
                  value={formData.phone_number}
                  onChange={(e) => handleInputChange("phone_number", e.target.value)}
                  className="w-full rounded-lg border-2 border-gray-300 px-4 py-3 text-gray-900 focus:border-[#FF971D] focus:outline-none focus:ring-2 focus:ring-[#FF971D]/20"
                  placeholder="กรอกหมายเลขโทรศัพท์"
                />
              ) : (
                <div className="rounded-lg border-2 border-gray-200 bg-gray-50 px-4 py-3">
                  <p className="text-gray-900">{staff.phone_number}</p>
                </div>
              )}
            </div>

            {/* Role */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                ตำแหน่ง
              </label>
              {isEditing ? (
                <div className="relative">
                  <select
                    value={formData.role}
                    onChange={(e) => handleInputChange("role", e.target.value)}
                    className="w-full appearance-none rounded-lg border-2 border-gray-300 bg-white px-4 py-3 pr-10 text-gray-900 focus:border-[#FF971D] focus:outline-none focus:ring-2 focus:ring-[#FF971D]/20"
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
              ) : (
                <div className="rounded-lg border-2 border-gray-200 bg-gray-50 px-4 py-3">
                  <p className="text-gray-900">{getRoleLabel(staff.role)}</p>
                </div>
              )}
            </div>
          </div>

          {/* Info Note */}
          {isEditing && (
            <div className="mt-8 rounded-lg bg-amber-50 border-2 border-amber-200 p-4">
              <div className="flex gap-3">
                <svg className="h-6 w-6 flex-shrink-0 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div>
                  <p className="text-sm font-medium text-amber-800">คำเตือน</p>
                  <p className="mt-1 text-sm text-amber-700">
                    กรุณาตรวจสอบข้อมูลให้ถูกต้องก่อนบันทึก การเปลี่ยนตำแหน่งงานจะมีผลต่อสิทธิ์การเข้าถึงระบบของพนักงานท่านนี้
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
