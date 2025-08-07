import Link from "next/link";
import React from "react";

const SignUpLink = () => {
  return (
    <Link
      href="/sign-up"
      className="text-white-600 hover:text-white transition duration-300"
    >
      Sign up here
    </Link>
  );
};

export default SignUpLink;
