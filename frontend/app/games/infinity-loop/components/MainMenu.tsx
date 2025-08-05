import Link from "next/link";
import React from "react";
import axios from "axios";

interface MainMenuProps {
  setCurPage: (curPage: string) => void;
  sound: boolean;
  setArr: (arr: Array<Array<Array<number>>>)=>void
}

const MainMenu: React.FC<MainMenuProps> = ({ setCurPage, sound, setArr }) => {

  const [loading,setLoading] = React.useState<boolean>(false);
  const fetchData = async (e: React.FormEvent) => {
    e.preventDefault();    
    try {
      const response = await axios.get('http://localhost:8080/api/v1/game/infinity-loop/get-grid', {
        withCredentials: true
      });
      if (response.status === 200) {
        setArr(response.data.grid);
        console.log(response.data);
      } else {
        console.error('Failed to fetch data');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const clickSound = () => {
    const audio = new Audio("/old-computer-click-152513.mp3");
    if(sound)
      audio.play();
  };
  const handlePlay = async (e: React.FormEvent) => {
    setLoading(true);
    await fetchData(e);
    clickSound();
    setCurPage("game");
    setLoading(false);
  };
  const handleHelp = () => {
    clickSound();
    setCurPage("help");
  };
  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <div className="text-center">
        <h1 className="text-5xl font-bold mb-8 text-white">Infinity Loop</h1>
        <div className="flex flex-col space-y-4">
            {loading ? (
              <div className="animate-spin h-5 w-5 border-t-2 border-b-2 border-blue-700 rounded-full mr-2"></div> // Loading spinner example
            ) : (
              <button className="btn btn-primary" onClick={handlePlay}>
                Play
              </button>
            )}
          
          <button className="btn btn-secondary" onClick={handleHelp}>
            Help
          </button>
          <Link href="/games">
            <button className=" w-full btn btn-accent" onClick={clickSound}>
              Exit
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default MainMenu;
