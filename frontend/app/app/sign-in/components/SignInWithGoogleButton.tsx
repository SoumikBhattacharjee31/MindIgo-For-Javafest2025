import React from "react";
import { FaGoogle } from "react-icons/fa";
import { getProviderLoginUrl } from "@/util/providerLogin";
import Link from "next/link";

const SignInWithGoogleButton = () => {
  return (
    <div className="form-control">
      <Link href={getProviderLoginUrl('google')}>
      <button className="btn btn-outline w-full flex items-center justify-center space-x-2 bg-white text-black">
        <FaGoogle />
        <span>
          
            Sign in with Google
          
        </span>
      </button>
      </Link>
    </div>
  );
};

export default SignInWithGoogleButton;
