"use client";
import React from "react";
import { useRouter } from 'next/navigation';

import SignInButton from "./components/SignUpButton";
import EmailInputField from "./components/EmailInputField";
import PasswordInputField from "./components/PasswordInputField";
import SignInWithGoogleButton from "./components/SignUpWithGoogleButton";
import SignInWithFacebookButton from "./components/SignUpWithFacebookButton";
import SignInLabel from "./components/SignUpLabel";
import SignUpLink from "./components/SignInLink";
import ForgotPasswordLink from "./components/ForgotPasswordLink";
import TitleWithGifIcon from "./components/TitleWithGifIcon";
import RePasswordInputField from "./components/RePasswordInputField";
import NameInputField from "./components/NameInputField";
import DOBInputField from "./components/DOBInputField";
import GenderInputField from "./components/GenderInputField";
import ProfilePicInputField from "./components/ProfilePicInputField";
import Loader from "./components/Loader";
import { ToastContainer} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {successToast, errorToast, warningToast} from '../../util/toastHelper'
import axios from 'axios';


const SignUp = () => {
  const [loading, setLoading] = React.useState(false);
  const [name, setName] = React.useState("");
  const [dob, setDOB] = React.useState("");
  const [gender, setGender] = React.useState("");
  const [emailId, setEmailId] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [rePassword, setRePassword] = React.useState("");
  const [profilePic, setProfilePic] = React.useState<File | undefined>();
  const router = useRouter();


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();    
    if(rePassword !== password){
      errorToast('Password entries in both fields do not match');
      return;
    }
    
    // Validate required fields
    if (!name || !dob || !gender || !emailId || !password) {
      errorToast('Please fill in all required fields');
      return;
    }
    
    setLoading(true);
    try {
      // Create FormData with correct field names expected by backend
      const formData = new FormData();
      
      // Add profile image if provided (with correct field name)
      if (profilePic) {
        formData.append('profileImage', profilePic);
      }
      
      // Add user data as JSON string with correct field name
      const userRequest = {
        name,
        email: emailId,
        password,
        role: 'USER',
        dateOfBirth: dob,
        gender
      };
      
      formData.append('user', new Blob([JSON.stringify(userRequest)], { type: 'application/json' }));
      
      // Send registration request to correct endpoint
      const response = await axios.post('http://localhost:8080/api/v1/auth/register', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        withCredentials: true,
      });
      
      // Properly handle structured response from backend
      if (response.data.success) {
        successToast('Sign Up Request Sent Successfully. Now Verify with OTP');
        router.push("/sign-up-verification");
      } else {
        errorToast(response.data.message || 'Registration failed');
      }
    } catch (error) {
      // Handle different error scenarios
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 409) {
          errorToast('An account with this email already exists');
        } else if (error.response?.data?.message) {
          errorToast(error.response.data.message);
        } else {
          errorToast('Registration failed. Please try again.');
        }
      } else {
        errorToast('Network error. Please check your connection.');
      }
      console.error('Registration error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 via-blue-700 to-cyan-400 flex items-center justify-center">
      <div className="flex flex-col md:flex-row w-5/6 max-w-5xl bg-white bg-opacity-50 rounded shadow-lg overflow-hidden">
        <div className="w-full md:w-1/2 p-4 md:p-8 space-y-4 border-gray-300">
          <div className="flex md:hidden text-center justify-center w-full">
            <TitleWithGifIcon />
          </div>
          <SignInLabel />
          <form className="space-y-4" onSubmit={handleSubmit}>
            <NameInputField setName={setName} />
            <DOBInputField setDOB={setDOB} />
            <GenderInputField setGender={setGender} />
            <EmailInputField setEmailId={setEmailId} />
            <PasswordInputField setPassword={setPassword} />
            <RePasswordInputField setRePassword={setRePassword} />
            {loading ? <Loader /> : <SignInButton emailId={emailId} password={password} />}
          </form>
        </div>
        <div className="flex w-full md:w-1/2 p-8 border-gray-300 items-center justify-center">
          <div className="text-center space-y-4 w-full">
            <div className="hidden md:flex text-center justify-center w-full">
              <TitleWithGifIcon />
            </div>
            <ProfilePicInputField setProfilePic={setProfilePic}/>
            <SignInWithGoogleButton />
            <SignInWithFacebookButton />
            <div className="text-center flex justify-between">
              <SignUpLink />
              <ForgotPasswordLink />
            </div>
          </div>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};

export default SignUp;