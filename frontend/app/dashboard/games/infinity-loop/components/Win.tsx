import React from "react";

const Win = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <div className="text-center">
        <h1 className="text-5xl font-bold mb-8 text-white">You Won</h1>
        <div className="flex flex-col space-y-4">
          <embed
            src={"/bigbrain.gif"}
            className=" top-0 left-0 w-full h-full border-none"
          />
        </div>
      </div>
    </div>
  );
};

export default Win;
