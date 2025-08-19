import React from 'react';

interface UserTypeSelectorProps {
  userType: string;
  setUserType: (type: string) => void;
}

const UserTypeSelector: React.FC<UserTypeSelectorProps> = ({ userType, setUserType }) => {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        I am a:
      </label>
      <div className="flex space-x-4">
        <label className="flex items-center">
          <input
            type="radio"
            name="userType"
            value="CLIENT"
            checked={userType === "CLIENT"}
            onChange={(e) => setUserType(e.target.value)}
            className="mr-2 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-gray-700">Client (seeking counseling)</span>
        </label>
        <label className="flex items-center">
          <input
            type="radio"
            name="userType"
            value="COUNSELOR"
            checked={userType === "COUNSELOR"}
            onChange={(e) => setUserType(e.target.value)}
            className="mr-2 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-gray-700">Counselor</span>
        </label>
      </div>
    </div>
  );
};

export default UserTypeSelector;