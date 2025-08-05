import React from "react";
import style from "../style.module.css";

const Wavesvg = () => {
  return (
    <div className="top-0 w-full h-[40rem] wave-container absolute">
        <img src="pexels-belle-co-99483-1000445.jpg" alt="Wave Shaped Image" className=" bg-inherit wave-image object-cover overflow-hidden h-[35rem] w-full"/>
        <svg className={style.wave} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320">
            <path fill="#F3F4F6" fillOpacity="1" d="M0,224L48,202.7C96,181,192,139,288,138.7C384,139,480,181,576,202.7C672,224,768,224,864,213.3C960,203,1056,181,1152,154.7C1248,128,1344,96,1392,80L1440,64L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
        </svg>
    </div>
  );
};

export default Wavesvg;
