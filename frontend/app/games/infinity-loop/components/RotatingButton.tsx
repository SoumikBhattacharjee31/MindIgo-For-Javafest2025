"use client";

import { useState } from "react";
import CirclewithLine from "./CirclewithLine";
import Line from "./Line";
import Plus from "./Plus";
import Curve from "./Curve";
import Trident from "./Trident";

interface RotatingButtonProps {
  buttonType: number;
  state: number;
  winCount: number;
  winLim: number;
  row: number;
  col: number;
  setWinCount: (winCount: number) => void;
  checkWin: () => void;
  newWinCount: (buttonType: number, rotateState: number, row: number, col: number) => number;
  setArrVal: (row: number, col: number, value: number) => void;
  sound:boolean;
}

const RotatingButton: React.FC<RotatingButtonProps> = ({
  buttonType,
  state,
  winCount,
  winLim,
  row,
  col,
  setWinCount,
  checkWin,
  newWinCount,
  setArrVal,
  sound
}) => {
  const [rotate, setRotate] = useState(state);

  const handleClick = () => {
    const nextRotate = (rotate + 1) % (buttonType == 0 ? 2 : 4);
    const curWinCount = winCount+newWinCount(buttonType,rotate,row,col);
    setWinCount(curWinCount);
    setArrVal(row,col,nextRotate);
    setRotate(nextRotate);
    if(curWinCount==winLim) checkWin();
    const audio = new Audio("/click-151673.mp3");
    if(sound)
      audio.play();
  };

  const rotateState = () => {
    switch (rotate) {
      case 1:
        return "rotate-90";
      case 2:
        return "rotate-180";
      case 3:
        return "-rotate-90";
      default:
        return "";
    }
  };

  const getButtonType = (buttonType: number) => {
    switch (buttonType) {
      case 0:
        return <Line />;
      case 1:
        return <CirclewithLine />;
      case 2:
        return <Curve />;
      case 3:
        return <Trident />;
      case 4:
        return <Plus />;
      default:
        return <></>;
    }
  };

  return (
    <div>
      <button
        className={`btn btn-primary bg-inherit border-hidden ${rotateState()} transition-transform duration-300 aspect-square rounded-full p-0`}
        onClick={handleClick}
      >
        {getButtonType(buttonType)}
      </button>
    </div>
  );
};

export default RotatingButton;
