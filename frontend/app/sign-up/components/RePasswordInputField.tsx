import React, { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";

interface RePasswordInputFieldProps {
  setRePassword: (Repassword: string) => void;
}

const RePasswordInputField: React.FC<RePasswordInputFieldProps> = ({
  setRePassword,
}) => {
  const [showRePassword, setShowRePassword] = useState(false);

  const toggleRePasswordVisibility = () => {
    setShowRePassword(!showRePassword);
  };

  return (
    <div className="form-control relative">
      <input
        type={showRePassword ? "text" : "password"}
        id="password"
        className="input input-bordered w-full h-10 pr-10"
        placeholder="Confirm Password"
        onChange={(event) => setRePassword(event.target.value)}
        minLength={8}
        required
      />

      <button
        type="button"
        onClick={toggleRePasswordVisibility}
        className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5"
      >
        {showRePassword ? <FaEyeSlash /> : <FaEye />}
      </button>
    </div>
  );
};

export default RePasswordInputField;
