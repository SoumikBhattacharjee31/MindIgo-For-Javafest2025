import React from "react";
import { FaFacebook } from "react-icons/fa";
import { getProviderLoginUrl } from "@/util/providerLogin";
import Link from "next/link";

const SignInWithFacebookButton = () => {
  return (
    <div className="form-control">
      <Link href={getProviderLoginUrl('facebook')}>
      <button className="btn btn-outline w-full flex items-center justify-center space-x-2 bg-blue-900 text-white">
        <FaFacebook />
        <span>
          
            Sign in with Facebook
          
          </span>
      </button>
      </Link>
    </div>
  );
};

export default SignInWithFacebookButton;
