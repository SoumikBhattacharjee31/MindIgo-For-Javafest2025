import React from "react";

const Trident = () => {
  return (
    <div className="relative flex items-center justify-center w-full">
      <div className="absolute w-1/2 border-2 border-white right-[0px] transform bottom-[-2px]" />
      <div className="absolute w-full h-fit border-2 border-white rounded-full rotate-90" />
    </div>
  );
};

export default Trident;
