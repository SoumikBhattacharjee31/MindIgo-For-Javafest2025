import React from "react";

const Hero = () => {
  return (
    <div className="hero min-h-screen bg-inherit">
      <div className="hero-content text-center">
        <div className="max-w-md text-white">
          <h1 className="text-5xl font-bold drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,0.8)]">
            Improve Your Mental Health
          </h1>
          <p className="py-6 drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,0.8)]">
            Join our community and access resources, tools, and support to
            enhance your mental well-being.
          </p>
          <button className="btn btn-primary">Get Started</button>
        </div>
      </div>
    </div>
  );
};

export default Hero;
