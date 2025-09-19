import React from "react";

const ButtonTypeDivider: React.FC = () => {
  return (
    <div className="relative flex items-center justify-center py-1">
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t border-gradient-to-r from-transparent via-gray-200 to-transparent" />
      </div>
      <div className="relative bg-purple-50 px-6">
        <span className="text-sm text-gray-500 font-medium">
          or continue with
        </span>
      </div>
    </div>
  );
};
export default ButtonTypeDivider;
