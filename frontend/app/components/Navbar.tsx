"use client";
import React from "react";
import Meditate from "@/public/Meditate.png";
import Image from "next/image";
import { useRouter } from "next/navigation";
import useStore from "@/app/store/store";
import { use } from "matter";
const Navbar = () => {
  const router = useRouter();
  const { user, setUser } = useStore();
  return (
    <nav className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-2">
            <Image
              src={Meditate}
              alt="Logo"
              className="h-8 w-8 shadow-md rounded-full"
            />
            <span className="text-2xl font-bold text-gray-800">Mindigo</span>
          </div>
          <div className="hidden md:flex items-center space-x-8">
            <a
              href="#features"
              className="text-gray-600 hover:text-indigo-600 transition-colors"
            >
              Features
            </a>
            <a
              href="#about"
              className="text-gray-600 hover:text-indigo-600 transition-colors"
            >
              About
            </a>
            <a
              href="#contact"
              className="text-gray-600 hover:text-indigo-600 transition-colors"
            >
              Contact
            </a>
            <button
              onClick={() => {
                if (user) {
                  router.push("/dashboard");
                } else {
                  router.push("/auth/sign-in");
                }
              }}
              className="bg-indigo-600 text-white px-6 py-2 rounded-full hover:bg-indigo-700 transition-colors"
            >
              Get Started
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
