"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export function useAuth(requiredRole?: string | string[]) {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    const role = localStorage.getItem("user_role");

    // ตรวจสอบว่า login หรือยัง
    if (!token) {
      console.log("No token, redirecting to /login");
      router.push("/login");
      return;
    }

    // ตรวจสอบ role ถ้ามีการกำหนด
    if (requiredRole) {
      const allowedRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
      console.log("allowedRoles:", allowedRoles);
      
      if (!role || !allowedRoles.includes(role)) {
        console.log("Role not authorized, redirecting...");
        // redirect ไปหน้าที่เหมาะสมตาม role
        if (role === "customer") {
          // ดึง user id จาก localStorage
          const userDataStr = localStorage.getItem("user_data");
          if (userDataStr) {
            const userData = JSON.parse(userDataStr);
            if (userData.id) {
              router.push(`/${userData.id}`);
              return;
            }
          }
          router.push("/login");
        } else if (role === "admin") {
          router.push("/admin");
        } else if (role === "cashier" || role === "laundryAttendant") {
          router.push("/staff");
        } else {
          router.push("/login");
        }
        return;
      }
    }

    // ถ้าผ่านการตรวจสอบทั้งหมด
    console.log("Authorized!");
    setIsAuthorized(true);
  }, [router, requiredRole]);

  return {
    isAuthorized,
    token: typeof window !== "undefined" ? localStorage.getItem("auth_token") : null,
    role: typeof window !== "undefined" ? localStorage.getItem("user_role") : null,
  };
}
