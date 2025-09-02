'use client'

import { useEffect, useRef } from "react";

interface BackgroundAudioProps {
  srcUrl: string;
  muted: boolean;
  loop?: boolean;
  reset?: boolean;
};

const BackgroundAudio = ({
  srcUrl,
  muted,
  loop = false,
  reset = false,
}: BackgroundAudioProps) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audioElement = audioRef.current;
    if (!audioElement) return;

    audioElement.muted = muted;
    
    if (reset) {
      audioElement.currentTime = 0; 
    }

    if (muted) {
      audioElement.pause();
    } else {
      audioElement.play().catch((error) => {
        console.error("Error playing audio:", error);
      });
    }
  }, [muted, reset]);

  return <audio 
          ref={audioRef} 
          src={srcUrl} 
          loop={loop} 
          />;
};

export default BackgroundAudio;
