"use client";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  AlignJustify,
  User,
  Settings,
  LogOut,
  Bell,
  HelpCircle,
  BarChart3,
  House,
  Gamepad2,
} from "lucide-react";
import { FaUserDoctor } from "react-icons/fa6";
import { GiMeditation } from "react-icons/gi";

interface SidebarItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  link: string;
}

const sidebarItems: SidebarItem[] = [
  { id: "home", label: "Home", icon: <House className="w-5 h-5" />, link: "/dashboard" },
  { id: "games", label: "Game", icon: <Gamepad2 className="w-5 h-5" />, link: "/dashboard/games" },
  { id: "counselor", label: "Counselor", icon: <FaUserDoctor className="w-5 h-5" />, link: "/dashboard/counselor" },
  { id: "mindfulness", label: "Mindfulness", icon: <GiMeditation className="w-5 h-5" />, link: "/dashboard/mindfulness" },
  { id: "analytics", label: "Analytics", icon: <BarChart3 className="w-5 h-5" />, link: "/dashboard/analytics" },
  { id: "profile", label: "Profile", icon: <User className="w-5 h-5" />, link: "/dashboard/profile" },
];

const dropdownItems = [
  { id: "notifications", label: "Notifications", icon: <Bell className="w-4 h-4" /> },
  { id: "settings", label: "Settings", icon: <Settings className="w-4 h-4" /> },
  { id: "help", label: "Help & Support", icon: <HelpCircle className="w-4 h-4" /> },
  { id: "logout", label: "Sign Out", icon: <LogOut className="w-4 h-4" /> },
];

const Sidebar = () => {
  const pathname = usePathname();
  const [activeSection, setActiveSection] = useState<string>("home");
  const [loading, setLoading] = useState<boolean>(true);
  const [showDropdown, setShowDropdown] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isActive = (id: string) => !loading && activeSection === id;

  // Decide active section based on pathname
  const decideSection = () => {
    const section = sidebarItems.find((item) => pathname === item.link)?.id || "home";
    setActiveSection(section);
  };

  // Handle outside click for dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    decideSection();
    setLoading(false);

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="flex flex-col items-center fixed h-full py-4">
      {/* Dropdown Trigger */}
      <div className="relative mb-4" ref={dropdownRef}>
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="w-12 h-12 flex items-center justify-center transition-all duration-300 ease-out hover:scale-105 group"
        >
          <AlignJustify className="w-5 h-5 text-indigo-600 group-hover:text-indigo-700 transition-all duration-200 group-hover:rotate-180" />
        </button>

        {/* Dropdown Menu */}
        {showDropdown && (
          <div className="absolute top-14 left-0 w-56 bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-indigo-100/50 py-3 z-50 animate-in slide-in-from-top-2 duration-200">
            {/* Header */}
            <div className="px-4 py-2 border-b border-indigo-50">
              <p className="text-sm font-semibold text-gray-800">MindfulSpace</p>
              <p className="text-xs text-gray-500">Mental Wellness Hub</p>
            </div>

            {/* Items */}
            <div className="py-2">
              {dropdownItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setShowDropdown(false)}
                  className={`w-full px-4 py-2.5 flex items-center text-left transition-all duration-200 ${
                    item.id === "logout"
                      ? "hover:bg-red-50 text-red-600 hover:text-red-700"
                      : "hover:bg-indigo-50/70 text-gray-700 hover:text-indigo-700"
                  }`}
                >
                  <span className="mr-3 opacity-70">{item.icon}</span>
                  <span className="text-sm font-medium">{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Navigation Items */}
      <nav className="flex flex-col items-center space-y-3 flex-1">
        {sidebarItems
          .filter((item) => item.id !== "profile")
          .map((item) => (
            <div key={item.id} className="flex relative group">
              <Link href={item.link}>
                <button
                  onClick={() => setActiveSection(item.id)}
                  className={`w-12 h-12 flex items-center justify-center rounded-full transition-all duration-300 ease-out relative overflow-hidden ${
                    isActive(item.id)
                      ? "bg-gradient-to-br from-indigo-100 to-blue-100 shadow-md scale-105"
                      : "bg-transparent hover:bg-gradient-to-br hover:from-indigo-50 hover:to-blue-50 hover:shadow-sm hover:scale-105"
                  }`}
                >
                  {/* Active Indicator */}
                  {isActive(item.id) && (
                    <span className="absolute -left-1 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-indigo-500 to-blue-500 rounded-r-full shadow-sm animate-pulse"></span>
                  )}

                  {/* Ripple Effect */}
                  <span className="absolute inset-0 bg-gradient-to-r from-indigo-300/20 to-blue-300/20 rounded-full scale-0 group-hover:scale-100 transition-transform duration-500 ease-out"></span>

                  {/* Icon */}
                  <span
                    className={`transition-all duration-200 z-10 group-hover:scale-110 ${
                      isActive(item.id) ? "text-indigo-700" : "text-indigo-400 group-hover:text-indigo-600"
                    }`}
                  >
                    {item.icon}
                  </span>
                </button>
              </Link>

              {/* Tooltip */}
              <div className="absolute left-full ml-4 px-3 py-2 bg-gray-900/90 backdrop-blur-sm text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap z-50 shadow-lg transform translate-x-2 group-hover:translate-x-0">
                {item.label}
                <div className="absolute -left-1 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-gray-900/90 rotate-45"></div>
              </div>
            </div>
          ))}
      </nav>
      
      <Link href={sidebarItems[sidebarItems.length - 1].link}>
        <div className="flex relative group mt-auto">
          <button
            onClick={() => setActiveSection("profile")}
            className={`w-14 h-14 flex items-center justify-center rounded-full transition-all duration-500 ease-out relative overflow-hidden border-2 ${
              isActive("profile")
                ? "bg-gradient-to-br from-violet-100 via-indigo-100 to-purple-100 border-gradient-to-r border-violet-300 shadow-xl scale-110 animate-pulse"
                : "bg-gradient-to-br from-gray-50 to-indigo-50 border-indigo-200/50 hover:border-violet-400 hover:shadow-2xl hover:scale-110 hover:rotate-12"
            }`}
            style={{
              background: isActive("profile")
                ? "linear-gradient(135deg, #f3e8ff 0%, #e0e7ff 50%, #faf5ff 100%)"
                : undefined,
            }}
          >
            {isActive("profile") && (
              <>
                <span className="absolute inset-0 rounded-full border-2 border-violet-400 animate-ping"></span>
                <span className="absolute inset-1 rounded-full border border-indigo-300 animate-pulse"></span>
              </>
            )}

            <span className="absolute inset-0 bg-gradient-conic from-violet-200 via-indigo-200 to-purple-200 rounded-full opacity-0 group-hover:opacity-30 group-hover:animate-spin transition-opacity duration-700"></span>

            <span className="absolute top-1 right-1 w-2 h-2 bg-violet-400 rounded-full opacity-0 group-hover:opacity-100 animate-bounce transition-opacity duration-300 delay-100"></span>
            <span className="absolute bottom-1 left-1 w-1.5 h-1.5 bg-indigo-400 rounded-full opacity-0 group-hover:opacity-100 animate-bounce transition-opacity duration-300 delay-200"></span>

            <User
              className={`w-6 h-6 transition-all duration-300 z-10 group-hover:scale-110 group-hover:rotate-12 ${
                isActive("profile") ? "text-violet-700 animate-pulse" : "text-indigo-500 group-hover:text-violet-600"
              }`}
            />
          </button>

          <div className="absolute left-full ml-4 px-4 py-3 bg-gradient-to-r from-violet-900/90 to-indigo-900/90 backdrop-blur-sm text-white text-sm rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap z-50 shadow-2xl transform translate-x-2 group-hover:translate-x-0 border border-violet-400/20">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-violet-400 rounded-full animate-pulse"></div>
              <span className="font-medium">Profile</span>
            </div>
            <div className="absolute -left-2 top-1/2 transform -translate-y-1/2 w-0 h-0 border-t-4 border-b-4 border-r-4 border-transparent border-r-violet-900/90"></div>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default Sidebar;
