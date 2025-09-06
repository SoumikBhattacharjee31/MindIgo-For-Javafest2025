"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { removeCookie } from "cookies-next";

const AdminNavbar = () => {
  const router = useRouter();

  const handleLogout = () => {
    removeCookie("authToken");
    router.push("/admin/login");
  };

  return (
    <header className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">
      <h1 className="text-xl font-semibold text-gray-800">Admin Portal</h1>
      <button
        onClick={handleLogout}
        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
      >
        Logout
      </button>
    </header>
  );
};

export default AdminNavbar;
