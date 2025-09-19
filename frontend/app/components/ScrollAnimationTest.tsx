"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Brain,
  Users,
  Target,
  BookOpen,
  Video,
  MessageSquare,
  ArrowDown,
  Sparkles,
} from "lucide-react";

const ScrollAnimationTest = () => {
  const [visibleElements, setVisibleElements] = useState(new Set());
  const observerRef = useRef<IntersectionObserver | null>(null);
  const featureRef = useRef<HTMLBodyElement | null>(null);

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisibleElements((prev) => new Set([...prev, entry.target.id]));
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: "0px 0px -100px 0px",
      }
    );

    const elements = document.querySelectorAll("[data-animate]");
    elements.forEach((el) => observerRef.current?.observe(el));
    return () => observerRef.current?.disconnect();
  }, []);

  const features = [
    {
      icon: Brain,
      title: "AI-Powered Assessments",
      description:
        "Interactive quizzes, surveys, and screening tools powered by advanced AI to understand your unique needs",
      gradient: "from-blue-50 to-indigo-100",
      iconBg: "bg-blue-600",
      placeholderBg: "bg-blue-100",
      placeholderText: "text-blue-600",
      placeholder: "[Quiz Interface Placeholder]",
    },
    {
      icon: Target,
      title: "Personalized Plans",
      description:
        "Custom wellness plans tailored to your goals with progress tracking and intelligent recommendations",
      gradient: "from-purple-50 to-pink-100",
      iconBg: "bg-purple-600",
      placeholderBg: "bg-purple-100",
      placeholderText: "text-purple-600",
      placeholder: "[Progress Chart Placeholder]",
    },
    {
      icon: BookOpen,
      title: "Educational Library",
      description:
        "Extensive collection of articles, videos, and graphics curated by mental health experts",
      gradient: "from-green-50 to-emerald-100",
      iconBg: "bg-green-600",
      placeholderBg: "bg-green-100",
      placeholderText: "text-green-600",
      placeholder: "[Content Library Placeholder]",
    },
    {
      icon: Video,
      title: "Guided Sessions",
      description:
        "Meditation, exercise sessions, and ASMR content for relaxation and mindfulness",
      gradient: "from-orange-50 to-red-100",
      iconBg: "bg-orange-600",
      placeholderBg: "bg-orange-100",
      placeholderText: "text-orange-600",
      placeholder: "[Meditation Session Placeholder]",
    },
    {
      icon: Users,
      title: "Expert Consultations",
      description:
        "Connect with qualified mental health professionals through secure video consultations",
      gradient: "from-teal-50 to-cyan-100",
      iconBg: "bg-teal-600",
      placeholderBg: "bg-teal-100",
      placeholderText: "text-teal-600",
      placeholder: "[Video Call Interface Placeholder]",
    },
    {
      icon: MessageSquare,
      title: "Community Forum",
      description:
        "Stack Overflow-style community where users can ask questions and share experiences",
      gradient: "from-violet-50 to-purple-100",
      iconBg: "bg-violet-600",
      placeholderBg: "bg-violet-100",
      placeholderText: "text-violet-600",
      placeholder: "[Forum Interface Placeholder]",
    },
  ];

  const scrollToSection = () => {
    featureRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <section className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full opacity-20 animate-pulse"></div>
          <div
            className="absolute -bottom-40 -left-40 w-96 h-96 bg-blue-500 rounded-full opacity-20 animate-pulse"
            style={{ animationDelay: "1s" }}
          ></div>
          <div
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-pink-500 rounded-full opacity-10 animate-spin"
            style={{ animationDuration: "20s" }}
          ></div>
        </div>

        <div className="relative z-10 text-center px-4">
          <div className="animate-bounce mb-8">
            <Sparkles className="h-16 w-16 text-yellow-300 mx-auto" />
          </div>
          <h1 className="text-6xl font-bold mb-6 animate-fade-in">
            Mental Health{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-yellow-400">
              Revolution
            </span>
          </h1>
          <p
            className="text-xl mb-12 opacity-90 animate-fade-in"
            style={{ animationDelay: "0.5s" }}
          >
            Discover how scroll animations bring your features to life
          </p>

          <button
            onClick={scrollToSection}
            className="group bg-white text-gray-900 px-8 py-4 rounded-full font-semibold hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 animate-fade-in"
            style={{ animationDelay: "1s" }}
          >
            Explore Features
            <ArrowDown className="inline-block ml-2 h-5 w-5 group-hover:translate-y-1 transition-transform" />
          </button>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white rounded-full mt-2 animate-pulse"></div>
          </div>
        </div>
      </section>

      {/* Features Section with Scroll Animations */}
      <section className="py-24 bg-white" ref={featureRef}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header with Animation */}
          <div
            className={`text-center mb-16 transform transition-all duration-1000 ${
              visibleElements.has("features-header")
                ? "translate-y-0 opacity-100"
                : "translate-y-10 opacity-0"
            }`}
            data-animate
            id="features-header"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Comprehensive Well-being Tools
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Everything you need for your mental health journey, powered by AI
              and backed by experts
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const IconComponent = feature.icon;
              const isVisible = visibleElements.has(`feature-${index}`);

              return (
                <div
                  key={index}
                  id={`feature-${index}`}
                  data-animate
                  className={`bg-gradient-to-br ${
                    feature.gradient
                  } rounded-2xl p-8 hover:shadow-xl transition-all duration-700 transform ${
                    isVisible
                      ? "translate-y-0 opacity-100 scale-100"
                      : "translate-y-20 opacity-0 scale-95"
                  } hover:-translate-y-1 hover:scale-105`}
                  style={{
                    transitionDelay: `${index * 150}ms`,
                  }}
                >
                  {/* Icon with Animation */}
                  <div
                    className={`${
                      feature.iconBg
                    } rounded-full p-3 w-fit mb-6 transform transition-all duration-500 ${
                      isVisible ? "rotate-0 scale-100" : "rotate-12 scale-0"
                    }`}
                    style={{ transitionDelay: `${index * 150 + 200}ms` }}
                  >
                    <IconComponent className="h-8 w-8 text-white" />
                  </div>

                  {/* Content */}
                  <h3
                    className={`text-2xl font-bold text-gray-900 mb-4 transform transition-all duration-500 ${
                      isVisible
                        ? "translate-x-0 opacity-100"
                        : "translate-x-10 opacity-0"
                    }`}
                    style={{ transitionDelay: `${index * 150 + 300}ms` }}
                  >
                    {feature.title}
                  </h3>

                  <p
                    className={`text-gray-600 mb-6 transform transition-all duration-500 ${
                      isVisible
                        ? "translate-x-0 opacity-100"
                        : "translate-x-10 opacity-0"
                    }`}
                    style={{ transitionDelay: `${index * 150 + 400}ms` }}
                  >
                    {feature.description}
                  </p>

                  {/* Placeholder with Animation */}
                  <div
                    className={`${
                      feature.placeholderBg
                    } rounded-lg h-32 flex items-center justify-center transform transition-all duration-500 ${
                      isVisible ? "scale-100 opacity-100" : "scale-90 opacity-0"
                    }`}
                    style={{ transitionDelay: `${index * 150 + 500}ms` }}
                  >
                    <span
                      className={`${feature.placeholderText} font-semibold`}
                    >
                      {feature.placeholder}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Demo Section - Different Animation Types */}
      <section className="py-24 bg-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            className={`text-center mb-16 transform transition-all duration-1000 ${
              visibleElements.has("demo-header")
                ? "translate-y-0 opacity-100"
                : "translate-y-10 opacity-0"
            }`}
            data-animate
            id="demo-header"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Animation Techniques
            </h2>
            <p className="text-xl text-gray-600">
              Different scroll animation patterns you can use
            </p>
          </div>

          <div className="space-y-16">
            {/* Slide from Left */}
            <div
              className={`flex items-center space-x-8 transform transition-all duration-1000 ${
                visibleElements.has("slide-left")
                  ? "translate-x-0 opacity-100"
                  : "-translate-x-20 opacity-0"
              }`}
              data-animate
              id="slide-left"
            >
              <div className="bg-blue-500 rounded-2xl p-8 flex-1">
                <h3 className="text-2xl font-bold text-white mb-4">
                  Slide from Left
                </h3>
                <p className="text-blue-100">
                  This element slides in from the left when it comes into view.
                </p>
              </div>
            </div>

            {/* Slide from Right */}
            <div
              className={`flex items-center justify-end space-x-8 transform transition-all duration-1000 ${
                visibleElements.has("slide-right")
                  ? "translate-x-0 opacity-100"
                  : "translate-x-20 opacity-0"
              }`}
              data-animate
              id="slide-right"
            >
              <div className="bg-green-500 rounded-2xl p-8 flex-1">
                <h3 className="text-2xl font-bold text-white mb-4">
                  Slide from Right
                </h3>
                <p className="text-green-100">
                  This element slides in from the right with a different timing.
                </p>
              </div>
            </div>

            {/* Scale Up */}
            <div
              className={`text-center transform transition-all duration-1000 ${
                visibleElements.has("scale-up")
                  ? "scale-100 opacity-100"
                  : "scale-75 opacity-0"
              }`}
              data-animate
              id="scale-up"
            >
              <div className="bg-purple-500 rounded-2xl p-8 inline-block">
                <h3 className="text-2xl font-bold text-white mb-4">
                  Scale Animation
                </h3>
                <p className="text-purple-100">
                  This element scales up from 75% to 100% size.
                </p>
              </div>
            </div>

            {/* Rotate and Fade */}
            <div
              className={`text-center transform transition-all duration-1000 ${
                visibleElements.has("rotate-fade")
                  ? "rotate-0 opacity-100"
                  : "rotate-12 opacity-0"
              }`}
              data-animate
              id="rotate-fade"
            >
              <div className="bg-pink-500 rounded-2xl p-8 inline-block">
                <h3 className="text-2xl font-bold text-white mb-4">
                  Rotate Animation
                </h3>
                <p className="text-pink-100">
                  This element rotates into position while fading in.
                </p>
              </div>
            </div>

            {/* Staggered Children */}
            <div
              className={`transform transition-all duration-1000 ${
                visibleElements.has("staggered-parent")
                  ? "translate-y-0 opacity-100"
                  : "translate-y-10 opacity-0"
              }`}
              data-animate
              id="staggered-parent"
            >
              <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">
                Staggered Animation
              </h3>
              <div className="grid md:grid-cols-3 gap-6">
                {[1, 2, 3].map((item, idx) => (
                  <div
                    key={item}
                    className={`bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl p-6 transform transition-all duration-700 ${
                      visibleElements.has("staggered-parent")
                        ? "translate-y-0 opacity-100"
                        : "translate-y-8 opacity-0"
                    }`}
                    style={{
                      transitionDelay: `${idx * 200 + 300}ms`,
                    }}
                  >
                    <div className="text-white font-bold text-lg">
                      Item {item}
                    </div>
                    <p className="text-yellow-100">
                      Each child animates with a delay
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Customization Guide */}
      <section className="py-24 bg-gray-900 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            className={`text-center mb-16 transform transition-all duration-1000 ${
              visibleElements.has("guide-header")
                ? "translate-y-0 opacity-100"
                : "translate-y-10 opacity-0"
            }`}
            data-animate
            id="guide-header"
          >
            <h2 className="text-4xl font-bold mb-4">Customization Guide</h2>
            <p className="text-xl text-gray-300">
              Learn how to create and customize scroll animations
            </p>
          </div>

          <div
            className={`space-y-8 transform transition-all duration-1000 ${
              visibleElements.has("guide-content")
                ? "translate-y-0 opacity-100"
                : "translate-y-10 opacity-0"
            }`}
            data-animate
            id="guide-content"
            style={{ transitionDelay: "300ms" }}
          >
            <div className="bg-gray-800 rounded-xl p-6">
              <h3 className="text-xl font-bold mb-4 text-blue-400">
                1. Basic Setup
              </h3>
              <div className="bg-gray-700 rounded-lg p-4 font-mono text-sm">
                <div className="text-green-400">
                  // Add data-animate attribute and unique id
                </div>
                <div className="text-white">
                  &lt;div data-animate id="my-element"&gt;
                </div>
              </div>
            </div>

            <div className="bg-gray-800 rounded-xl p-6">
              <h3 className="text-xl font-bold mb-4 text-purple-400">
                2. Animation Classes
              </h3>
              <div className="bg-gray-700 rounded-lg p-4 font-mono text-sm space-y-2">
                <div>
                  <span className="text-blue-300">translate-y-0</span>{" "}
                  <span className="text-gray-400">// Normal position</span>
                </div>
                <div>
                  <span className="text-blue-300">translate-y-10</span>{" "}
                  <span className="text-gray-400">
                    // Start position (hidden)
                  </span>
                </div>
                <div>
                  <span className="text-blue-300">opacity-100</span>{" "}
                  <span className="text-gray-400">// Visible</span>
                </div>
                <div>
                  <span className="text-blue-300">opacity-0</span>{" "}
                  <span className="text-gray-400">// Hidden</span>
                </div>
                <div>
                  <span className="text-blue-300">duration-1000</span>{" "}
                  <span className="text-gray-400">// Animation speed</span>
                </div>
              </div>
            </div>

            <div className="bg-gray-800 rounded-xl p-6">
              <h3 className="text-xl font-bold mb-4 text-green-400">
                3. Intersection Observer Options
              </h3>
              <div className="bg-gray-700 rounded-lg p-4 font-mono text-sm space-y-2">
                <div>
                  <span className="text-yellow-300">threshold: 0.1</span>{" "}
                  <span className="text-gray-400">
                    // Trigger when 10% visible
                  </span>
                </div>
                <div>
                  <span className="text-yellow-300">
                    rootMargin: '0px 0px -100px 0px'
                  </span>{" "}
                  <span className="text-gray-400">// Trigger earlier</span>
                </div>
              </div>
            </div>

            <div className="bg-gray-800 rounded-xl p-6">
              <h3 className="text-xl font-bold mb-4 text-pink-400">
                4. Custom Delays
              </h3>
              <div className="bg-gray-700 rounded-lg p-4 font-mono text-sm">
                <div className="text-white">
                  style=&#123;&#123;transitionDelay: `$&#123;index *
                  150&#125;ms`&#125;&#125;
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 1s ease-out forwards;
          opacity: 0;
        }
      `}</style>
    </div>
  );
};

export default ScrollAnimationTest;
