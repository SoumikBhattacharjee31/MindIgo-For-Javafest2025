import React from "react";
import { getProviderLoginUrl } from "@/util/providerLogin";
import Link from "next/link";

const SignInWithFacebookButton = () => {
  return (
    <div className="w-full">
      <Link href={getProviderLoginUrl('facebook')}>
      <button className="
        relative w-full py-4 px-6 rounded-2xl font-medium transition-all duration-300 overflow-hidden group
        bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800
        text-white hover:shadow-lg hover:scale-105
      ">
        <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="relative z-10 flex items-center justify-center space-x-3">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
          </svg>
          <span>Continue with Facebook</span>
        </div>
      </button>
      </Link>
    </div>
  );
};

export default SignInWithFacebookButton;
