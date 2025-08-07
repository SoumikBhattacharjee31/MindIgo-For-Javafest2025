import React from "react";

const SignInButton = ({ emailId, password, disabled = false }) => {
  // Validate inputs to enable/disable the button
  const isValid = emailId && password && emailId.includes('@') && password.length >= 8;
  
  return (
    <div className="form-control">
      <button 
        type="submit" 
        className={`btn btn-primary w-full text-white ${
          !isValid && !disabled ? 'opacity-50 cursor-not-allowed' : ''
        }`}
        disabled={!isValid || disabled}
      >
        Sign In
      </button>
    </div>
  );
};

export default SignInButton;