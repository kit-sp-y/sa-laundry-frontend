"use client";

import { useState, type FormEvent } from "react";
import Image from "next/image";

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
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phone_number,
          password,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.message || "เข้าสู่ระบบไม่สำเร็จ");
        return;
      }

      const data = await response.json();
      console.log("Login successful:", data);

      // ตัวอย่าง: เก็บ token ใน localStorage หรือ sessionStorage
      if (data.token) {
        localStorage.setItem("auth_token", data.token);
      }

      // เปลี่ยนเส้นทางไปยังหน้าอื่นหลังจากเข้าสู่ระบบสำเร็จ
      window.location.href = "/";
    } catch (err) {
      setError("เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-lg rounded-2xl border border-sky-100/60 bg-white/80 p-8 shadow-xl backdrop-blur-md dark:border-white/10 dark:bg-neutral-900/70">
      <div className="mx-auto mb-6 grid h-20 w-20 place-items-center rounded-xl bg-white text-sky-700 ring-1 ring-sky-200/70">
          <Image src="/pp_laundry_logo.png" alt="PP Laundry Logo" width={100} height={100}/>
      </div>
      <h1 className="mb-1 text-center text-2xl font-semibold tracking-tight text-neutral-900 dark:text-white">
        P.P. Laundry ยินดีต้อนรับ
      </h1>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/40 dark:text-red-300">
          {error}
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label htmlFor="phone_number" className="mb-1 block text-sm font-medium text-neutral-800 dark:text-neutral-200">
            หมายเลขโทรศัพท์
          </label>
          <input
            id="phone_number"
            type="tel"
            autoComplete="tel"
            value={phone_number}
            onChange={(e) => setPhoneNumber(e.target.value)} // เปลี่ยนจาก setEmail เป็น setPhoneNumber
            className="block w-full rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-neutral-900 shadow-sm outline-none ring-0 placeholder:text-neutral-400 focus:border-sky-300 focus:ring-2 focus:ring-sky-200 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white dark:placeholder:text-neutral-500 dark:focus:border-sky-700 dark:focus:ring-sky-900"
            placeholder="กรอกหมายเลขโทรศัพท์"
          />
        </div>
        <div>
          <div className="mb-1 flex items-center justify-between">
            <label htmlFor="password" className="block text-sm font-medium text-neutral-800 dark:text-neutral-200">
              รหัสผ่าน
            </label>
            <a href="#" className="text-sm text-sky-600 hover:underline dark:text-sky-400">
              ลืมรหัสผ่าน?
            </a>
          </div>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="block w-full rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-neutral-900 shadow-sm outline-none ring-0 placeholder:text-neutral-400 focus:border-sky-300 focus:ring-2 focus:ring-sky-200 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white dark:placeholder:text-neutral-500 dark:focus:border-sky-700 dark:focus:ring-sky-900"
            placeholder="กรอกรหัสผ่าน"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#FF971D] px-4 py-2.5 text-white shadow-sm transition hover:bg-[#e68619] disabled:opacity-60 disabled:hover:bg-[#FF971D] focus:outline-none focus:ring-2 focus:ring-orange-300 dark:focus:ring-orange-800"
        >
          {loading ? (
            <>
              <svg className="size-5 animate-spin" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
              </svg>
              กำลังเข้าสู่ระบบ...
            </>
          ) : (
            <>เข้าสู่ระบบ</>
          )}
        </button>
      </form>
    </div>
  );
}
