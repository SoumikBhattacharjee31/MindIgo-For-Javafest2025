"use client";
import React from "react";
import MainMenu from "./components/MainMenu";
import { useState } from "react";
import Game from "./components/Game";
import Help from "./components/Help";
import BackgroundVideo from "./components/BackgroundVideo";
import MusicButton from "./components/MusicButton";

const Home = () => {
  const [sound, setSound] = useState(true);
  const [curPage, setCurPage] = useState("menu");
  const [arr, setArr] = useState<number[][][] | any>([]);

  const getCurrentPage = () => {
    switch (curPage) {
      case "menu":
        return (
          <MainMenu setCurPage={setCurPage} sound={sound} setArr={setArr} />
        );
      case "game":
        return (
          <Game
            setCurPage={setCurPage}
            sound={sound}
            arr={arr}
            setArr={setArr}
          />
        );
      case "help":
        return <Help setCurPage={setCurPage} sound={sound} />;
      default:
        return <></>;
    }
  };
  return (
    <div className="flex items-center justify-center min-h-screen">
      <BackgroundVideo />
      <div className="z-10">
        <MusicButton isPlaying={sound} setIsPlaying={setSound} />
        {getCurrentPage()}
      </div>
    </div>
  );
};

export default Home;
