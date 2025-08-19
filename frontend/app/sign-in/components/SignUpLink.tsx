import Link from "next/link";
import React from "react";

const SignUpLink: React.FC = () => {
  return (
    <Link
      href="/sign-up"
      className="
        group relative inline-flex items-center text-sm font-medium text-gray-600 
        hover:text-blue-600 transition-all duration-300
      "
    >
      <span className="relative">
        Don't have an account?
        <span className="ml-1 font-semibold">Sign up here</span>
        <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-500 to-indigo-500 group-hover:w-full transition-all duration-300" />
      </span>
      <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
      </svg>
    </Link>
  );
};



export default SignUpLink;
