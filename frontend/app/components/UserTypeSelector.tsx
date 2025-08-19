import React from 'react';

interface UserTypeSelectorProps {
  userType: string;
  setUserType: (type: string) => void;
}

const UserTypeSelector: React.FC<UserTypeSelectorProps> = ({ userType, setUserType }) => {
  return (
    <div className="w-full mb-6">
      <div className="text-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-1">Welcome!</h3>
        <p className="text-sm text-gray-600">Choose your account type to continue</p>
      </div>
      
      <div className="flex flex-col gap-3 items-center">
        {/* Client Option */}
        <label 
          className={`w-1/2 flex-1 relative cursor-pointer group transition-all duration-300 ${
            userType === "CLIENT" 
              ? "transform scale-105" 
              : "hover:transform hover:scale-102"
          }`}
        >
          <input
            type="radio"
            name="userType"
            value="CLIENT"
            checked={userType === "CLIENT"}
            onChange={(e) => setUserType(e.target.value)}
            className="sr-only"
          />
          <div className={`
            relative p-4 rounded-xl border-2 transition-all duration-300
            ${userType === "CLIENT"
              ? "border-blue-500 bg-blue-50 shadow-lg shadow-blue-100"
              : "border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-25 hover:shadow-md"
            }
          `}>
            <div className="text-center">
              <div className={`
                w-8 h-8 mx-auto mb-2 rounded-full flex items-center justify-center transition-all duration-300
                ${userType === "CLIENT"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-100 text-gray-600 group-hover:bg-blue-100 group-hover:text-blue-600"
                }
              `}>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h4 className={`font-semibold text-sm mb-1 transition-colors duration-300 ${
                userType === "CLIENT" ? "text-blue-700" : "text-gray-800"
              }`}>
                Client
              </h4>
              <p className={`text-xs transition-colors duration-300 ${
                userType === "CLIENT" ? "text-blue-600" : "text-gray-500"
              }`}>
                Seeking counseling
              </p>
            </div>
            
            {/* Selection indicator */}
            {userType === "CLIENT" && (
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center animate-pulse">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            )}
          </div>
        </label>

        {/* Counselor Option */}
        <label 
          className={`w-1/2 flex-1 relative cursor-pointer group transition-all duration-300 ${
            userType === "COUNSELOR" 
              ? "transform scale-105" 
              : "hover:transform hover:scale-102"
          }`}
        >
          <input
            type="radio"
            name="userType"
            value="COUNSELOR"
            checked={userType === "COUNSELOR"}
            onChange={(e) => setUserType(e.target.value)}
            className="sr-only"
          />
          <div className={`
            relative p-4 rounded-xl border-2 transition-all duration-300
            ${userType === "COUNSELOR"
              ? "border-emerald-500 bg-emerald-50 shadow-lg shadow-emerald-100"
              : "border-gray-200 bg-white hover:border-emerald-300 hover:bg-emerald-25 hover:shadow-md"
            }
          `}>
            <div className="text-center">
              <div className={`
                w-8 h-8 mx-auto mb-2 rounded-full flex items-center justify-center transition-all duration-300
                ${userType === "COUNSELOR"
                  ? "bg-emerald-500 text-white"
                  : "bg-gray-100 text-gray-600 group-hover:bg-emerald-100 group-hover:text-emerald-600"
                }
              `}>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h4 className={`font-semibold text-sm mb-1 transition-colors duration-300 ${
                userType === "COUNSELOR" ? "text-emerald-700" : "text-gray-800"
              }`}>
                Counselor
              </h4>
              <p className={`text-xs transition-colors duration-300 ${
                userType === "COUNSELOR" ? "text-emerald-600" : "text-gray-500"
              }`}>
                Professional therapist
              </p>
            </div>
            
            {/* Selection indicator */}
            {userType === "COUNSELOR" && (
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center animate-pulse">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            )}
          </div>
        </label>
      </div>
      
      {/* Subtle animation indicator */}
      <div className="mt-3 text-center">
        <div className={`inline-flex items-center text-xs transition-all duration-500 ${
          userType ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
        }`}>
          <div className={`w-2 h-2 rounded-full mr-2 ${
            userType === "CLIENT" ? "bg-blue-500" : "bg-emerald-500"
          }`}></div>
          <span className="text-gray-600">
            {userType === "CLIENT" ? "Ready to find support" : "Ready to help others"}
          </span>
        </div>
      </div>
    </div>
  );
};

export default UserTypeSelector;