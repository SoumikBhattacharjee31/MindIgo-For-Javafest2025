"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { successToast, errorToast, warningToast } from "@/util/toastHelper";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate inputs
    if (!email || !password) {
      warningToast("Please fill in all fields");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/v1/auth/login`,
        {
          email,
          password,
        },
        {
          withCredentials: true,
        }
      );

      if (response.data.success) {
        const userRole = response.data.data.user.role;

        // Check if the user is an admin
        if (userRole === "ADMIN") {
          successToast("Logged in successfully");
          router.push("/admin/dashboard");
        } else {
          // Prevent non-admins from accessing the admin panel
          errorToast("Access denied. Not an admin account.");
        }
      } else {
        errorToast(response.data.message || "Login failed");
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          errorToast("Invalid email or password");
        } else if (error.response?.status === 403) {
          const { message, errorCode } = error.response.data;
          if (
            errorCode === "COUNSELOR_PENDING_APPROVAL" ||
            message.includes("pending admin approval")
          ) {
            errorToast("Your counselor account is pending admin approval");
            router.push("/counselor-status");
          } else if (
            errorCode === "EMAIL_NOT_VERIFIED" ||
            message.includes("Email not verified")
          ) {
            errorToast("Please verify your email before logging in");
            router.push("/sign-up-verification");
          } else if (
            errorCode === "COUNSELOR_REJECTED" ||
            message.includes("rejected")
          ) {
            errorToast(
              "Your counselor account has been rejected. Please contact support."
            );
          } else if (
            errorCode === "COUNSELOR_SUSPENDED" ||
            message.includes("suspended")
          ) {
            errorToast(
              "Your counselor account has been suspended. Please contact support."
            );
          } else {
            errorToast(message || "Account access denied");
          }
        } else if (error.response?.status === 429) {
          errorToast("Too many login attempts. Please try again later.");
        } else {
          errorToast("Login failed. Please try again.");
        }
      } else {
        errorToast("Network error. Please check your connection.");
      }
      console.error("Login error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-500 via-purple-700 to-indigo-600 flex items-center justify-center">
      <div className="bg-white p-10 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">
          Admin Login
        </h2>
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition disabled:opacity-50"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
