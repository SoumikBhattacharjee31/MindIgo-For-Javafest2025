import React from "react";

const Plus = () => {
  return (
    <div className="relative flex items-center justify-center w-full">
      <div className="absolute w-full h-fit border-2 border-white rounded-full" />
      <div className="absolute w-full h-fit border-2 border-white rounded-full rotate-90" />
    </div>
  );
};

export default Plus;
