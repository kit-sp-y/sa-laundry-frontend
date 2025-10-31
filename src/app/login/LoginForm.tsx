"use client";

import { useState, type FormEvent } from "react";
import Image from "next/image";
import { login } from "@/api/auth/POST";

export default function LoginForm() {
  const [phone_number, setPhoneNumber] = useState(""); // เปลี่ยนจาก setEmail เป็น setPhoneNumber
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!phone_number || !password) {
      setError("กรุณากรอกหมายเลขโทรศัพท์และรหัสผ่าน");
      return;
    }

    const phoneOk = /^[0-9]{10}$/.test(phone_number);
    if (!phoneOk) {
      setError("รูปแบบหมายเลขโทรศัพท์ไม่ถูกต้อง");
      return;
    }

    setLoading(true);
    try {
      const data = await login(phone_number, password);
      // เก็บ token และ role ใน localStorage
      if (data && typeof data === 'object' && 'token' in data) {
        localStorage.setItem("auth_token", String(data.token));
        
        // เก็บ role
        if ('role' in data && data.role) {
          localStorage.setItem("user_role", String(data.role));
        } else if ('user' in data && data.user && 'role' in data.user) {
          localStorage.setItem("user_role", String(data.user.role));
        }
        
        // เก็บข้อมูล user
        if ('user' in data && data.user) {
          localStorage.setItem("user_data", JSON.stringify(data.user));
        }
      }

      // เปลี่ยนเส้นทางตาม role
      const userRole = data.role || (data.user && data.user.role);
      const userId = data.user?.id;

      switch (userRole) {
        case "customer":
          if (userId) {
            window.location.href = `/${userId}`;
          } else {
            console.error("Customer userId is undefined!");
            setError("ไม่สามารถระบุตัวตนผู้ใช้ได้");
          }
          break;
        case "admin":
          window.location.href = "/admin";
          break;
        case "cashier":
        case "laundryAttendant":
          window.location.href = "/staff";
          break;
        default:
          // ถ้าไม่มี role หรือ role ไม่ตรงกับที่กำหนด ให้ไปหน้าหลัก
          window.location.href = "/";
          break;
      }
    } catch (err: unknown) {
      let errorMsg = "เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์";
      
      if (err && typeof err === 'object') {
        if ('response' in err) {
          const response = err.response as { data?: { error?: string; message?: string } };
          errorMsg = response?.data?.error || response?.data?.message || errorMsg;
        } else if ('message' in err) {
          errorMsg = String(err.message);
        }
      }
      
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md border-4 border-[#0EA5E9] bg-white p-8 shadow-lg">
      {/* Logo */}
      <div className="mx-auto mb-4 flex w-32 justify-center">
        <Image src="/pp_laundry_logo.png" alt="PP Laundry Logo" width={120} height={120} />
      </div>
      
      {/* Title */}
      <h1 className="mb-6 text-center text-2xl font-bold text-gray-800">
        เข้าสู่ระบบ
      </h1>

      {error && (
        <div className="mb-4 rounded bg-red-50 border border-red-200 px-4 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-5">
        {/* Phone Number Field */}
        <div>
          <label htmlFor="phone_number" className="mb-2 block text-sm text-gray-700">
            กรอกหมายเลขโทรศัพท์
          </label>
          <input
            id="phone_number"
            type="tel"
            autoComplete="tel"
            value={phone_number}
            onChange={(e) => setPhoneNumber(e.target.value)}
            className="block w-full rounded-lg border-2 border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none transition focus:border-[#0EA5E9] focus:ring-2 focus:ring-[#0EA5E9]/20"
            placeholder=""
          />
        </div>

        {/* Password Field */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <label htmlFor="password" className="block text-sm text-gray-700">
              กรอกรหัสผ่าน
            </label>
          </div>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="block w-full rounded-lg border-2 border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none transition focus:border-[#0EA5E9] focus:ring-2 focus:ring-[#0EA5E9]/20"
            placeholder=""
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full bg-[#FF971D] px-6 py-3 font-semibold text-white shadow-md transition hover:bg-[#e68619] disabled:opacity-60 disabled:hover:bg-[#FF971D] focus:outline-none focus:ring-2 focus:ring-[#FF971D]/50"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
              </svg>
              กำลังเข้าสู่ระบบ...
            </span>
          ) : (
            "เข้าสู่ระบบ"
          )}
        </button>
      </form>
    </div>
  );
}
