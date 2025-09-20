import React from "react";

interface PasswordInputFieldProps {
  setPassword: (password: string) => void;
}

const PasswordInputField: React.FC<PasswordInputFieldProps> = ({ setPassword }) => {
  return (
    <div>
      <label htmlFor="password" className="sr-only">
        Password
      </label>
      <input
        id="password"
        name="password"
        type="password"
        required
        className="input input-bordered w-full px-3 py-2 mt-1 border rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
        placeholder="Password"
        // value={Password}
        onChange={(e) => setPassword(e.target.value)}
      />
    </div>
  );
};

export default PasswordInputField;
