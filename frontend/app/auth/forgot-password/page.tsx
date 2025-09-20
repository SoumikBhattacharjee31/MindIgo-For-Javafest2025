"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import SubmitButton from "./components/SubmitButton";
import EmailInputField from "./components/EmailInputField";
import Heading from "./components/Heading";

import { ToastContainer} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {successToast, errorToast} from '@/util/toastHelper'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;


const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await axios.post(`${API_BASE_URL}/api/v1/auth/forgot-password`, {
        email: email,
      }, { withCredentials: true }); // Enable sending cookies with the request

      if (response.status === 200) {
          successToast(response.data);
          // Redirect to the password reset link page on success
          router.push("/auth/password-reset-link");
      } else {
        // This part is less likely to be reached as axios throws errors on non-2xx responses
        errorToast('Something went wrong');
        console.error('Non-200 response:', response.status);
      }
    } catch (error) {
      // Better to show a specific error from the API if available
      const errorMessage = 'Something went wrong';
      errorToast(errorMessage);
      console.error('There was an error:', error);
    }
  };


  return (
    <div className="flex items-center justify-center min-h-screen bg-forgot-password-background bg-cover bg-center">
      <div className="w-full max-w-md p-8 space-y-6 bg-opacity-70 bg-white shadow-lg rounded-lg">
        <Heading/>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <EmailInputField setEmailId={setEmail} />
          <SubmitButton />
        </form>
      </div>
      <ToastContainer/>
    </div>
  );
};

export default ForgotPassword;