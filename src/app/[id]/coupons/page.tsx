"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import CustomerNavbar from "@/components/CustomerNavbar";
import { useAuth } from "@/hooks/useAuth";
import { getUserCoupons } from "@/api/user_coupon/GET";
import { UserCoupon } from "@/interface/userCoupon";

export default function CustomerCouponsPage() {
  const router = useRouter();
  const params = useParams();
  const customerId = params.id as string;
  const { isAuthorized } = useAuth("customer");
  
  const [coupons, setCoupons] = useState<UserCoupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "available" | "unavailable">("all");

  useEffect(() => {
    if (!isAuthorized) {
      return;
    }

    // ตรวจสอบว่า id ตรงกับ user ที่ login หรือไม่
    const userDataStr = localStorage.getItem("user_data");
    if (userDataStr) {
      const userData = JSON.parse(userDataStr);
      if (userData.id && String(userData.id) !== String(customerId)) {
        router.replace(`/${userData.id}/coupons`);
        return;
      }
    }

    const fetchCoupons = async () => {
      try {
        setLoading(true);
        const data = await getUserCoupons(customerId);
        setCoupons(data);
      } catch (error) {
        console.error("Error fetching coupons:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCoupons();
  }, [isAuthorized, customerId, router]);

  const isExpired = (expireDate: string) => {
    if (!expireDate) return false;
    const date = new Date(expireDate);
    return !isNaN(date.getTime()) && date < new Date();
  };

  const isAvailable = (coupon: UserCoupon) => {
    return coupon.point_left > 0 && !isExpired(coupon.expire_date);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "ไม่ระบุ";
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "ไม่ระบุ";
    
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    
    const monthNames = [
      "ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.",
      "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."
    ];
    
    return `${day} ${monthNames[month - 1]} ${year + 543}`;
  };

  const filteredCoupons = coupons.filter((coupon) => {
    if (filter === "available") return isAvailable(coupon);
    if (filter === "unavailable") return !isAvailable(coupon);
    return true;
  });

  const getUnavailableReason = (coupon: UserCoupon) => {
    if (coupon.point_left <= 0 && isExpired(coupon.expire_date)) {
      return "Point หมด และหมดอายุ";
    }
    if (coupon.point_left <= 0) {
      return "Point หมด";
    }
    if (isExpired(coupon.expire_date)) {
      return "หมดอายุ";
    }
    return null;
  };

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

      <div className="mx-auto max-w-7xl px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800">คูปองของฉัน</h1>
          <p className="mt-2 text-gray-600">คูปองส่วนลดที่สามารถใช้ได้</p>
        </div>

        {/* Filter Tabs */}
        <div className="mb-6 flex gap-2">
          <button
            onClick={() => setFilter("all")}
            className={`rounded-lg px-6 py-2.5 text-sm font-medium transition ${
              filter === "all"
                ? "bg-[#FF971D] text-white shadow-md"
                : "bg-white text-gray-700 hover:bg-gray-100"
            }`}
          >
            ทั้งหมด
          </button>
          <button
            onClick={() => setFilter("available")}
            className={`rounded-lg px-6 py-2.5 text-sm font-medium transition ${
              filter === "available"
                ? "bg-[#FF971D] text-white shadow-md"
                : "bg-white text-gray-700 hover:bg-gray-100"
            }`}
          >
            ใช้ได้
          </button>
          <button
            onClick={() => setFilter("unavailable")}
            className={`rounded-lg px-6 py-2.5 text-sm font-medium transition ${
              filter === "unavailable"
                ? "bg-[#FF971D] text-white shadow-md"
                : "bg-white text-gray-700 hover:bg-gray-100"
            }`}
          >
            ใช้ไม่ได้
          </button>
        </div>

        {/* Coupons List */}
        {loading ? (
          <div className="rounded-lg bg-white p-8 text-center shadow-sm">
            <div className="mb-4 inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-[#FF971D] border-r-transparent"></div>
            <p className="text-gray-600">กำลังโหลดข้อมูล...</p>
          </div>
        ) : filteredCoupons.length === 0 ? (
          <div className="rounded-lg bg-white p-8 text-center shadow-sm">
            <p className="text-gray-500">ไม่พบคูปอง</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredCoupons.map((coupon) => {
              const available = isAvailable(coupon);
              const unavailableReason = getUnavailableReason(coupon);
              
              return (
                <div
                  key={coupon.id}
                  className={`relative rounded-lg border-2 bg-white p-6 shadow-sm transition ${
                    available
                      ? "border-[#FF971D] hover:shadow-md"
                      : "border-gray-300 opacity-70"
                  }`}
                >
                  {/* Status Badge */}
                  <div className="absolute right-4 top-4">
                    {available ? (
                      <span className="rounded-full bg-green-500 px-3 py-1 text-xs font-medium text-white">
                        ใช้ได้
                      </span>
                    ) : (
                      <span className="rounded-full bg-red-500 px-3 py-1 text-xs font-medium text-white">
                        ใช้ไม่ได้
                      </span>
                    )}
                  </div>

                  {/* Coupon Name */}
                  <div className="mb-4 rounded-lg bg-gradient-to-r from-[#FF971D] to-[#FF6B00] px-4 py-3">
                    <p className="text-center text-xl font-bold text-white">
                      {coupon.coupons.cp_name}
                    </p>
                  </div>

                  {/* Unavailable Reason */}
                  {unavailableReason && (
                    <div className="mb-4 rounded-lg bg-red-50 border-2 border-red-200 px-3 py-2">
                      <p className="text-center text-sm font-medium text-red-700">
                        {unavailableReason}
                      </p>
                    </div>
                  )}

                  {/* Details */}
                  <div className="space-y-2 border-t border-gray-200 pt-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Point คงเหลือ:</span>
                      <span className={`font-semibold ${coupon.point_left > 0 ? "text-green-600" : "text-red-600"}`}>
                        {coupon.point_left}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">เริ่มใช้:</span>
                      <span className="text-gray-800">
                        {formatDate(coupon.start_date)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">หมดอายุ:</span>
                      <span className={`font-medium ${isExpired(coupon.expire_date) ? "text-red-600" : "text-gray-800"}`}>
                        {formatDate(coupon.expire_date)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
