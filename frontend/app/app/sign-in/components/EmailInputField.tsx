import React from "react";

interface EmailInputFieldProps {
  setEmailId: (email: string) => void;
}

const EmailInputField: React.FC<EmailInputFieldProps> = ({ setEmailId }) => {
  return (
    <div className="form-control">
      <input
        type="email"
        id="email"
        className="input input-bordered w-full h-10"
        placeholder="Email"
        onChange={(event) => setEmailId(event.target.value)}
        required
      />
    </div>
  );
};

export default EmailInputField;
