"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import StaffNavbar from "@/components/StaffNavbar";
import { useAuth } from "@/hooks/useAuth";
import { getCustomers } from "@/api/customers/GET";
import { getClothes } from "@/api/clothes/GET";
import { getCoupons } from "@/api/coupons/GET";
import { getUserCoupons } from "@/api/user_coupon/GET";
import { createUserCoupon } from "@/api/user_coupon/POST";
import { updateUserCoupon } from "@/api/user_coupon/PUT";
import { createOrder } from "@/api/orders/POST";
import { createClothList } from "@/api/cloth_lists/POST";
import { customerResponse } from "@/interface/customers";
import { UserCoupon } from "@/interface/userCoupon";
import { CouponResponse } from "@/interface/coupons";

interface ClothType {
  id: string;
  name: string;
  price: number;
  category: string;
}

interface OrderItem {
  cloth_type_id: string;
  cloth_type_name: string;
  quantity: number;
  price_per_item: number;
}

export default function StaffCreateOrderPage() {
  const router = useRouter();
  const { isAuthorized } = useAuth(["cashier", "laundryAttendant"]);
  
  const [customers, setCustomers] = useState<customerResponse[]>([]);
  const [clothTypes, setClothTypes] = useState<ClothType[]>([]);
  const [availableCoupons, setAvailableCoupons] = useState<CouponResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showCouponModal, setShowCouponModal] = useState(false);
  const [userCoupons, setUserCoupons] = useState<UserCoupon[]>([]);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>("");
  const [selectedCoupon, setSelectedCoupon] = useState<string>("");
  
  // Form states
  const [selectedCustomer, setSelectedCustomer] = useState<number | null>(null);
  const [customerSearchTerm, setCustomerSearchTerm] = useState("");
  const [showCustomerList, setShowCustomerList] = useState(false);
  const [serviceType, setServiceType] = useState("");
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);

  useEffect(() => {
    if (!isAuthorized) return;
    fetchCustomers();
    fetchClothTypes();
    fetchCoupons();
  }, [isAuthorized]);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const data = await getCustomers();
      setCustomers(data);
    } catch (error) {
      console.error("Error fetching customers:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCoupons = async () => {
    try {
      const data = await getCoupons();
      setAvailableCoupons(data);
    } catch (error) {
      console.error("Error fetching coupons:", error);
    }
  };

  const fetchClothTypes = async () => {
    try {
      const clothesData = await getClothes();
      
      // แปลง ClothResponse เป็น ClothType
      const convertedClothTypes: ClothType[] = clothesData.map(cloth => ({
        id: cloth.id,
        name: cloth.cloth_name,
        price: cloth.cloth_price,
        category: cloth.category
      }));
      
      setClothTypes(convertedClothTypes);
      
      // Initialize order items with all cloth types
      const initialItems: OrderItem[] = convertedClothTypes.map(cloth => ({
        cloth_type_id: cloth.id,
        cloth_type_name: cloth.name,
        quantity: 0,
        price_per_item: cloth.price
      }));
      setOrderItems(initialItems);
    } catch (error) {
      console.error("Error fetching cloth types:", error);
    }
  };

  const filteredCustomers = customers.filter((customer) =>
    customer.name.toLowerCase().includes(customerSearchTerm.toLowerCase()) ||
    customer.nickname.toLowerCase().includes(customerSearchTerm.toLowerCase()) ||
    customer.phone_number.includes(customerSearchTerm)
  );

  const selectedCustomerData = customers.find(c => c.id === selectedCustomer);

  const updateOrderItemQuantity = (index: number, quantity: number) => {
    const updated = [...orderItems];
    updated[index] = { ...updated[index], quantity: Math.max(0, quantity) };
    setOrderItems(updated);
  };

  const calculateSubtotal = () => {
    return orderItems.reduce((sum, item) => {
      return sum + (item.quantity * item.price_per_item);
    }, 0);
  };

  const calculateTotal = () => {
    return calculateSubtotal();
  };

  const calculateTotalQuantity = () => {
    return orderItems.reduce((sum, item) => sum + item.quantity, 0);
  };

  const getItemsWithQuantity = () => {
    return orderItems.filter(item => item.quantity > 0);
  };

  // Filter items based on service type
  const getFilteredClothTypes = () => {
    if (!serviceType) return [];
    
    if (serviceType === "ซักแห้ง") {
      // ซักแห้ง แสดงเฉพาะ dry clean
      return clothTypes.filter(cloth => cloth.category.toLowerCase() === "dry clean");
    } else {
      // ซักอบรีด, ซักมือ, รีด แสดงเฉพาะ wash dry
      return clothTypes.filter(cloth => cloth.category.toLowerCase() === "wash dry");
    }
  };

  const filteredClothTypes = getFilteredClothTypes();

  const handleResetQuantities = () => {
    if (window.confirm("คุณต้องการรีเซ็ตจำนวนผ้าทั้งหมดใช่หรือไม่?")) {
      const resetItems = orderItems.map(item => ({
        ...item,
        quantity: 0
      }));
      setOrderItems(resetItems);
    }
  };

  const handleServiceTypeChange = (newServiceType: string) => {
    // ตรวจสอบว่าเปลี่ยนกลุ่มหรือไม่
    const oldCategory = serviceType === "ซักแห้ง" ? "dry clean" : "wash dry";
    const newCategory = newServiceType === "ซักแห้ง" ? "dry clean" : "wash dry";
    
    // ถ้ามีการเปลี่ยนกลุ่ม (wash dry <-> dry clean) และมีผ้าที่เลือกไว้
    if (serviceType && newServiceType !== serviceType && oldCategory !== newCategory && getItemsWithQuantity().length > 0) {
      if (window.confirm("การเปลี่ยนประเภทบริการจะล้างจำนวนผ้าที่เลือกไว้ทั้งหมด คุณต้องการดำเนินการต่อหรือไม่?")) {
        // รีเซ็ตจำนวนผ้าทั้งหมด
        const resetItems = orderItems.map(item => ({
          ...item,
          quantity: 0
        }));
        setOrderItems(resetItems);
        setServiceType(newServiceType);
      }
    } else {
      // ถ้าไม่มีผ้าที่เลือก หรือเป็นการเลือกครั้งแรก หรือเปลี่ยนภายในกลุ่มเดียวกัน ให้เปลี่ยนได้เลย
      setServiceType(newServiceType);
    }
  };

  // Group items by category
  const groupedItems = filteredClothTypes.reduce((acc, cloth) => {
    if (!acc[cloth.category]) {
      acc[cloth.category] = [];
    }
    const orderItem = orderItems.find(item => item.cloth_type_id === cloth.id);
    if (orderItem) {
      acc[cloth.category].push(orderItem);
    }
    return acc;
  }, {} as Record<string, OrderItem[]>);

  const handleProceedToConfirm = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!selectedCustomer) {
      alert("กรุณาเลือกลูกค้า");
      return;
    }

    if (!serviceType) {
      alert("กรุณาเลือกประเภทบริการ");
      return;
    }

    const itemsWithQuantity = getItemsWithQuantity();
    if (itemsWithQuantity.length === 0) {
      alert("กรุณาเลือกรายการผ้าอย่างน้อย 1 รายการ");
      return;
    }

    // รีเซ็ตการเลือกวิธีชำระเงิน
    setSelectedPaymentMethod("");
    setShowConfirmation(true);
  };

  const handlePaymentMethodSelect = async (method: string) => {
    setSelectedPaymentMethod(method);
    
    if (method === "coupon") {
      // ตรวจสอบคูปองของลูกค้า
      try {
        const coupons = await getUserCoupons(selectedCustomer!.toString());
        setUserCoupons(coupons);
        
        // แปลง service type เป็นชื่อคูปองที่ต้องการ
        let requiredCouponName = "";
        if (serviceType === "ซักอบรีด") {
          requiredCouponName = "machine";
        } else if (serviceType === "รีด") {
          requiredCouponName = "iron";
        } else if (serviceType === "ซักมือ") {
          requiredCouponName = "handwash";
        }

        // ตรวจสอบว่ามีคูปองที่ยังไม่หมดอายุ, มี point เหลือ, และตรงกับ service type
        const validCoupon = coupons.find(coupon => {
          const isValid = new Date(coupon.expire_date) > new Date() && coupon.point_left > 0;
          const matchService = coupon.coupons.cp_name.toLowerCase() === requiredCouponName.toLowerCase();
          return isValid && matchService;
        });

        if (!validCoupon) {
          // ไม่มีคูปองที่ใช้ได้ แสดง modal เพิ่มคูปอง
          setShowCouponModal(true);
        } else {
          // ตรวจสอบว่า point เพียงพอหรือไม่
          const totalClothItems = calculateTotalQuantity();
          if (validCoupon.point_left < totalClothItems) {
            alert(`คูปองมี point เหลือไม่เพียงพอ (มี ${validCoupon.point_left} point ต้องการ ${totalClothItems} point)`);
            setShowCouponModal(true);
          } else {
            // มีคูปองที่ใช้ได้และ point เพียงพอ ดำเนินการสร้าง order
            handleSubmitWithCoupon(validCoupon);
          }
        }
      } catch (error) {
        console.error("Error fetching user coupons:", error);
        alert("เกิดข้อผิดพลาดในการตรวจสอบคูปอง");
      }
    } else if (method === "cash") {
      // ชำระด้วยเงินสด
      handleSubmitWithCash();
    }
  };

  const handleSubmitWithCash = async () => {
    try {
      setSaving(true);

      const itemsWithQuantity = getItemsWithQuantity();
      
      // สร้าง order ก่อน (ส่งเฉพาะข้อมูลที่จำเป็น)
      const orderData = {
        service_type: serviceType,
        order_status: "รอดำเนินการ",
        total_cloth: calculateTotalQuantity(),
        total_cost: Math.round(calculateTotal()), // แปลงเป็น int
        payment_method: "Cash",
        user_id: selectedCustomer // ส่ง user_id อย่างเดียว
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const createdOrder = await createOrder(orderData as any);

      // สร้าง cloth_lists ทีละรายการ
      for (const item of itemsWithQuantity) {
        await createClothList({
          quantity: item.quantity,
          sub_total_cost: Math.round(item.quantity * item.price_per_item),
          order_id: createdOrder.id,
          cloth_id: item.cloth_type_id
        });
      }

      alert("สร้างคำสั่งซื้อสำเร็จ");
      router.push("/staff");
    } catch (error) {
      console.error("Error creating order:", error);
      alert("เกิดข้อผิดพลาดในการสร้างคำสั่งซื้อ");
    } finally {
      setSaving(false);
    }
  };

  const handleSubmitWithCoupon = async (validCoupon: UserCoupon) => {
    try {
      setSaving(true);

      const itemsWithQuantity = getItemsWithQuantity();
      const totalClothItems = calculateTotalQuantity();
      
      // สร้าง order ก่อน
      const orderData = {
        service_type: serviceType,
        order_status: "รอดำเนินการ",
        total_cloth: totalClothItems,
        total_cost: Math.round(calculateTotal()),
        payment_method: "Coupon",
        user_id: selectedCustomer
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const createdOrder = await createOrder(orderData as any);

      // สร้าง cloth_lists ทีละรายการ
      for (const item of itemsWithQuantity) {
        await createClothList({
          quantity: item.quantity,
          sub_total_cost: Math.round(item.quantity * item.price_per_item),
          order_id: createdOrder.id,
          cloth_id: item.cloth_type_id
        });
      }

      // หัก point_left ตามจำนวนผ้าทั้งหมด
      const updatedPointLeft = validCoupon.point_left - totalClothItems;
      const updatedCoupon: UserCoupon = {
        ...validCoupon,
        point_left: updatedPointLeft
      };

      // อัพเดท user coupon
      await updateUserCoupon(validCoupon.id, updatedCoupon);

      alert(`สร้างคำสั่งซื้อสำเร็จ (ชำระด้วยคูปอง)\nใช้ ${totalClothItems} point (เหลือ ${updatedPointLeft} point)`);
      router.push("/staff");
    } catch (error) {
      console.error("Error creating order:", error);
      alert("เกิดข้อผิดพลาดในการสร้างคำสั่งซื้อ");
    } finally {
      setSaving(false);
    }
  };

  const handleAddCouponAndPay = async () => {
    try {
      if (!selectedCoupon) {
        alert("กรุณาเลือกคูปอง");
        return;
      }

      setSaving(true);

      // สร้างวันที่เริ่มต้นและหมดอายุ
      const startDate = new Date();
      const expireDate = new Date();
      expireDate.setMonth(expireDate.getMonth() + 1); // อายุ 1 เดือน

      const selectedCouponData = availableCoupons.find(c => c.id === selectedCoupon);
      const customerData = customers.find(c => c.id === selectedCustomer);

      // สร้าง user coupon ใหม่ (บังคับ 50 point)
      const newUserCoupon = {
        id: "",
        point_left: 50, // บังคับ 50 point
        start_date: startDate.toISOString(),
        expire_date: expireDate.toISOString(),
        user_id: selectedCustomer!.toString(),
        coupon_id: selectedCoupon,
        users: customerData!,
        coupons: selectedCouponData!
      };

      await createUserCoupon(newUserCoupon as UserCoupon);

      alert(`เพิ่มคูปองสำเร็จ (50 point)\nอายุ: ${startDate.toLocaleDateString('th-TH')} - ${expireDate.toLocaleDateString('th-TH')}`);
      
      setShowCouponModal(false);
      setSelectedCoupon("");
      setSaving(false);
      
      // ลองใช้คูปองใหม่ทันที
      handlePaymentMethodSelect("coupon");
    } catch (error) {
      console.error("Error adding coupon:", error);
      alert("เกิดข้อผิดพลาดในการเพิ่มคูปอง");
      setSaving(false);
    }
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

  // Confirmation Modal
  if (showConfirmation) {
    const itemsWithQuantity = getItemsWithQuantity();
    
    return (
      <div className="min-h-screen bg-gray-50">
        <StaffNavbar />
        
        <div className="mx-auto max-w-5xl px-4 py-8">
          <div className="mb-8">
            <button
              onClick={() => setShowConfirmation(false)}
              className="mb-4 flex items-center gap-2 text-sm text-gray-600 transition hover:text-[#FF971D]"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              กลับไปแก้ไข
            </button>
            <h1 className="text-3xl font-bold text-gray-800">ตรวจสอบคำสั่งซื้อ</h1>
            <p className="mt-2 text-gray-600">กรุณาตรวจสอบความถูกต้องก่อนยืนยัน</p>
          </div>

          <div className="space-y-6">
            {/* Customer Info */}
            <div className="rounded-lg bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-semibold text-gray-800 border-b border-gray-200 pb-3">
                ข้อมูลลูกค้า
              </h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-sm text-gray-600">ชื่อลูกค้า</p>
                  <p className="text-base font-medium text-gray-900">{selectedCustomerData?.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">เบอร์โทรศัพท์</p>
                  <p className="text-base font-medium text-gray-900">{selectedCustomerData?.phone_number}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">ชื่อเล่น</p>
                  <p className="text-base font-medium text-gray-900">{selectedCustomerData?.nickname}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">ประเภทบริการ</p>
                  <p className="text-base font-medium text-[#FF971D]">{serviceType}</p>
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div className="rounded-lg bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-semibold text-gray-800 border-b border-gray-200 pb-3">
                รายการผ้า ({itemsWithQuantity.length} รายการ)
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">รายการ</th>
                      <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">จำนวน</th>
                      <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">ราคา/ชิ้น</th>
                      <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">รวม</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {itemsWithQuantity.map((item, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-900">{item.cloth_type_name}</td>
                        <td className="px-4 py-3 text-center text-sm text-gray-900">{item.quantity}</td>
                        <td className="px-4 py-3 text-right text-sm text-gray-900">{item.price_per_item.toFixed(2)} ฿</td>
                        <td className="px-4 py-3 text-right text-sm font-medium text-gray-900">
                          {(item.quantity * item.price_per_item).toFixed(2)} ฿
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-50">
                    <tr>
                      <td colSpan={3} className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
                        ยอดรวมรายการผ้า:
                      </td>
                      <td className="px-4 py-3 text-right text-base font-bold text-gray-900">
                        {calculateSubtotal().toFixed(2)} ฿
                      </td>
                    </tr>
                    <tr>
                      <td colSpan={3} className="px-4 py-3 text-right text-lg font-bold text-gray-800">
                        ยอดรวมทั้งหมด:
                      </td>
                      <td className="px-4 py-3 text-right text-xl font-bold text-[#FF971D]">
                        {calculateTotal().toFixed(2)} ฿
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-4">
              <button
                onClick={() => setShowConfirmation(false)}
                className="w-full rounded-lg border-2 border-gray-300 bg-white px-6 py-3 text-base font-medium text-gray-700 transition hover:bg-gray-50"
              >
                แก้ไขคำสั่งซื้อ
              </button>
              
              {/* แสดงปุ่มตามประเภทบริการ */}
              {serviceType === "ซักแห้ง" ? (
                // ซักแห้ง - จ่ายเงินสดอย่างเดียว
                <button
                  onClick={() => handlePaymentMethodSelect("cash")}
                  disabled={saving}
                  className="w-full flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-green-500 to-green-600 px-6 py-3 text-base font-medium text-white shadow-lg transition hover:shadow-xl disabled:opacity-50"
                >
                  {saving && selectedPaymentMethod === "cash" ? (
                    <>
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                      กำลังสร้างคำสั่งซื้อ...
                    </>
                  ) : (
                    <>
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      ชำระเงินสด
                    </>
                  )}
                </button>
              ) : serviceType === "ซักอบรีด" ? (
                // ซักอบรีด - จ่ายได้ทั้งเงินสดและคูปอง
                <div className="flex gap-4">
                  <button
                    onClick={() => handlePaymentMethodSelect("cash")}
                    disabled={saving}
                    className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-green-500 to-green-600 px-6 py-3 text-base font-medium text-white shadow-lg transition hover:shadow-xl disabled:opacity-50"
                  >
                    {saving && selectedPaymentMethod === "cash" ? (
                      <>
                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                        กำลังสร้างคำสั่งซื้อ...
                      </>
                    ) : (
                      <>
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        ชำระเงินสด
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => handlePaymentMethodSelect("coupon")}
                    disabled={saving}
                    className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-3 text-base font-medium text-white shadow-lg transition hover:shadow-xl disabled:opacity-50"
                  >
                    {saving && selectedPaymentMethod === "coupon" ? (
                      <>
                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                        กำลังตรวจสอบ...
                      </>
                    ) : (
                      <>
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                        </svg>
                        ใช้คูปอง
                      </>
                    )}
                  </button>
                </div>
              ) : (
                // ซักมือและรีด - จ่ายด้วยคูปองอย่างเดียว
                <button
                  onClick={() => handlePaymentMethodSelect("coupon")}
                  disabled={saving}
                  className="w-full flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-3 text-base font-medium text-white shadow-lg transition hover:shadow-xl disabled:opacity-50"
                >
                  {saving && selectedPaymentMethod === "coupon" ? (
                    <>
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                      กำลังตรวจสอบ...
                    </>
                  ) : (
                    <>
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                      </svg>
                      ใช้คูปอง
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Add Coupon Modal - แสดงทับ Confirmation Page */}
        {showCouponModal && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[100] p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full my-8">
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 rounded-t-2xl">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-1">
                      เพิ่มคูปองให้ลูกค้า
                    </h2>
                    <p className="text-blue-100 text-sm">
                      กรุณาเลือกประเภทคูปองและระบุจำนวน point
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setShowCouponModal(false);
                      setSelectedPaymentMethod("");
                      setSelectedCoupon("");
                    }}
                    className="text-white hover:bg-white/20 rounded-lg p-2 transition"
                  >
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Modal Body */}
              <div className="p-6 max-h-[calc(100vh-12rem)] overflow-y-auto">
                {/* Customer Info */}
                <div className="mb-6 p-4 bg-blue-50 border-l-4 border-blue-500 rounded-lg">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-blue-600 font-medium mb-1">ลูกค้า</p>
                      <p className="text-base font-bold text-gray-900">{selectedCustomerData?.name}</p>
                      <p className="text-sm text-gray-600">({selectedCustomerData?.nickname})</p>
                    </div>
                    <div>
                      <p className="text-xs text-blue-600 font-medium mb-1">ประเภทบริการ</p>
                      <p className="text-base font-bold text-gray-900">{serviceType}</p>
                    </div>
                  </div>
                </div>

                {/* Coupon Selection */}
                <div className="mb-6">
                  <label className="block text-sm font-bold text-gray-800 mb-3">
                    เลือกประเภทคูปอง <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {availableCoupons.map((coupon) => {
                      // กรองคูปองตาม service type
                      let shouldShow = false;
                      if (serviceType === "ซักอบรีด" && coupon.cp_name.toLowerCase() === "machine") shouldShow = true;
                      if (serviceType === "รีด" && coupon.cp_name.toLowerCase() === "iron") shouldShow = true;
                      if (serviceType === "ซักมือ" && coupon.cp_name.toLowerCase() === "handwash") shouldShow = true;
                      
                      if (!shouldShow) return null;

                      const isSelected = selectedCoupon === coupon.id;
                      return (
                        <button
                          key={coupon.id}
                          type="button"
                          onClick={() => setSelectedCoupon(coupon.id)}
                          className={`relative p-6 rounded-xl border-2 transition-all duration-200 text-left ${
                            isSelected
                              ? "border-blue-500 bg-blue-50 shadow-lg scale-105"
                              : "border-gray-200 bg-white hover:border-blue-300 hover:shadow-md"
                          }`}
                        >
                          {isSelected && (
                            <div className="absolute top-3 right-3">
                              <div className="bg-blue-500 rounded-full p-1">
                                <svg className="h-4 w-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              </div>
                            </div>
                          )}
                          <div className="flex items-center gap-3 mb-3">
                            <div className={`p-3 rounded-lg ${isSelected ? "bg-blue-100" : "bg-purple-100"}`}>
                              <svg className={`h-6 w-6 ${isSelected ? "text-blue-600" : "text-purple-600"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                              </svg>
                            </div>
                            <div>
                              <h3 className="text-lg font-bold text-gray-900">{coupon.cp_name}</h3>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-600">มูลค่า</span>
                              <span className="text-xl font-bold text-purple-600">{coupon.cp_price} ฿</span>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Coupon Details */}
                {selectedCoupon && (
                  <div className="mb-6 p-6 bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl border border-purple-200">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <svg className="h-5 w-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      รายละเอียดคูปอง
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-white p-4 rounded-lg">
                        <p className="text-xs text-gray-600 mb-1">ชื่อคูปอง</p>
                        <p className="text-base font-bold text-gray-900">
                          {availableCoupons.find(c => c.id === selectedCoupon)?.cp_name}
                        </p>
                      </div>
                      <div className="bg-white p-4 rounded-lg">
                        <p className="text-xs text-gray-600 mb-1">มูลค่า</p>
                        <p className="text-base font-bold text-purple-600">
                          {availableCoupons.find(c => c.id === selectedCoupon)?.cp_price} ฿
                        </p>
                      </div>
                      <div className="bg-white p-4 rounded-lg">
                        <p className="text-xs text-gray-600 mb-1">วันที่ซื้อ</p>
                        <p className="text-base font-bold text-gray-900">
                          {new Date().toLocaleDateString('th-TH', { 
                            year: 'numeric', 
                            month: 'short', 
                            day: 'numeric' 
                          })}
                        </p>
                      </div>
                      <div className="bg-white p-4 rounded-lg">
                        <p className="text-xs text-gray-600 mb-1">อายุคูปอง</p>
                        <p className="text-base font-bold text-green-600">1 เดือน</p>
                      </div>
                      <div className="bg-white p-4 rounded-lg col-span-2">
                        <p className="text-xs text-gray-600 mb-1">วันหมดอายุ</p>
                        <p className="text-base font-bold text-red-600">
                          {(() => {
                            const expireDate = new Date();
                            expireDate.setMonth(expireDate.getMonth() + 1);
                            return expireDate.toLocaleDateString('th-TH', { 
                              year: 'numeric', 
                              month: 'long', 
                              day: 'numeric' 
                            });
                          })()}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Points Display (Fixed at 50) */}
                <div className="mb-6">
                  <label className="block text-sm font-bold text-gray-800 mb-2">
                    จำนวน Point
                  </label>
                  <div className="w-full rounded-lg border-2 border-gray-300 bg-gray-50 px-4 py-3 text-center">
                    <span className="text-4xl font-bold text-blue-600">50</span>
                    <span className="text-xl font-semibold text-gray-600 ml-2">point</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    * คูปองมีค่าคงที่ 50 point (1 point = 1 ชิ้นผ้า)
                  </p>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="bg-gray-50 px-6 py-4 rounded-b-2xl flex gap-3">
                <button
                  onClick={() => {
                    setShowCouponModal(false);
                    setSelectedPaymentMethod("");
                    setSelectedCoupon("");
                  }}
                  disabled={saving}
                  className="flex-1 rounded-lg border-2 border-gray-300 bg-white px-6 py-3 text-base font-semibold text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
                >
                  ยกเลิก
                </button>
                <button
                  onClick={handleAddCouponAndPay}
                  disabled={saving || !selectedCoupon}
                  className="flex-1 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-3 text-base font-semibold text-white shadow-lg transition hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {saving ? (
                    <>
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                      กำลังเพิ่มคูปอง...
                    </>
                  ) : (
                    <>
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      เพิ่มคูปองและชำระเงิน
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

  return (
    <div className="min-h-screen bg-gray-50">
      <StaffNavbar />

      <div className="mx-auto max-w-7xl px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push("/staff")}
            className="mb-4 flex items-center gap-2 text-sm text-gray-600 transition hover:text-[#FF971D]"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            กลับไปหน้าคำสั่งซื้อ
          </button>
          <h1 className="text-3xl font-bold text-gray-800">สร้างคำสั่งซื้อใหม่</h1>
          <p className="mt-2 text-gray-600">เลือกลูกค้าและระบุจำนวนรายการผ้าที่ต้องการ</p>
        </div>

        <form onSubmit={handleProceedToConfirm}>
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Left Column - Order Form */}
            <div className="space-y-6 lg:col-span-2">
              {/* Customer Selection */}
              <div className="rounded-lg bg-white p-6 shadow-sm">
                <h2 className="mb-4 text-lg font-semibold text-gray-800 border-b border-gray-200 pb-3">
                  เลือกลูกค้า <span className="text-red-500">*</span>
                </h2>

                {/* Search Customer */}
                <div className="mb-4">
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    ค้นหาลูกค้า
                  </label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                      <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                    <input
                      type="text"
                      placeholder="ค้นหาด้วยชื่อ, ชื่อเล่น หรือเบอร์โทร..."
                      value={customerSearchTerm}
                      onChange={(e) => {
                        setCustomerSearchTerm(e.target.value);
                        setShowCustomerList(true);
                      }}
                      onFocus={() => setShowCustomerList(true)}
                      className="w-full rounded-lg border-2 border-gray-300 bg-white py-3 pl-11 pr-4 text-gray-900 shadow-sm outline-none transition focus:border-[#FF971D] focus:ring-2 focus:ring-[#FF971D]/20"
                    />
                  </div>
                </div>

                {/* Selected Customer Display */}
                {selectedCustomerData && (
                  <div className="mb-4 rounded-lg border-2 border-green-200 bg-green-50 p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500 text-white">
                          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                        <div>
                          <p className="font-medium text-green-800">{selectedCustomerData.name}</p>
                          <p className="text-sm text-green-600">
                            ({selectedCustomerData.nickname}) • {selectedCustomerData.phone_number}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedCustomer(null);
                          setCustomerSearchTerm("");
                        }}
                        className="text-green-600 hover:text-green-800"
                      >
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>
                )}

                {/* Customer List */}
                {showCustomerList && !selectedCustomer && customerSearchTerm && (
                  <div className="max-h-64 overflow-y-auto rounded-lg border-2 border-gray-200 bg-white">
                    {loading ? (
                      <div className="p-4 text-center text-gray-500">กำลังโหลด...</div>
                    ) : filteredCustomers.length > 0 ? (
                      <div className="divide-y divide-gray-200">
                        {filteredCustomers.map((customer) => (
                          <button
                            key={customer.id}
                            type="button"
                            onClick={() => {
                              setSelectedCustomer(customer.id);
                              setShowCustomerList(false);
                            }}
                            className="w-full p-4 text-left transition hover:bg-gray-50"
                          >
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200 text-gray-600">
                                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                              </div>
                              <div>
                                <p className="font-medium text-gray-800">{customer.name}</p>
                                <p className="text-sm text-gray-600">
                                  ({customer.nickname}) • {customer.phone_number}
                                </p>
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="p-4 text-center text-gray-500">ไม่พบลูกค้า</div>
                    )}
                  </div>
                )}
              </div>

              {/* Service Type */}
              <div className="rounded-lg bg-white p-6 shadow-sm">
                <h2 className="mb-4 text-lg font-semibold text-gray-800 border-b border-gray-200 pb-3">
                  ประเภทบริการ <span className="text-red-500">*</span>
                </h2>
                <div className="relative">
                  <select
                    value={serviceType}
                    onChange={(e) => handleServiceTypeChange(e.target.value)}
                    className="w-full appearance-none rounded-lg border-2 border-gray-300 bg-white px-4 py-3 pr-10 text-gray-900 focus:border-[#FF971D] focus:outline-none focus:ring-2 focus:ring-[#FF971D]/20"
                    required
                  >
                    <option value="">เลือกประเภทบริการ</option>
                    <option value="ซักอบรีด">ซักอบรีด</option>
                    <option value="ซักมือ">ซักมือ</option>
                    <option value="รีด">รีด</option>
                    <option value="ซักแห้ง">ซักแห้ง</option>
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

              {/* Order Items by Category */}
              <div className="rounded-lg bg-white p-6 shadow-sm">
                <div className="mb-4 flex items-center justify-between border-b border-gray-200 pb-3">
                  <h2 className="text-lg font-semibold text-gray-800">
                    เลือกรายการผ้า <span className="text-red-500">*</span>
                  </h2>
                  {serviceType && filteredClothTypes.length > 0 && getItemsWithQuantity().length > 0 && (
                    <button
                      type="button"
                      onClick={handleResetQuantities}
                      className="flex items-center gap-2 rounded-lg border border-red-300 bg-red-50 px-3 py-1.5 text-sm font-medium text-red-700 transition hover:bg-red-100"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      รีเซ็ตจำนวน
                    </button>
                  )}
                </div>
                
                {!serviceType ? (
                  <div className="text-center py-8">
                    <svg className="mx-auto h-12 w-12 text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-gray-500">กรุณาเลือกประเภทบริการก่อน</p>
                  </div>
                ) : filteredClothTypes.length === 0 ? (
                  <div className="text-center py-8">
                    <svg className="mx-auto h-12 w-12 text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                    </svg>
                    <p className="text-gray-500">ไม่มีรายการผ้าสำหรับประเภทบริการนี้</p>
                  </div>
                ) : (
                  <>
                    <p className="mb-4 text-sm text-gray-600">กรอกจำนวนสำหรับแต่ละประเภทผ้า (ใส่ 0 หรือเว้นว่างสำหรับรายการที่ไม่ต้องการ)</p>

                    <div className="space-y-6">
                  {Object.entries(groupedItems).map(([category, items]) => (
                    <div key={category}>
                      <h3 className="mb-3 text-base font-semibold text-gray-700 bg-gray-50 px-3 py-2 rounded">
                        {category}
                      </h3>
                      <div className="grid gap-3 sm:grid-cols-2">
                        {items.map((item) => {
                          const itemIndex = orderItems.findIndex(i => i.cloth_type_id === item.cloth_type_id);
                          return (
                            <div key={itemIndex} className="rounded-lg border border-gray-200 p-3 hover:border-[#FF971D] transition">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex-1">
                                  <p className="text-sm font-medium text-gray-900">{item.cloth_type_name}</p>
                                  <p className="text-xs text-gray-600">{item.price_per_item} ฿/ชิ้น</p>
                                </div>
                                <div className="flex items-center gap-2">
                                  <button
                                    type="button"
                                    onClick={() => updateOrderItemQuantity(itemIndex, item.quantity - 1)}
                                    className="flex h-8 w-8 items-center justify-center rounded border border-gray-300 text-gray-600 hover:bg-gray-50"
                                  >
                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                                    </svg>
                                  </button>
                                  <input
                                    type="number"
                                    min="0"
                                    value={item.quantity || ""}
                                    onChange={(e) => updateOrderItemQuantity(itemIndex, parseInt(e.target.value) || 0)}
                                    className="w-16 text-center rounded border border-gray-300 text-gray-600 py-1 text-sm focus:border-[#FF971D] focus:outline-none focus:ring-1 focus:ring-[#FF971D]"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => updateOrderItemQuantity(itemIndex, item.quantity + 1)}
                                    className="flex h-8 w-8 items-center justify-center rounded border border-gray-300 text-gray-600 hover:bg-gray-50"
                                  >
                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                    </svg>
                                  </button>
                                </div>
                              </div>
                              {item.quantity > 0 && (
                                <div className="text-right text-xs font-medium text-[#FF971D]">
                                  รวม: {(item.quantity * item.price_per_item).toFixed(2)} ฿
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Right Column - Summary */}
            <div className="space-y-6">
              {/* Order Summary */}
              <div className="rounded-lg bg-white p-6 shadow-sm sticky top-4">
                <h2 className="mb-4 text-lg font-semibold text-gray-800 border-b border-gray-200 pb-3">
                  สรุปคำสั่งซื้อ
                </h2>

                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-2">ลูกค้า</p>
                    {selectedCustomerData ? (
                      <p className="text-sm font-medium text-gray-900">{selectedCustomerData.name}</p>
                    ) : (
                      <p className="text-sm text-gray-400 italic">ยังไม่ได้เลือก</p>
                    )}
                  </div>

                  <div>
                    <p className="text-sm text-gray-600 mb-2">ประเภทบริการ</p>
                    {serviceType ? (
                      <p className="text-sm font-medium text-gray-900">{serviceType}</p>
                    ) : (
                      <p className="text-sm text-gray-400 italic">ยังไม่ได้เลือก</p>
                    )}
                  </div>

                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-600">รายการที่เลือก:</span>
                      <span className="font-medium text-gray-900">{getItemsWithQuantity().length} รายการ</span>
                    </div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-600">จำนวนชิ้นทั้งหมด:</span>
                      <span className="font-medium text-gray-900">{calculateTotalQuantity()} ชิ้น</span>
                    </div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-600">ยอดรวมรายการผ้า:</span>
                      <span className="font-medium text-gray-900">{calculateSubtotal().toFixed(2)} ฿</span>
                    </div>
                  </div>

                  <div className="border-t-2 border-gray-200 pt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold text-gray-800">ยอดรวมทั้งหมด</span>
                      <span className="text-2xl font-bold text-[#FF971D]">{calculateTotal().toFixed(2)} ฿</span>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  className="mt-6 w-full flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-[#FF971D] to-[#FF6B00] px-6 py-3 text-base font-medium text-white shadow-lg transition hover:shadow-xl"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  ตรวจสอบคำสั่งซื้อ
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
