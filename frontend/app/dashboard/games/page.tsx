"use client";
import Link from "next/link";
import { useState } from "react";
import { FaArrowLeft, FaArrowRight, FaGamepad, FaMusic, FaBrain } from "react-icons/fa";
import Navbar from "../../components/Navbar";

const games = [
  {
    image: "/infinityloopthumb.png",
    title: "Infinity Loop",
    description: "Connect the loops in this mind-bending puzzle game",
    href: "/dashboard/games/infinity-loop",
    icon: <FaBrain className="w-6 h-6" />,
    color: "from-blue-500 to-purple-600"
  },
  {
    image: "/snowboardthumb.png",
    title: "Alto Go",
    description: "Challenge your strategic thinking skills",
    href: "/dashboard/games/alto-go",
    icon: <FaGamepad className="w-6 h-6" />,
    color: "from-green-500 to-teal-600"
  },
  {
    image: "/rhythm-game-thumb.png", // You'll need to add this image
    title: "Rhythm Game",
    description: "Feel the beat and test your rhythm skills",
    href: "/dashboard/games/rhythm-game",
    icon: <FaMusic className="w-6 h-6" />,
    color: "from-pink-500 to-red-600"
  }
];

const Home = () => {
  const [currentGame, setCurrentGame] = useState(0);

  const handleNext = () => {
    setCurrentGame((prev) => (prev + 1) % games.length);
  };

  const handlePrev = () => {
    setCurrentGame((prev) => (prev - 1 + games.length) % games.length);
  };

  const currentGameData = games[currentGame];

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex flex-col items-center justify-center py-8 px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            Pick Your Game
          </h1>
          <p className="text-gray-400 text-lg max-w-md mx-auto">
            Choose from our collection of exciting games and start your adventure
          </p>
        </div>

        {/* Game Carousel */}
        <div className="relative flex items-center justify-center space-x-8 mb-8">
          {/* Previous Button */}
          <button 
            onClick={handlePrev}
            className="group relative w-14 h-14 rounded-full bg-gradient-to-r from-gray-700 to-gray-600 hover:from-gray-600 hover:to-gray-500 transition-all duration-300 flex items-center justify-center shadow-lg hover:shadow-xl transform hover:scale-110"
          >
            <FaArrowLeft className="text-white group-hover:text-gray-100 transition-colors duration-200" />
          </button>

          {/* Game Card */}
          <div className="relative group">
            <Link href={currentGameData.href}>
              <div className="relative w-80 h-80 rounded-2xl overflow-hidden shadow-2xl transform transition-all duration-500 hover:scale-105 hover:shadow-3xl">
                {/* Gradient Overlay */}
                <div className={`absolute inset-0 bg-gradient-to-t ${currentGameData.color} opacity-20 group-hover:opacity-30 transition-opacity duration-300 z-10`}></div>
                
                {/* Game Image */}
                <img
                  src={currentGameData.image}
                  alt={currentGameData.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                
                {/* Play Overlay */}
                {/* <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-300 flex items-center justify-center z-20"> */}
                  <div className="transform translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-full p-4">
                      <FaGamepad className="w-8 h-8 text-white" />
                    </div>
                  </div>
                {/* </div> */}
              </div>
            </Link>
          </div>

          {/* Next Button */}
          <button 
            onClick={handleNext}
            className="group relative w-14 h-14 rounded-full bg-gradient-to-r from-gray-700 to-gray-600 hover:from-gray-600 hover:to-gray-500 transition-all duration-300 flex items-center justify-center shadow-lg hover:shadow-xl transform hover:scale-110"
          >
            <FaArrowRight className="text-white group-hover:text-gray-100 transition-colors duration-200" />
          </button>
        </div>

        {/* Game Info Card */}
        <div className="bg-gray-800 bg-opacity-50 backdrop-blur-sm rounded-xl p-6 max-w-md mx-auto text-center border border-gray-700 shadow-xl">
          <div className="flex items-center justify-center mb-4">
            <div className={`bg-gradient-to-r ${currentGameData.color} rounded-full p-3`}>
              {currentGameData.icon}
            </div>
          </div>
          <h3 className="text-2xl font-bold text-white mb-2">{currentGameData.title}</h3>
          <p className="text-gray-300 mb-4">{currentGameData.description}</p>
          <Link href={currentGameData.href}>
            <button className={`bg-gradient-to-r ${currentGameData.color} text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-200`}>
              Play Now
            </button>
          </Link>
        </div>

        {/* Game Indicators */}
        <div className="flex space-x-3 mt-8">
          {games.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentGame(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentGame
                  ? 'bg-white shadow-lg scale-125'
                  : 'bg-gray-500 hover:bg-gray-400'
              }`}
            />
          ))}
        </div>

        {/* Game Stats */}
        <div className="flex space-x-8 mt-12 text-center">
          <div className="bg-gray-800 bg-opacity-50 rounded-lg p-4 backdrop-blur-sm border border-gray-700">
            <div className="text-2xl font-bold text-white">{games.length}</div>
            <div className="text-gray-400 text-sm">Games</div>
          </div>
          <div className="bg-gray-800 bg-opacity-50 rounded-lg p-4 backdrop-blur-sm border border-gray-700">
            <div className="text-2xl font-bold text-white">∞</div>
            <div className="text-gray-400 text-sm">Fun</div>
          </div>
          <div className="bg-gray-800 bg-opacity-50 rounded-lg p-4 backdrop-blur-sm border border-gray-700">
            <div className="text-2xl font-bold text-white">24/7</div>
            <div className="text-gray-400 text-sm">Available</div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;