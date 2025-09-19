import { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";

interface PasswordInputFieldProps {
  rePassword?: string;
  setRePassword: (password: string) => void;
}

const RePasswordInputField: React.FC<PasswordInputFieldProps> = ({
  rePassword,
  setRePassword,
}) => {
  const [focused, setFocused] = useState(false);
  const [value, setValue] = useState(rePassword || "");
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
    setRePassword(e.target.value);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="relative group">
      <div
        className={`
        relative overflow-hidden rounded-2xl transition-all duration-300
        ${
          focused
            ? "bg-gradient-to-r from-blue-50 to-indigo-50 ring-2 ring-blue-400 ring-opacity-50"
            : "bg-gray-50/80 hover:bg-gray-50 border border-gray-200/50"
        }
      `}
      >
        <input
          type={showPassword ? "text" : "password"}
          id="password"
          value={value}
          onChange={handleChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className="w-full px-6 py-4 pr-14 bg-transparent text-gray-800 placeholder-gray-400 outline-none transition-all duration-300"
          placeholder="Confirm your password"
          minLength={8}
          required
        />
        <button
          type="button"
          onClick={togglePasswordVisibility}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 p-2 text-gray-400 hover:text-gray-600 transition-colors duration-200 rounded-lg hover:bg-gray-100/50"
        >
          {showPassword ? (
            <FaEyeSlash className="w-5 h-5" />
          ) : (
            <FaEye className="w-5 h-5" />
          )}
        </button>
        <div
          className={`
          absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-300
          ${focused ? "w-full" : "w-0"}
        `}
        />
      </div>
      <div
        className={`
        absolute left-6 -top-2 px-2 bg-white text-xs font-medium transition-all duration-300
        ${
          focused || value
            ? "opacity-100 translate-y-0 text-blue-600"
            : "opacity-0 translate-y-2 text-gray-400"
        }
      `}
      >
        Password
      </div>
    </div>
  );
};

export default RePasswordInputField;
