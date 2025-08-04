"use client";
import { useRef, useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "./components/Footer";
import Hero from "./components/Hero";
import MetaHead from "./components/MetaHead";
import Services from "./components/Services";
import Testimonial from "./components/Testimonial";
import Wavesvg from "./components/Wavesvg";
// import { useSpring, animated } from "react-spring";

import ServeyService from "./components/ServeyService";
import GameService from "./components/GameService";

import { scroller } from 'react-scroll';
import { useWheel } from "react-use-gesture";

const debounce = (func: (...args: any[]) => void, wait: number) => {
  let timeout: NodeJS.Timeout | null = null;

  return (...args: any[]) => {
    // console.log('hello');
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => {
      // console.log('world');
      func.apply(this, args);
    }, wait);
  };
}

const throttle = (func: (...args: any[]) => void, limit: number) => {
  let inThrottle: boolean;

  return function(this: any, ...args: any[]) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

export default function Home() {

  const [ curSec, setCurSec ] = useState(0);
  const sectionRefs = useRef<HTMLDivElement[]>([]);

  const getCurrentSection = () => {
    let currentSection = 0;
    let maxVisibleHeight = 0;
  
    sectionRefs.current.forEach((section, index) => {
      const rect = section.getBoundingClientRect();
      const visibleHeight = Math.min(rect.bottom, window.innerHeight) - Math.max(rect.top, 0);
      
      if (visibleHeight > maxVisibleHeight) {
        maxVisibleHeight = visibleHeight;
        currentSection = index;
      }
    });
  
    return currentSection;
  };
  
  

  const scrollToSection = debounce( (index: number) => {
    const curSec = getCurrentSection();
    
    if(index==1){
      index=(curSec+1)>=sectionRefs.current.length?sectionRefs.current.length-1:curSec+1;
      setCurSec(index);
    }
    else {
      index=curSec==0?0:curSec-1;
      setCurSec(index);
    }
    // console.log(index);
    if (sectionRefs.current[index]) {
      scroller.scrollTo(sectionRefs.current[index].id, {
        duration: 800,
        delay: 0,
        smooth: 'easeInOutQuart'
      });
    }
  },200);

  const bind = useWheel(({ direction }) => {
    if (direction[1] > 0) {
      scrollToSection(1); // Adjust index to your need
    } else if (direction[1] < 0) {
      scrollToSection(0); // Adjust index to your need
    }
  });
  
  return (
    <div {...bind()} className="bg-base-200 text-base-content min-h-screen">
      <MetaHead />

      <Navbar />
      <Wavesvg />
      <div id="section1" ref={(el) => {el && sectionRefs.current.push(el);}}>
        <Hero />
      </div>
      <div id="section2" ref={(el) => {el && sectionRefs.current.push(el);}}>
        <ServeyService/>
      </div>
      <div id="section3" ref={(el) => {el && sectionRefs.current.push(el);}}>
        <GameService/>
      </div>
      <div id="section4" ref={(el) => {el && sectionRefs.current.push(el);}}>
        <Services />
      </div>
      <div id="section5" ref={(el) => {el && sectionRefs.current.push(el);}} className="relative">
        <Testimonial />
      </div>
      <div id="section6" ref={(el) => {el && sectionRefs.current.push(el);}} className="relative">
        <Footer />
      </div>
    </div>
  );
}
