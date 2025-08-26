"use client";
import React, { useState } from "react";
import { useRouter } from 'next/navigation';
import { ChevronRight, ChevronLeft, Check, User, UserCheck, Mail, Lock, Calendar, Image, FileText, Award } from 'lucide-react';
import SignUpButton from "./components/SignUpButton";
import EmailInputField from "./components/EmailInputField";
import PasswordInputField from "./components/PasswordInputField";
import SignUpWithGoogleButton from "./components/SignUpWithGoogleButton";
import SignUpWithFacebookButton from "./components/SignUpWithFacebookButton";
import SignUpLink from "./components/SignInLink";
import ForgotPasswordLink from "./components/ForgotPasswordLink";
import TitleWithGifIcon from "./components/TitleWithGifIcon";
import RePasswordInputField from "./components/RePasswordInputField";
import NameInputField from "./components/NameInputField";
import DOBInputField from "./components/DOBInputField";
import GenderInputField from "./components/GenderInputField";
import ProfilePicInputField from "./components/ProfilePicInputField";
import Loader from "./components/Loader";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { successToast, errorToast, warningToast } from '../../util/toastHelper'
import axios from 'axios';
import UserTypeSelector from "../components/UserTypeSelector";
import CounselorSpecificFields from "../components/CounselorSpecificFields";
import ButtonTypeDivider from "./components/ButtonTypeDivider";

const SignUp = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState('forward');
  const [loading, setLoading] = React.useState(false);
  const [name, setName] = React.useState("");
  const [dob, setDOB] = React.useState("");
  const [gender, setGender] = React.useState("");
  const [emailId, setEmailId] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [rePassword, setRePassword] = React.useState("");
  const [profilePic, setProfilePic] = React.useState<File | undefined>();
  const [userType, setUserType] = React.useState("CLIENT");
  const [licenseNumber, setLicenseNumber] = React.useState("");
  const [specialization, setSpecialization] = React.useState("");
  const [verificationDocument, setVerificationDocument] = React.useState<File | undefined>();
  const router = useRouter();
  // Define steps based on user type
  const getSteps = () => {
    const baseSteps = [
      { id: 'userType', title: 'Account Type', icon: User, required: true },
      { id: 'basic', title: 'Basic Info', icon: UserCheck, required: true },
      { id: 'credentials', title: 'Credentials', icon: Mail, required: true },
      { id: 'profile', title: 'Profile Picture', icon: Image, required: false }
    ];

    if (userType === 'COUNSELOR') {
      return [
        ...baseSteps,
        { id: 'professional', title: 'Professional Info', icon: Award, required: true },
      ];
    }

    return baseSteps;
  };

  const steps = getSteps();

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setDirection('forward');
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setDirection('backward');
      setCurrentStep(currentStep - 1);
    }
  };

  const canProceed = () => {
    const step = steps[currentStep];

    switch (step.id) {
      case 'userType':
        return userType !== "";
      case 'basic':
        return name && dob && gender;
      case 'credentials':
        return emailId && password && rePassword && password === rePassword;
      case 'profile':
        return true;
      case 'professional':
        return licenseNumber && specialization && verificationDocument;
      default:
        return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rePassword !== password) {
      errorToast('Password entries in both fields do not match');
      return;
    }

    // Validate required fields
    if (!name || !dob || !gender || !emailId || !password) {
      errorToast('Please fill in all required fields');
      return;
    }

    // Additional validation for counselors
    if (userType === "COUNSELOR") {
      if (!licenseNumber || !specialization || !verificationDocument) {
        errorToast('Please fill in all counselor-specific fields and upload verification document');
        return;
      }
    }

    setLoading(true);
    try {
      // Create FormData with correct field names expected by backend
      const formData = new FormData();

      // Add profile image if provided
      if (profilePic) {
        formData.append('profileImage', profilePic);
      }

      // Determine API endpoint and data structure based on user type
      let endpoint = '';
      let requestData = {};

      if (userType === "COUNSELOR") {
        endpoint = 'http://localhost:8080/api/v1/auth/register-counselor';

        // Add verification document (required for counselors)
        if (verificationDocument) {
          formData.append('verificationDocument', verificationDocument);
        }

        // Counselor request data
        requestData = {
          name,
          email: emailId,
          password,
          dateOfBirth: dob,
          gender,
          licenseNumber,
          specialization
        };

        formData.append('counselor', new Blob([JSON.stringify(requestData)], { type: 'application/json' }));
      } else {
        // CLIENT registration
        endpoint = 'http://localhost:8080/api/v1/auth/register';

        requestData = {
          name,
          email: emailId,
          password,
          role: 'USER', // Changed from USER to CLIENT
          dateOfBirth: dob,
          gender
        };

        formData.append('user', new Blob([JSON.stringify(requestData)], { type: 'application/json' }));
      }

      // Send registration request to appropriate endpoint
      const response = await axios.post(endpoint, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        withCredentials: true,
      });

      // Handle response
      if (response.data.success) {
        if (userType === "COUNSELOR") {
          successToast('Counselor registration submitted! Your account will be activated after admin approval.');
          // Redirect to a counselor-specific status page
          router.push("/counselor-status");
        } else {
          successToast('Sign Up Request Sent Successfully. Now Verify with OTP');
          router.push("/sign-up-verification");
        }
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



  const renderStepContent = () => {
    const step = steps[currentStep];

    switch (step.id) {
      case 'userType':
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <UserTypeSelector userType={userType} setUserType={setUserType} />
            </div>
          </div>

        );

      case 'basic':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Basic Information</h2>
            <div className="flex flex-col space-y-4 justify-center">
              <NameInputField name={name} setName={setName} />
              <DOBInputField dob={dob} setDOB={setDOB} />
              <GenderInputField gender={gender} setGender={setGender} />
            </div>
          </div>
        );

      case 'credentials':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Account Credentials</h2>
            <div className="flex flex-col space-y-4 justify-center">
              <EmailInputField emailId={emailId} setEmailId={setEmailId} />
              <PasswordInputField password={password} setPassword={setPassword} />
              <RePasswordInputField rePassword={rePassword} setRePassword={setRePassword} />
              {(rePassword && password !== rePassword) && (
                <p className="text-sm text-red-500">Passwords do not match</p>
              )}
            </div>
          </div>
        );

      case 'profile':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Profile Picture</h2>
            <p className="text-gray-600">Add a profile picture to personalize your account (optional)</p>
            <ProfilePicInputField setProfilePic={setProfilePic} />
          </div>
        );

      case 'professional':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Professional Information</h2>
            <div className="space-y-4">
              <CounselorSpecificFields
                licenseNumber={licenseNumber}
                setLicenseNumber={setLicenseNumber}
                specialization={specialization}
                setSpecialization={setSpecialization}
                verificationDocument={verificationDocument}
                setVerificationDocument={setVerificationDocument}
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-blue-100 flex items-center justify-center px-3">
      <div className="flex flex-col md:flex-row w-full max-w-5xl bg-white bg-opacity-90 rounded-xl shadow-2xl overflow-hidden">
        <div className="w-full md:w-1/2 p-5">
          <div className="mb-8">
            <TitleWithGifIcon />
          </div>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="relative overflow-hidden min-h-[400px]">
              <div
                className={`transition-all duration-500 ease-in-out ${direction === 'forward' ? 'animate-slide-in-right' : 'animate-slide-in-left'
                  }`}
              >
                {renderStepContent()}
              </div>
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8">

              <button
                type="button" 
                onClick={prevStep}
                disabled={currentStep === 0}
                className={`flex items-center space-x-2 px-6 py-3 rounded-lg transition-all duration-200 ${currentStep === 0
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
                  }`}
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Back</span>
              </button>

              {
                currentStep === steps.length - 1 ? (
                  loading ? (
                    <Loader />
                  ) : (
                    <SignUpButton emailId={emailId} password={password} />
                  )
                ) : (
                  <button
                    type="button" 
                    onClick={nextStep}
                    disabled={!canProceed()}
                    className={`flex items-center space-x-2 px-6 py-3 rounded-lg transition-all duration-200 ${canProceed()
                      ? 'bg-purple-600 text-white hover:bg-purple-700'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      }`}
                  >
                    <span>Continue</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                )
              }
            </div>
          </form>
        </div>

        {/* Right Column - Progress and Social Login */}
        <div className="w-full md:w-1/2 bg-purple-50 p-5 flex flex-col justify-between ">

          {/* Progress Indicator */}
          <div className="space-y-6 flex flex-col items-center">
            <h3 className="text-lg font-semibold text-gray-800">Registration Progress</h3>
            <div className="space-y-4">
              {steps.map((step, index) => {
                const Icon = step.icon;
                const isCompleted = index < currentStep;
                const isCurrent = index === currentStep;
                const isUpcoming = index > currentStep;

                return (
                  <div key={step.id} className="flex items-center space-x-3">
                    <div className={`flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300 ${isCompleted ? 'bg-green-500 text-white' :
                      isCurrent ? 'bg-purple-600 text-white animate-pulse' :
                        'bg-gray-200 text-gray-400'
                      }`}>
                      {isCompleted ? <Check className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                    </div>
                    <div className="flex-1">
                      <div className={`font-medium ${isCompleted ? 'text-green-600' :
                        isCurrent ? 'text-purple-600' :
                          'text-gray-400'
                        }`}>
                        {step.title}
                        {step.required && <span className="text-red-500 ml-1">*</span>}
                      </div>
                      <div className={`text-sm ${isCompleted ? 'text-green-500' :
                        isCurrent ? 'text-purple-500' :
                          'text-gray-400'
                        }`}>
                        {isCompleted ? 'Completed' : isCurrent ? 'In Progress' : 'Pending'}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Social Login Options */}
          <div className="space-y-6">
              <ButtonTypeDivider/>
              <div className="flex justify-center space-x-4">
                <SignUpWithGoogleButton />
                <SignUpWithFacebookButton />
              
            </div>

            <div className="flex justify-between items-center">
              <SignUpLink />
              <ForgotPasswordLink />
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes slide-in-right {
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes slide-in-left {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        .animate-slide-in-right {
          animation: slide-in-right 0.5s ease-out;
        }
        
        .animate-slide-in-left {
          animation: slide-in-left 0.5s ease-out;
        }
      `}</style>
      <ToastContainer />
    </div>
  );
};

export default SignUp;