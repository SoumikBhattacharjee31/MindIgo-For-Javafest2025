import React from "react";
import { FaLock } from "react-icons/fa";

const ExplanationText = () => {
  return (
    <>
      <div className="flex justify-center">
        <FaLock size={70} />
      </div>
      <h2 className="text-2xl font-bold text-center">Forgot Password</h2>
      <p className="text-sm text-center text-gray-600">
        Enter your email address and we'll send you a link to reset your
        password.
      </p>
    </>
  );
};

export default ExplanationText;
