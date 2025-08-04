import React from "react";

interface GenderInputFieldProps {
  setGender: (gender: string) => void;
}

const GenderInputField: React.FC<GenderInputFieldProps> = ({ setGender }) => {
  return (
    <div className="form-control">
      <select
        id="gender"
        className="select select-bordered w-full h-10"
        onChange={(event) => setGender(event.target.value)}
      >
        <option value="" disabled selected>
          Select Gender
        </option>
        <option value="male">Male</option>
        <option value="female">Female</option>
        <option value="others">Others</option>
      </select>
    </div>
  );
};

export default GenderInputField;
