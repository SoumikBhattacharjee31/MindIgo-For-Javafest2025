import React from "react";

const MeditationGif = () => {
  return (
    <div className="flex items-center justify-center ">
      <embed
        src={"/levitating_meditation.gif"}
        className="w-7/12 h-full border-none hidden md:flex"
      />
    </div>
  );
};

export default MeditationGif;
