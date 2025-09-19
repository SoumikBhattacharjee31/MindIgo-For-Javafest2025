import React, { useState } from "react";

interface DOBInputFieldProps {
  dob?: string;
  setDOB: (dob: string) => void;
}

const DOBInputField: React.FC<DOBInputFieldProps> = ({ dob, setDOB }) => {
  const [focused, setFocused] = useState(false);
  const [value, setValue] = useState(dob || "");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
    setDOB(e.target.value);
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
          type="date"
          id="dob"
          value={value}
          onChange={handleChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className="w-full px-6 py-4 bg-transparent text-gray-800 placeholder-gray-400 outline-none transition-all duration-300"
          placeholder="Date of Birth"
          required
        />
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
        Date of Birth
      </div>
    </div>
  );
};

export default DOBInputField;
