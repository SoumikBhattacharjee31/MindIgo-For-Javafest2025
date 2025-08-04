"use client"
import React, { useState, useEffect, useRef } from "react";
import { useRouter } from 'next/navigation';
import axios from "axios";
import OtpInputField from "./components/OtpInputField";

import { ToastContainer } from 'react-toastify';
import { successToast, errorToast, warningToast, infoToast } from '../../util/toastHelper'
import 'react-toastify/dist/ReactToastify.css';

const length = 6;
let RESEND_OTP_TIMEOUT = 30000; // 30 seconds

const SignUpVerification = () => {
  const [otp, setOtp] = useState(Array(length).fill(''));
  const [isResendDisabled, setIsResendDisabled] = useState(false);
  const [resendTimeout, setResendTimeout] = useState(0);
  const router = useRouter();
  const initialRender = useRef(true);

  const handleOtpSubmit = async () => {
    try {
      const otpInt = parseInt(otp.join(''));
      console.log(otpInt);
      const response = await axios.post('http://localhost:8080/api/v1/auth/loginOTP', { otp: otpInt }, {
        withCredentials: true
      });
      if (response.status === 200) {
        if(response.data === "Successfully Validated"){
          successToast('OTP validated');
          router.push("/home");
        } else {
          warningToast('OTP didn\'t match');
        }
      } else {
        errorToast('Some Error Occurred');
        console.error('OTP submission failed');
      }
    } catch (error) {
      errorToast('An error occurred during OTP submission');
      console.error('Error:', error);
    }
  };

  const fetchData = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/v1/auth/get-otp', {
        withCredentials: true
      });
      if (response.status === 200) {
        infoToast(response.data);
        console.log(response);
      } else {
        errorToast('The mail couldn\'t be sent');
        console.error('Failed to fetch data');
      }
    } catch (error) {
      errorToast('An error occurred while fetching data');
      console.error('Error:', error);
    }
  };

  const handleResendOtp = async () => {
    setIsResendDisabled(true);
    setResendTimeout(RESEND_OTP_TIMEOUT / 1000);
    RESEND_OTP_TIMEOUT+=15000;
    try {
      const response = await axios.get('http://localhost:8080/api/v1/auth/get-otp', {
        withCredentials: true
      });
      if (response.status === 200) {
        infoToast('OTP resent successfully');
        console.log(response);
      } else {
        errorToast('Failed to resend OTP');
        console.error('Failed to resend OTP');
      }
    } catch (error) {
      errorToast('An error occurred while resending OTP');
      console.error('Error:', error);
    } finally {
      setTimeout(() => {
        setIsResendDisabled(false);
      }, RESEND_OTP_TIMEOUT);
    }
  };

  useEffect(() => {
    if (initialRender.current) {
      initialRender.current = false;
      fetchData();
    }
  }, []);

  useEffect(() => {
    if (resendTimeout > 0) {
      const timer = setInterval(() => {
        setResendTimeout(prevTimeout => prevTimeout - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [resendTimeout]);

  return (
    <div>
      <div className="flex flex-col items-center justify-center min-h-screen bg-forgot-password-background">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center max-w-3xl justify-center">
          <div className="flex items-center justify-center w-full p-8 border-gray-300">
            <embed
              src={"/waiting_for_link.gif"}
              className="w-1/2 h-full border-none"
            />
          </div>
          <h1 className="text-2xl font-semibold mb-2">Check Your Email</h1>
          <OtpInputField setOtpMain={setOtp} length={length} />
          <br />
          <div className="flex space-x-4 justify-center mt-4">
            <button className="btn btn-primary" onClick={handleOtpSubmit}>Submit</button>
            <div className="flex items-center">
              <button
                className="btn btn-secondary"
                onClick={handleResendOtp}
                disabled={isResendDisabled}
              >
                Resend OTP
              </button>
              {isResendDisabled && (
                <span className="ml-2 text-gray-600">({resendTimeout}s)</span>
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
