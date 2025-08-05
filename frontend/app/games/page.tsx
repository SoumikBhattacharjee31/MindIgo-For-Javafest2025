"use client"
import Link from 'next/link';
import { useState } from 'react';
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa';
import Navbar from '../components/Navbar';

const images = [
  '/infinityloopthumb.png',
  '/bigbrain.gif'
];

const Home = () => {
  const [currentImage, setCurrentImage] = useState(0);

  const handleNext = () => {
    setCurrentImage((prevImage) => (prevImage + 1) % images.length);
  };

  const handlePrev = () => {
    setCurrentImage((prevImage) => (prevImage - 1 + images.length) % images.length);
  };

  const handleHref = () => {
    switch (currentImage) {
      case 0: return "/games/infinity-loop";
      case 1: return "/games/alto-go";
      default: return "#";
    }
  }

  return (
    <>
    <Navbar/>
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <h1 className="text-4xl font-bold mb-8">Pick your game</h1>
      <div className="flex items-center justify-center space-x-4">
        <button
          onClick={handlePrev}
          className="btn btn-circle btn-primary"
        >
          <FaArrowLeft />
        </button>
        <div className="w-64 h-64">
          <Link href={handleHref()}>
          <img
            src={images[currentImage]}
            alt="carousel"
            className="w-full h-full object-cover transition-transform duration-500 ease-in-out transform hover:scale-105"
          />
          </Link>
        </div>
        <button
          onClick={handleNext}
          className="btn btn-circle btn-primary"
        >
          <FaArrowRight />
        </button>
      </div>
    </div>
    </>
  );
};

export default Home;
