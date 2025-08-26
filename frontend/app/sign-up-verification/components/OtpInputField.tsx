"use client"
import React, { useState, useRef, useEffect } from 'react';

interface OtpInputFieldProps {
  setOtpMain: (otp: string[]) => void,
  length: number,
  otpInputRefs?: React.MutableRefObject<(HTMLInputElement | null)[]>,
  handleOtpChange?: (index: number, value: string) => void,
  handleKeyDown?: (index: number, e: React.KeyboardEvent) => void
}

const OtpInputField: React.FC<OtpInputFieldProps> = ({ 
  setOtpMain, 
  length,
  otpInputRefs,
  handleOtpChange,
  handleKeyDown 
}) => {
  // Create internal refs if not provided
  const internalRefs = useRef<(HTMLInputElement | null)[]>([]);
  const refsToUse = otpInputRefs || internalRefs;
  
  const [otp, setOtp] = useState(Array(length).fill(''));

  // Update parent component when OTP changes
  useEffect(() => {
    setOtpMain(otp);
  }, [otp, setOtpMain]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const { value } = e.target;
    if (/[^0-9]/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    
    // Use provided handler if available, otherwise default behavior
    if (handleOtpChange) {
      handleOtpChange(index, value);
      return;
    }

    // Move to next input if a digit was entered
    if (value && index < length - 1) {
      refsToUse.current[index + 1]?.focus();
    }
  };

  const handleKeyDownInternal = (index: number, e: React.KeyboardEvent) => {
    if (handleKeyDown) {
      handleKeyDown(index, e);
      return;
    }
    
    // Handle backspace to move to previous input
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      refsToUse.current[index - 1]?.focus();
    }
  };

  return (
    <div className="flex space-x-2 w-full justify-center">
      {Array.from({ length }).map((_, index) => (
        <input
          key={index}
          ref={el => {
            // Store the element in our refs array
            // This function doesn't return anything (void)
            if (refsToUse.current) {
              refsToUse.current[index] = el;
            }
          }}
          id={`otp-input-${index}`}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={otp[index]}
          onChange={(e) => handleChange(e, index)}
          onKeyDown={(e) => handleKeyDownInternal(index, e)}
          className="w-12 h-12 border-2 border-gray-300 rounded-lg text-center text-xl text-blue-700 font-semibold focus:border-blue-500 focus:outline-none"
          style={{ 
            fontSize: '1.25rem',
            appearance: 'textfield',
            MozAppearance: 'textfield',
            WebkitAppearance: 'textfield'
          }}
          autoComplete='one-time-code'
        />
      ))}
    </div>
  );
};

export default OtpInputField;