import React from "react";
import Link from "next/link";

const ResetPassword = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-forgot-password-background">
      <div className="bg-white p-8 rounded-lg shadow-lg text-center max-w-3xl">
        <div className="flex items-center justify-center w-full p-8 border-gray-300">
          <embed
            src={"/waiting_for_link.gif"}
            className=" w-8/12 h-full border-none"
          />
        </div>
        <h1 className="text-2xl font-semibold mb-2">Check Your Email</h1>
        <p className="mb-4 text-gray-700 text-xs">
          We have sent you a link to reset your password. Please check your
          email and follow the instructions.
        </p>
        <Link href="/">
          <button className="btn btn-primary">Go to Homepage</button>
        </Link>
      </div>
    </div>
  );
};

export default ResetPassword;
