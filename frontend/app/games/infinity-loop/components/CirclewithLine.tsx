import React from "react";

const CirclewithLine = () => {
  return (
    <div className="relative flex items-center justify-center w-full">
      <div className="p-[30%] border-4 border-white rounded-full aspect-square relative" />
      <div className="absolute w-2 h-1 bg-white top-1/2 right-[-1px] transform -translate-y-1/2" />
    </div>
  );
};

export default CirclewithLine;
