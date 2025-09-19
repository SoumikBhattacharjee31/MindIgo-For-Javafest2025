import React from "react";

interface SignInButtonProps {
  emailId: string;
  password: string;
  disabled?: boolean;
}

const SignUpButton: React.FC<SignInButtonProps> = ({
  emailId,
  password,
  disabled = false,
}) => {
  const isValid = emailId && password && emailId.includes("@");

  return (
    <div className="pt-2">
      <button
        type="submit"
        disabled={!isValid || disabled}
        className={`
          relative w-full py-4 px-6 rounded-2xl font-semibold text-white transition-all duration-300 overflow-hidden group
          ${
            isValid && !disabled
              ? "bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600 hover:from-blue-600 hover:via-blue-700 hover:to-indigo-700 transform hover:scale-105 hover:shadow-xl shadow-lg"
              : "bg-gray-300 cursor-not-allowed opacity-60"
          }
        `}
      >
        <div
          className={`
          absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300
          ${isValid && !disabled ? "block" : "hidden"}
        `}
        />
        <span className="relative z-10 flex items-center justify-center">
          {isValid && !disabled ? (
            <>
              Sign Up
              <svg
                className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </>
          ) : (
            "Please fill all fields"
          )}
        </span>
      </button>
    </div>
  );
};

export default SignUpButton;
