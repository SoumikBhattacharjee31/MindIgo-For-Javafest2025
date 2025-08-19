import React, { useState } from "react";

interface GenderInputFieldProps {
  setGender: (gender: string) => void;
  gender: string;
}

const GenderInputField: React.FC<GenderInputFieldProps> = ({ gender, setGender }) => {
  const [focused, setFocused] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setGender(e.target.value);
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
        <select
          id="gender"
          value={gender}
          onChange={handleChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className="w-full px-6 py-4 bg-transparent text-gray-800 placeholder-gray-400 outline-none transition-all duration-300 appearance-none"
          required
        >
          <option value="" disabled>
            Select Gender
          </option>
          <option value="MALE">Male</option>
          <option value="FEMALE">Female</option>
          <option value="OTHERS">Others</option>
        </select>
        <div className={`
          absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-300
          ${focused ? 'w-full' : 'w-0'}
        `} />
      </div>
      <div className={`
        absolute left-6 -top-2 px-2 bg-white text-xs font-medium transition-all duration-300
        ${focused || gender ? 'opacity-100 translate-y-0 text-blue-600' : 'opacity-0 translate-y-2 text-gray-400'}
      `}>
        Gender
      </div>
    </div>
  );
};

export default GenderInputField;