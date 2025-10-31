"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function CashierNavbar() {
  const pathname = usePathname();

  const navItems = [
    { href: "/staff", label: "คำสั่งซื้อทั้งหมด" },
    { href: "/staff/customers", label: "รายชื่อลูกค้าทั้งหมด" },
    { href: "/staff/create", label: "สร้างคำสั่งซื้อ" },
  ];

  const isActive = (href: string) => {
    if (href === "/staff") {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  return (
    <nav className="border-b border-gray-200 bg-white shadow-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        {/* Logo */}
        <Link href="/staff" className="flex items-center gap-2">
          <div className="relative h-12 w-12">
            <Image
              src="/pp_laundry_logo.png"
              alt="PP Laundry Logo"
              width={48}
              height={48}
              className="object-contain"
            />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold leading-tight text-gray-800">P.P</span>
            <span className="text-lg font-bold leading-tight text-gray-800">LAUNDRY</span>
          </div>
        </Link>

        {/* Navigation Links */}
        <div className="flex items-center gap-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`rounded-full px-6 py-2.5 text-sm font-medium transition ${
                isActive(item.href)
                  ? "bg-[#FF971D] text-white shadow-md"
                  : "bg-white text-gray-700 hover:bg-gray-100"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </div>

        {/* Logout Button */}
        <button
          onClick={() => {
            localStorage.removeItem("auth_token");
            window.location.href = "/login";
          }}
          className="rounded-full bg-[#EF4444] px-6 py-2.5 text-sm font-medium text-white shadow-md transition hover:bg-[#DC2626]"
        >
          ออกจากระบบ
        </button>
      </div>
    </nav>
  );
}
