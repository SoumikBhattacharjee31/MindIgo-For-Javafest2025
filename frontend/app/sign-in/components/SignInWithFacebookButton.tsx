import React from "react";
import Link from "next/link";
import { getProviderLoginUrl } from "@/util/providerLogin";

const SignInWithFacebookButton: React.FC = () => {
  return (
    <div className="w-1/2 pl-2">
      <Link href={getProviderLoginUrl("facebook")}>
        <button
          className="
          relative py-3 px-4 rounded-xl font-medium transition-all duration-300 overflow-hidden group
          bg-white border-2 border-blue-200/50 hover:border-blue-300 hover:shadow-md hover:scale-105
          text-gray-700 hover:text-gray-800
        "
        >
          <div className="relative z-10 flex items-center justify-center">
            <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none">
              <path
                d="M22 12c0-5.522-4.477-10-10-10S2 6.478 2 12c0 4.99 3.656 9.128 8.437 9.878v-6.987h-2.54v-2.891h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.344 21.128 22 16.99 22 12z"
                fill="#1877F2"
              />
            </svg>
          </div>
        </button>
      </Link>
    </div>
  );
};

export default SignInWithFacebookButton;
