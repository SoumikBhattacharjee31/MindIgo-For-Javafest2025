import React from "react";

interface GenderInputFieldProps {
  setGender: (gender: string) => void;
  gender: string;
}

const GenderInputField: React.FC<GenderInputFieldProps> = ({ gender, setGender }) => {
  return (
    <div className="form-control">
      <select
        id="gender"
        className="select select-bordered w-full h-10"
        value={gender}
        onChange={(event) => setGender(event.target.value)}
      >
        <option value="" disabled>
          Select Gender
        </option>
        <option value="MALE">Male</option>
        <option value="FEMALE">Female</option>
        <option value="OTHERS">Others</option>
      </select>
    </div>
  );
};

export default GenderInputField;
