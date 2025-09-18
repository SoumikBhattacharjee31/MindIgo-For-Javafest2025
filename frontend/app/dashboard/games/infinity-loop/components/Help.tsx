import React from "react";
import ButtonTable from "./ButtonTable";
import BackButton from "./BackButton";

interface HelpProps {
  setCurPage: (curPage: string) => void;
  sound: boolean;
}

const Help: React.FC<HelpProps> = ({ setCurPage, sound }) => {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <BackButton setCurPage={setCurPage} sound={sound} />
      Match corresponding figures so that they create loops and there no
      endpoint will be left
    </div>
  );
};

export default Help;
