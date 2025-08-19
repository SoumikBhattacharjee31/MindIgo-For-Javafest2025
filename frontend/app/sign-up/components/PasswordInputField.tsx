import React, { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";

interface PasswordInputFieldProps {
  setPassword: (password: string) => void;
}

const PasswordInputField: React.FC<PasswordInputFieldProps> = ({ setPassword }) => {
  const [focused, setFocused] = useState(false);
  const [value, setValue] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
    setPassword(e.target.value);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="relative group">
      <div className={`
        relative overflow-hidden rounded-2xl transition-all duration-300
        ${focused 
          ? 'bg-gradient-to-r from-blue-50 to-indigo-50 ring-2 ring-blue-400 ring-opacity-50' 
          : 'bg-gray-50/80 hover:bg-gray-50 border border-gray-200/50'
        }
      `}>
        <input
          type={showPassword ? "text" : "password"}
          id="password"
          value={value}
          onChange={handleChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className="w-full px-6 py-4 pr-14 bg-transparent text-gray-800 placeholder-gray-400 outline-none transition-all duration-300"
          placeholder="Enter your password"
          minLength={8}
          required
        />
        <button
          type="button"
          onClick={togglePasswordVisibility}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 p-2 text-gray-400 hover:text-gray-600 transition-colors duration-200 rounded-lg hover:bg-gray-100/50"
        >
          {showPassword ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          )}
        </button>
        <div className={`
          absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-300
          ${focused ? 'w-full' : 'w-0'}
        `} />
      </div>
      <div className={`
        absolute left-6 -top-2 px-2 bg-white text-xs font-medium transition-all duration-300
        ${focused || value ? 'opacity-100 translate-y-0 text-blue-600' : 'opacity-0 translate-y-2 text-gray-400'}
      `}>
        Password
      </div>
    </div>
  );
};

export default PasswordInputField;
