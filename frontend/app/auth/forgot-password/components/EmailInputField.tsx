import React from "react";

interface EmailInputFieldProps {
  setEmailId: (email: string) => void;
}

const EmailInputField: React.FC<EmailInputFieldProps> = ({ setEmailId }) => {
  return (
    <div>
      <label htmlFor="email-address" className="sr-only">
        Email address
      </label>
      <input
        id="email-address"
        name="email"
        type="email"
        required
        className="input input-bordered w-full px-3 py-2 mt-1 border rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
        placeholder="Email address"
        // value={email}
        onChange={(e) => setEmailId(e.target.value)}
      />
    </div>
  );
};

export default EmailInputField;
