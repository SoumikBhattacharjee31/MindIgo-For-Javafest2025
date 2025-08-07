import React from "react";

interface SubmitButtonProps {
  emailId: string,
  password: string
}

const SignUpButton: React.FC<SubmitButtonProps> = ({ emailId, password }) => {
  return (
    <div className="form-control">
      <button type="submit" className="btn btn-primary w-full text-white">
        Sign Up
      </button>
    </div>
  );
};

export default SignUpButton;
