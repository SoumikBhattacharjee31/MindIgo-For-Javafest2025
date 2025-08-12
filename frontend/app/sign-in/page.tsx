"use client";
import React from "react";
import { useRouter } from 'next/navigation';
import UserTypeSelector from "../components/UserTypeSelector";

import SignInButton from "./components/SignInButton";
import EmailInputField from "./components/EmailInputField";
import PasswordInputField from "./components/PasswordInputField";
import SignInWithGoogleButton from "./components/SignInWithGoogleButton";
import SignInWithFacebookButton from "./components/SignInWithFacebookButton";
import SignInLabel from "./components/SignInLabel";
import ButtonTypeDivider from "./components/ButtonTypeDivider";
import SignUpLink from "./components/SignUpLink";
import ForgotPasswordLink from "./components/ForgotPasswordLink";
import TitleWithGifIcon from "./components/TitleWithGifIcon";
import MeditationGif from "./components/MeditationGif";
import axios from 'axios';

import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { successToast, errorToast, warningToast } from '../../util/toastHelper';

const Login = () => {
  const [emailId, setEmailId] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [userType, setUserType] = React.useState("CLIENT");
  const router = useRouter();

  const handleSubmit = async (e:any) => {
    e.preventDefault();
    
    // Validate inputs
    if (!emailId || !password) {
      warningToast('Please fill in all fields');
      return;
    }
    
    setLoading(true);
    try {
      const response = await axios.post('http://localhost:8080/api/v1/auth/login', {
        email: emailId,
        password: password,
      }, { 
        withCredentials: true 
      });
      
      // Handle structured response from backend
      if (response.data.success) {
        successToast('Login successful');
        
        // Get user role from response and redirect accordingly
        const userRole = response.data.data.user.role;
        
        if (userRole === 'COUNSELOR') {
          router.push("/counselor-dashboard");
        } else if (userRole === 'CLIENT') {
          router.push("/client-dashboard");
        } else {
          router.push("/home"); // Default for other roles
        }
      } else {
        errorToast(response.data.message || 'Login failed');
      }
    } catch (error) {
      // Handle different error scenarios
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          errorToast('Invalid email or password');
        } else if (error.response?.status === 403) {
          const message = error.response.data.message;
          if (message.includes('Email not verified')) {
            errorToast('Please verify your email before logging in');
            router.push("/sign-up-verification");
          } else if (message.includes('pending admin approval')) {
            errorToast('Your counselor account is pending admin approval');
            router.push("/counselor-status");
          } else if (message.includes('rejected')) {
            errorToast('Your counselor account has been rejected. Please contact support.');
          } else if (message.includes('suspended')) {
            errorToast('Your counselor account has been suspended. Please contact support.');
          } else {
            errorToast(message || 'Account access denied');
          }
        } else if (error.response?.status === 429) {
          errorToast('Too many login attempts. Please try again later.');
        } else {
          errorToast('Login failed. Please try again.');
        }
      } else {
        errorToast('Network error. Please check your connection.');
      }
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 via-blue-700 to-cyan-400 flex items-center justify-center">
      <div className="flex w-5/6 max-w-5xl bg-white bg-opacity-50 rounded shadow-lg overflow-hidden">
        <div className="hidden md:flex w-1/2 p-8 border-gray-300 items-center justify-center">
          <div className="text-center">
            <TitleWithGifIcon />
            <MeditationGif />
          </div>
        </div>
        <div className="w-full md:w-1/2 p-4 md:p-8 space-y-4 border-gray-300">
          <SignInLabel />
          <UserTypeSelector userType={userType} setUserType={setUserType} />
          <form className="space-y-4" onSubmit={handleSubmit}>
            <EmailInputField setEmailId={setEmailId} />
            <PasswordInputField setPassword={setPassword} />
            {loading ? (
              <div className="flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
              </div>
            ) : (
              <SignInButton emailId={emailId} password={password} />
            )}
          </form>
          
          <ButtonTypeDivider />
          <SignInWithGoogleButton />
          <SignInWithFacebookButton />

          <div className="text-center flex justify-between">
            <SignUpLink />
            <ForgotPasswordLink />
          </div>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};

export default Login;