import React from "react";

interface NameInputFieldProps {
  setName: (name: string) => void;
}

const NameInputField: React.FC<NameInputFieldProps> = ({ setName }) => {
  return (
    <div className="form-control">
      <input
        type="text"
        id="name"
        className="input input-bordered w-full h-10"
        placeholder="Name"
        onChange={(event) => setName(event.target.value)}
        required
      />
    </div>
  );
};

export default NameInputField;
