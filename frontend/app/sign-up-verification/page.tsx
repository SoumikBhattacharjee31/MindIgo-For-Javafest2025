"use client"
import React, { useState, useEffect, useRef } from "react";
import { useRouter } from 'next/navigation';
import axios from "axios";
import OtpInputField from "./components/OtpInputField";

import { ToastContainer } from 'react-toastify';
import { successToast, errorToast, warningToast, infoToast } from '../../util/toastHelper'
import 'react-toastify/dist/ReactToastify.css';

const length = 6;
const RESEND_OTP_TIMEOUT = 30; // 30 seconds (in seconds, not milliseconds)

const SignUpVerification = () => {
  const [otp, setOtp] = useState(Array(length).fill(''));
  const [isResendDisabled, setIsResendDisabled] = useState(false);
  const [resendTimeout, setResendTimeout] = useState(0);
  const router = useRouter();
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const initialRender = useRef(true);

  useEffect(() => {
    // Focus first input on initial render
    if (otpInputRefs.current[0]) {
      otpInputRefs.current[0]?.focus();
    }
  }, []);

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return; // Only allow digits
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    
    // Move to next input if a digit was entered
    if (value && index < length - 1) {
      otpInputRefs.current[index + 1]?.focus();
    }
    
    // Submit if last digit was entered
    if (value && index === length - 1) {
      handleOtpSubmit();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpSubmit = async () => {
    const otpValue = otp.join('');
    if (otpValue.length !== length) {
      warningToast('Please enter the full OTP');
      return;
    }
    
    try {
      const response = await axios.post(
        'http://localhost:8080/api/v1/auth/verify-otp', 
        { otp: otpValue },
        {
          withCredentials: true
        }
      );
      
      if (response.data.success) {
        successToast('OTP verified successfully');
        router.push("/dashboard");
      } else {
        warningToast(response.data.message || 'OTP verification failed');
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 400) {
          warningToast('Invalid OTP format');
        } else if (error.response?.status === 401) {
          warningToast('Invalid or expired OTP');
        } else {
          errorToast('Verification failed. Please try again.');
        }
      } else {
        errorToast('Network error. Please check your connection.');
      }
      console.error('OTP submission error:', error);
    }
  };

  const requestOtp = async () => {
    try {
      const response = await axios.post(
        'http://localhost:8080/api/v1/auth/request-otp', 
        {}, // Empty body as per backend
        {
          withCredentials: true
        }
      );
      
      if (response.data.success) {
        infoToast('New OTP sent to your email');
      } else {
        warningToast(response.data.message || 'Failed to send OTP');
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 429) {
          warningToast('Too many requests. Please try again later.');
        } else {
          errorToast('Failed to request OTP. Please try again.');
        }
      } else {
        errorToast('Network error. Please check your connection.');
      }
      console.error('OTP request error:', error);
    }
  };

  const handleResendOtp = async () => {
    setIsResendDisabled(true);
    setResendTimeout(RESEND_OTP_TIMEOUT);
    
    try {
      await requestOtp();
    } catch (error) {
      // Error is handled in requestOtp
    } finally {
      const timer = setInterval(() => {
        setResendTimeout(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            setIsResendDisabled(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
  };

  useEffect(() => {
    if (initialRender.current) {
      initialRender.current = false;
      requestOtp();
    }
  }, []);

  return (
    <div>
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center max-w-md w-full">
          <div className="flex items-center justify-center mb-6">
            <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
          
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Verify Your Email</h1>
          <p className="text-gray-600 mb-6">We've sent a 6-digit verification code to your email</p>
          
          <div className="mb-6">
            <OtpInputField 
              setOtpMain={setOtp} 
              length={length} 
              otpInputRefs={otpInputRefs}
              handleOtpChange={handleOtpChange}
              handleKeyDown={handleKeyDown}
            />
          </div>
          
          <div className="flex flex-col space-y-3">
            <button 
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition duration-200"
              onClick={handleOtpSubmit}
            >
              Verify OTP
            </button>
            
            <div className="flex items-center justify-center">
              <span className="text-gray-500">Didn't receive the code?</span>
              <button
                className={`ml-2 font-medium text-blue-600 hover:text-blue-800 ${isResendDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                onClick={handleResendOtp}
                disabled={isResendDisabled}
              >
                Resend OTP
              </button>
              {isResendDisabled && (
                <span className="ml-2 text-gray-500">({resendTimeout}s)</span>
              )}
            </div>
          </div>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};

export default SignUpVerification;