import Link from "next/link";
import React from "react";

const ForgotPasswordLink = () => {
  return (
    <Link href="/forgot-password" className="text-white-600 hover:text-white transition duration-300">
      Forgot Password?
    </Link>
  );
};

export default ForgotPasswordLink;
