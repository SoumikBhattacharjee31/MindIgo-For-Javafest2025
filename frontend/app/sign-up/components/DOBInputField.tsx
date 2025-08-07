import React from "react";

interface DOBInputFieldProps {
  setDOB: (dob: string) => void;
}

const DOBInputField: React.FC<DOBInputFieldProps> = ({ setDOB }) => {
  return (
    <div className="form-control">
      <input
        type="date"
        id="dob"
        className="input input-bordered w-full h-10"
        placeholder="Date of Birth"
        onChange={(event) => setDOB(event.target.value)}
      />
    </div>
  );
};

export default DOBInputField;
