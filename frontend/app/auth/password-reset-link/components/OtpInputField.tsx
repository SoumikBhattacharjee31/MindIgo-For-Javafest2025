"use client"
import React, { useState } from 'react';

interface OtpInputFieldProps {
  setOtpMain: (otpMain: Array<number>) => void,
  length: number
}

const length = 6;
const OtpInputField: React.FC<OtpInputFieldProps> = ({ setOtpMain }) => {
  const [otp, setOtp] = useState(Array(length).fill(''));

  const handleChange = (e:React.ChangeEvent<HTMLInputElement>, index:number) => {
    const { value } = e.target;
    if (/[^0-9]/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setOtpMain(newOtp);
    // onChange(newOtp.join(''));

    if (value && index < length - 1) {
      const nextSibling = document.getElementById(`otp-input-${index + 1}`);
      if (nextSibling) {
        nextSibling.focus();
      }
    }
  };

  return (
    <div className="flex space-x-2 w-full justify-center">
      {otp.map((_, index) => (
        <input
          key={index}
          id={`otp-input-${index}`}
          type="text"
          maxLength={1}
          value={otp[index]}
          onChange={(e) => handleChange(e, index)}
          className="input input-bordered w-12 text-center"
          autoComplete='off'
        />
      ))}
    </div>
  );
};

export default OtpInputField;
