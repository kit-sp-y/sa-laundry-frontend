import axios from "axios";

// ตรวจสอบว่า NEXT_PUBLIC_API_BASE ถูกกำหนดใน .env.local
const API_BASE = process.env.NEXT_PUBLIC_API_BASE;
if (!API_BASE) {
  throw new Error("NEXT_PUBLIC_API_BASE is not defined in .env.local");
}

// สร้าง instance ของ axios
export const api = axios.create({
  baseURL: API_BASE, // ใช้ baseURL จาก .env.local
  withCredentials: true, // ส่งคุกกี้ไปกับคำขอ (ถ้าจำเป็น)
});

// เพิ่ม request interceptor เพื่อเพิ่ม Authorization header
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("auth_token"); // ดึงโทเค็นจาก localStorage
    if (token) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${token}`, // เพิ่มโทเค็นใน header
      };
    }
    return config;
  },
  (error) => {
    return Promise.reject(error); // จัดการข้อผิดพลาดใน request
  },
);

// เพิ่ม response interceptor เพื่อจัดการข้อผิดพลาด
api.interceptors.response.use(
  (response) => response, // ส่ง response กลับถ้าสำเร็จ
  (error) => {
    if (error.response?.status === 401) {
      // จัดการกรณีโทเค็นหมดอายุหรือไม่ได้รับอนุญาต
      console.error("Unauthorized! Please log in again.");
      localStorage.removeItem("auth_token"); // ลบโทเค็นที่หมดอายุ
      window.location.href = "/login"; // เปลี่ยนเส้นทางไปหน้า login
    }
    return Promise.reject(error); // ส่งข้อผิดพลาดกลับ
  },
);