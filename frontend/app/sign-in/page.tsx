"use client";
import React from "react";
import { useRouter } from 'next/navigation';
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
// import { ToastContainer } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';
import { successToast, errorToast, warningToast } from '../../util/toastHelper';
import useStore from "@/app/store/store";

const Login = () => {
  
  const [emailId, setEmailId] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const router = useRouter();
  // const dispatch = useDispatch();
  const {user, setUser} = useStore();

  const handleSubmit = async (e: any) => {
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

      if (response.data.success) {
        successToast('Login successful');
        const userData = response.data.data.user;
        const userRole = response.data.data.user.role;
        setUser(userData);
        // dispatch(login_user(userData));

        if (userRole === 'COUNSELOR') {
          router.push("/dashboard");
        } else if (userRole === 'USER') {
          router.push("/dashboard");
        } else {
          router.push("/home");
        }
      } else {
        errorToast(response.data.message || 'Login failed');
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          errorToast('Invalid email or password');
        } else if (error.response?.status === 403) {
          const { message, errorCode } = error.response.data;
          if (errorCode === 'COUNSELOR_PENDING_APPROVAL' || message.includes('pending admin approval')) {
            errorToast('Your counselor account is pending admin approval');
            router.push("/counselor-status");
          } else if (errorCode === 'EMAIL_NOT_VERIFIED' || message.includes('Email not verified')) {
            errorToast('Please verify your email before logging in');
            router.push("/sign-up-verification");
          } else if (errorCode === 'COUNSELOR_REJECTED' || message.includes('rejected')) {
            errorToast('Your counselor account has been rejected. Please contact support.');
          } else if (errorCode === 'COUNSELOR_SUSPENDED' || message.includes('suspended')) {
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
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-blue-100 flex items-center justify-center">
      <div className="flex w-11/12 max-w-4xl bg-white/90 rounded-3xl shadow-2xl overflow-hidden border border-blue-100">
        <div className="hidden md:flex w-1/2 p-8 items-center justify-center bg-gradient-to-br from-blue-100 via-blue-50 to-white">
          <div className="text-center">

            <TitleWithGifIcon />
            <MeditationGif />
          </div>
        </div>
        <div className="w-full md:w-1/2 p-6 md:p-8 space-y-5">
          <SignInLabel />
          <form className="space-y-5" onSubmit={handleSubmit}>
            <EmailInputField setEmailId={setEmailId} />
            <PasswordInputField setPassword={setPassword} />
            <div className="flex justify-between text-sm mt-2">
              <SignUpLink />
              <ForgotPasswordLink />
            </div>
            {loading ? (
              <div className="flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            ) : (
              <SignInButton emailId={emailId} password={password} />
            )}
          </form>
          <ButtonTypeDivider />
          <div className="grid grid-cols-2">
            <div className="flex items-center justify-end"><SignInWithGoogleButton /></div>
            <div className="flex items-center"><SignInWithFacebookButton /></div>
          </div>
        </div>
      </div>
      {/* <ToastContainer /> */}
    </div>
  );
};

export default Login;