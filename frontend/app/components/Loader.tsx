import React from "react";

interface LoaderProps {
  text?: string;
}

const Loader: React.FC<LoaderProps> = ({ text = "Loading..." }) => {
  return (
    <div className="flex items-center justify-center py-8">
      <div className="flex items-center space-x-3">
        <div className="w-6 h-6 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
        
        <span className="text-gray-600 text-sm">{text}</span>
      </div>
    </div>
  );
};

export default Loader;
