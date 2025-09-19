// components/BackgroundVideo.tsx
import React from "react";

const BackgroundVideo: React.FC = () => {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <video autoPlay loop muted className="min-w-full min-h-full object-cover">
        <source src="/background_infinity_loop.mov" type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    </div>
  );
};

export default BackgroundVideo;
