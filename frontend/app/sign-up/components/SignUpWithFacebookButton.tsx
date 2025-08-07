import React from "react";
import { FaFacebook } from "react-icons/fa";

const SignUpWithFacebookButton = () => {
  return (
    <div className="form-control">
      <button className="btn btn-outline w-full flex items-center justify-center space-x-2 bg-blue-900 text-white">
        <FaFacebook />
        <span>Sign up with Facebook</span>
      </button>
    </div>
  );
};

export default SignUpWithFacebookButton;
