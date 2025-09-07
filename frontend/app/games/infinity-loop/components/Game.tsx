import React, { useState, useEffect } from "react";
import ButtonTable from "./ButtonTable";
import BackButton from "./BackButton";

interface GameProps {
  setCurPage: (curPage: string) => void;
  sound: boolean;
  arr: Array<Array<Array<number>>>;
  setArr: (arr: Array<Array<Array<number>>>) => void;
}

const Game: React.FC<GameProps> = ({ setCurPage, sound, arr, setArr }) => {
  return (
    <div className="flex items-center justify-center">
      <BackButton setCurPage={setCurPage} sound={sound} />
      <ButtonTable sound={sound} arr={arr} setArr={setArr} />
    </div>
  );
};

export default Game;
