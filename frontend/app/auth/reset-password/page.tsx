"use client";
import React, { useState } from "react";
import axios from "axios";
import { useRouter, useSearchParams } from "next/navigation";
import SubmitButton from "./components/SubmitButton";
import PasswordInputField from "./components/PasswordInputField";
import Heading from "./components/Heading";
import RePasswordInputField from "./components/RePasswordInputField";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { successToast, errorToast } from '@/util/toastHelper';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [repassword, setRepassword] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== repassword) {
      errorToast("Passwords do not match");
      return;
    }
    try {
      const response = await axios.post(`${API_BASE_URL}/api/v1/auth/reset-password`, {
        token: token,
        newPassword: password
      }, { withCredentials: true });

      if (response.status === 200) {
        // Show success toast and redirect as requested
        successToast("Reset Successful");
        router.push("/auth/sign-in");
      }
    } catch (error: any) {
      // Display a more specific error message from the API if available
      const errorMessage = error.response?.data?.message || 'Something went wrong. Please try again.';
      errorToast(errorMessage);
      console.error('There was an error:', error);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-forgot-password-background bg-cover bg-center">
      <div className="w-full max-w-md p-8 space-y-6 bg-opacity-70 bg-white shadow-lg rounded-lg">
        <Heading />
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <PasswordInputField setPassword={setPassword} />
          <RePasswordInputField setPassword={setRepassword} />
          <SubmitButton />
        </form>
      </div>
      <ToastContainer />
    </div>
  );
};

export default ResetPassword;