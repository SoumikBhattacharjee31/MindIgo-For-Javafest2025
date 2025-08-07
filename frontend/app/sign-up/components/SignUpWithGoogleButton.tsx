import React from "react";
import { FaGoogle } from "react-icons/fa";

const SignUpWithGoogleButton = () => {
  return (
    <div className="form-control">
      <button className="btn btn-outline w-full flex items-center justify-center space-x-2 bg-white text-black">
        <FaGoogle />
        <span>Sign up with Google</span>
      </button>
    </div>
  );
};

export default SignUpWithGoogleButton;
