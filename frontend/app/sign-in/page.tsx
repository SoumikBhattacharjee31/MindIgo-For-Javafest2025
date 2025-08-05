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

import { ToastContainer} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {successToast, errorToast} from '../../util/toastHelper'

const Login = () => {
  const [emailId, setEmailId] = React.useState("");
  const [password, setPassword] = React.useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:8080/api/v1/auth/login', {
        email: emailId,
        password: password,
      }, { withCredentials: true }); 
      
      if (response.status === 200) {
          successToast(response.data);
          if(response.data == "User Successfully Logged in")
            router.push("\home");
      } else {
        errorToast("Password not matched");
        console.error('Non-200 response:', response.status);
      }
    } catch (error) {
      errorToast("Password not matched");
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
          <form className="space-y-4" onSubmit={handleSubmit}>
            <EmailInputField setEmailId={setEmailId} />
            <PasswordInputField setPassword={setPassword} />
            <SignInButton />
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
      <ToastContainer/>
    </div>
  );
};

export default Login;
