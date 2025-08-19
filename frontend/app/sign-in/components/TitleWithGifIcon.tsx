import React from "react";

const TitleWithGifIcon = () => {
  return (
    <div className="flex items-center justify-center space-x-0">
      <div className="relative w-32 h-32 animate-bounce">
        <embed
          src={"https://giphy.com/embed/F4BsuMCyVLvKQ7JwNh"}
          className="absolute top-0 left-0 w-full h-full border-none"
        />
      </div>
      <h1 className="font-extrabold text-purple-700 text-2xl  animate-pulse">{"Mindigo"}</h1>
    </div>
  );
};

export default TitleWithGifIcon;
