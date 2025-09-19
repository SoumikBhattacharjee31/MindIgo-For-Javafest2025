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
import FeatureCard from "./FeatureCard";

const FeaturesSection = () => {
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

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              return (
                <FeatureCard
                  key={index}
                  index={index}
                  icon={feature.icon}
                  title={feature.title}
                  description={feature.description}
                  gradient={feature.gradient}
                  iconBg={feature.iconBg}
                  placeholderBg={feature.placeholderBg}
                  placeholderText={feature.placeholderText}
                  placeholder={feature.placeholder}
                  isVisible={visibleElements.has(`feature-${index}`)}
                />
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
};

export default FeaturesSection;
