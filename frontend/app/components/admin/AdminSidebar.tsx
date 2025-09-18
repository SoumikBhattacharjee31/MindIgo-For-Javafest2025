"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const AdminSidebar = () => {
  const path = usePathname();

  const menuItems = [
    { name: "Dashboard", href: "/admin/dashboard", icon: "📊" },
    { name: "Applications", href: "/admin/applications", icon: "📋" },
    { name: "Quiz Management", href: "/admin/quiz-management", icon: "🧠" },
  ];

  return (
    <aside className="w-64 bg-white shadow-md">
      <div className="p-6 text-xl font-bold text-purple-700">Admin Panel</div>
      <nav className="mt-6">
        {menuItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center px-6 py-3 text-gray-700 hover:bg-purple-100 transition ${
              path === item.href
                ? "bg-purple-200 border-r-4 border-purple-600"
                : ""
            }`}
          >
            <span className="mr-3">{item.icon}</span>
            {item.name}
          </Link>
        ))}
      </nav>
    </aside>
  );
};

export default AdminSidebar;
