import React, { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";

interface PasswordInputFieldProps {
  setPassword: (password: string) => void;
}

const PasswordInputField: React.FC<PasswordInputFieldProps> = ({
  setPassword,
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="form-control relative">
      <input
        type={showPassword ? "text" : "password"}
        id="password"
        className="input input-bordered w-full h-10 pr-10"
        placeholder="Password"
        onChange={(event) => setPassword(event.target.value)}
        minLength={8}
        required
      />

      <button
        type="button"
        onClick={togglePasswordVisibility}
        className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5"
      >
        {showPassword ? <FaEyeSlash /> : <FaEye />}
      </button>
    </div>
  );
};

export default PasswordInputField;
