// components/BackButton.tsx
import React from "react";

interface BackButtonProps {
  setCurPage: (curPage: string) => void;
  sound:boolean;
}

const BackButton: React.FC<BackButtonProps> = ({ setCurPage, sound}) => {
  const handleBack = () => {
    const audio = new Audio("/old-computer-click-152513.mp3");
    if(sound)
      audio.play();
    setCurPage("menu");
    
  };

  return (
    <button
      onClick={handleBack}
      className="absolute top-4 left-4 bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
    >
      Back
    </button>
  );
};

export default BackButton;
