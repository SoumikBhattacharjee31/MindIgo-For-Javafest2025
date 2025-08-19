import Link from "next/link";
import React from "react";

const SignInLink: React.FC = () => {
  return (
    <Link
      href="/sign-in"
      className="
        group relative inline-flex items-center text-sm font-medium text-gray-600 
        hover:text-blue-600 transition-all duration-300
      "
    >
      <span className="relative ">
        Already have an account?
        <span className="ml-1 font-semibold">Sign in here</span>
        <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-500 to-indigo-500 group-hover:w-full transition-all duration-300" />
      </span>
    </Link>
  );
};



export default SignInLink;
