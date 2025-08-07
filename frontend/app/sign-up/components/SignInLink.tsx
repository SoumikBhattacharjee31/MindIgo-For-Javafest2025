import Link from "next/link";
import React from "react";

const SignInLink = () => {
  return (
    <Link
      href="/sign-in"
      className="text-white-600 hover:text-white transition duration-300"
    >
      Sign in here
    </Link>
  );
};

export default SignInLink;
