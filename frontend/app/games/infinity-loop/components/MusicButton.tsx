// components/MusicButton.tsx
import { useState, useRef, useEffect } from "react";
import { GiSoundOn } from "react-icons/gi";
import { GiSoundOff } from "react-icons/gi";

interface MusicButtonProps {
  isPlaying: boolean;
  setIsPlaying: (isPlaying: boolean) => void;
}

const MusicButton: React.FC<MusicButtonProps> = ({ isPlaying, setIsPlaying }) => {
  const [volume, setVolume] = useState(0.5);
  const [showSlider, setShowSlider] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const sliderTimeoutRef = useRef<number | null>(null);

  const toggleMusic = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
      const audio = new Audio("/old-computer-click-152513.mp3");
    if(!isPlaying)
        audio.play();
    }
  };

  const handleVolumeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(event.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  const handleMouseEnter = () => {
    if (sliderTimeoutRef.current) {
      clearTimeout(sliderTimeoutRef.current);
    }
    setShowSlider(true);
    setFadeOut(false);
  };

  const handleMouseLeave = () => {
    setFadeOut(true);
    sliderTimeoutRef.current = window.setTimeout(
      () => setShowSlider(false),
      300
    );
  };

  return (
    <div className="absolute bottom-8 right-4 flex flex-col items-center space-y-4">
      <div
        className="relative"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <button className="btn btn-primary" onClick={toggleMusic}>
          {isPlaying ? <GiSoundOn /> : <GiSoundOff />}
        </button>
        {showSlider && (
          <div
            className={`absolute right-0 top-full mt-2 transition-opacity duration-300 ${
              fadeOut ? "opacity-0" : "opacity-100"
            }`}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={handleVolumeChange}
              className="slider"
            />
          </div>
        )}
      </div>
      <audio autoPlay={true} loop={true} ref={audioRef} src="/perfect-beauty-191271.mp3" />
      
    </div>
  );
};

export default MusicButton;
