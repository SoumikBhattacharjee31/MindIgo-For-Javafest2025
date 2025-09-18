"use client";
import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { User, House, Gamepad2, BotIcon } from "lucide-react";
import { FaUserDoctor } from "react-icons/fa6";
import { GiMeditation } from "react-icons/gi";
import { FaQuestionCircle } from "react-icons/fa";

// ========================
// TYPES & INTERFACES
// ========================
interface SidebarItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  link: string;
}

// ========================
// CONFIGURATION
// ========================
const SIDEBAR_ITEMS: SidebarItem[] = [
  { id: "home", label: "Home", icon: <House className="w-5 h-5" />, link: "/dashboard" },
  { id: "games", label: "Game", icon: <Gamepad2 className="w-5 h-5" />, link: "/dashboard/games" },
  { id: "counselor", label: "Counselor", icon: <FaUserDoctor className="w-5 h-5" />, link: "/dashboard/counselor" },
  { id: "mindfulness", label: "Mindfulness", icon: <GiMeditation className="w-5 h-5" />, link: "/dashboard/mindfulness" },
  { id: "chat", label: "Chat", icon: <BotIcon className="w-5 h-5" />, link: "/dashboard/chat" },
  { id: "quiz", label: "Quiz", icon: <FaQuestionCircle className="w-5 h-5" />, link: "/dashboard/quiz" },
  { id: "profile", label: "Profile", icon: <User className="w-5 h-5" />, link: "/dashboard/profile" },
];

// ========================
// UTILITY FUNCTIONS
// ========================
const getActiveSection = (pathname: string): string => {
  const activeItem = SIDEBAR_ITEMS.find((item) => pathname === item.link);
  return activeItem?.id || "home";
};

// ========================
// CUSTOM HOOKS
// ========================
const useActiveSection = () => {
  const pathname = usePathname();
  const [activeSection, setActiveSection] = useState<string>(() => getActiveSection(pathname));

  const updateActiveSection = useCallback((id: string) => {
    setActiveSection(id);
  }, []);

  // Update active section when pathname changes
  useEffect(() => {
    const newActiveSection = getActiveSection(pathname);
    if (newActiveSection !== activeSection) {
      setActiveSection(newActiveSection);
    }
  }, [pathname, activeSection]);

  return { activeSection, updateActiveSection };
};

// ========================
// COMPONENT STYLES
// ========================
const styles = {
  container: "flex flex-col items-center fixed h-full py-4",

  // Navigation styles
  nav: "flex flex-col items-center space-y-3 flex-1",
  navButton: "w-12 h-12 flex items-center justify-center rounded-full transition-all duration-300 ease-out relative overflow-hidden",
  activeIndicator: "absolute -left-1 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-indigo-500 to-blue-500 rounded-r-full shadow-sm animate-pulse",
  rippleEffect: "absolute inset-0 bg-gradient-to-r from-indigo-300/20 to-blue-300/20 rounded-full scale-0 group-hover:scale-100 transition-transform duration-500 ease-out",
  tooltip: "absolute left-full ml-4 px-3 py-2 bg-gray-900/90 backdrop-blur-sm text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap z-50 shadow-lg transform translate-x-2 group-hover:translate-x-0",
  tooltipArrow: "absolute -left-1 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-gray-900/90 rotate-45",

  // Profile styles
  profileContainer: "flex relative group mt-auto",
  profileButton: "w-14 h-14 flex items-center justify-center rounded-full transition-all duration-500 ease-out relative overflow-hidden border-2",
} as const;

// ========================
// SUB-COMPONENTS
// ========================
interface NavItemProps {
  item: SidebarItem;
  isActive: boolean;
  onActivate: (id: string) => void;
}

const NavItem: React.FC<NavItemProps> = ({ item, isActive, onActivate }) => {
  const handleClick = useCallback(() => {
    onActivate(item.id);
  }, [item.id, onActivate]);

  return (
    <div className="flex relative group">
      <Link href={item.link}>
        <button
          onClick={handleClick}
          className={`${styles.navButton} ${isActive
              ? "bg-gradient-to-br from-indigo-100 to-blue-100 shadow-md scale-105"
              : "bg-transparent hover:bg-gradient-to-br hover:from-indigo-50 hover:to-blue-50 hover:shadow-sm hover:scale-105"
            }`}
        >
          {/* Active Indicator */}
          {isActive && <span className={styles.activeIndicator}></span>}

          {/* Ripple Effect */}
          <span className={styles.rippleEffect}></span>

          {/* Icon */}
          <span
            className={`transition-all duration-200 z-10 group-hover:scale-110 ${isActive ? "text-indigo-700" : "text-indigo-400 group-hover:text-indigo-600"
              }`}
          >
            {item.icon}
          </span>
        </button>
      </Link>

      {/* Tooltip */}
      <div className={styles.tooltip}>
        {item.label}
        <div className={styles.tooltipArrow}></div>
      </div>
    </div>
  );
};

interface ProfileButtonProps {
  item: SidebarItem;
  isActive: boolean;
  onActivate: (id: string) => void;
}

const ProfileButton: React.FC<ProfileButtonProps> = ({ item, isActive, onActivate }) => {
  const handleClick = useCallback(() => {
    onActivate(item.id);
  }, [item.id, onActivate]);

  return (
    <Link href={item.link}>
      <div className={styles.profileContainer}>
        <button
          onClick={handleClick}
          className={`${styles.profileButton} ${isActive
              ? "bg-gradient-to-br from-violet-100 via-indigo-100 to-purple-100 border-gradient-to-r border-violet-300 shadow-xl scale-110 animate-pulse"
              : "bg-gradient-to-br from-gray-50 to-indigo-50 border-indigo-200/50 hover:border-violet-400 hover:shadow-2xl hover:scale-110 hover:rotate-12"
            }`}
          style={{
            background: isActive
              ? "linear-gradient(135deg, #f3e8ff 0%, #e0e7ff 50%, #faf5ff 100%)"
              : undefined,
          }}
        >
          {isActive && (
            <>
              <span className="absolute inset-0 rounded-full border-2 border-violet-400 animate-ping"></span>
              <span className="absolute inset-1 rounded-full border border-indigo-300 animate-pulse"></span>
            </>
          )}

          <span className="absolute inset-0 bg-gradient-conic from-violet-200 via-indigo-200 to-purple-200 rounded-full opacity-0 group-hover:opacity-30 group-hover:animate-spin transition-opacity duration-700"></span>

          <span className="absolute top-1 right-1 w-2 h-2 bg-violet-400 rounded-full opacity-0 group-hover:opacity-100 animate-bounce transition-opacity duration-300 delay-100"></span>
          <span className="absolute bottom-1 left-1 w-1.5 h-1.5 bg-indigo-400 rounded-full opacity-0 group-hover:opacity-100 animate-bounce transition-opacity duration-300 delay-200"></span>

          <User
            className={`w-6 h-6 transition-all duration-300 z-10 group-hover:scale-110 group-hover:rotate-12 ${isActive ? "text-violet-700 animate-pulse" : "text-indigo-500 group-hover:text-violet-600"
              }`}
          />
        </button>

        {/* Enhanced Tooltip for Profile */}
        <div className="absolute left-full ml-4 px-4 py-3 bg-gradient-to-r from-violet-900/90 to-indigo-900/90 backdrop-blur-sm text-white text-sm rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap z-50 shadow-2xl transform translate-x-2 group-hover:translate-x-0 border border-violet-400/20">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-violet-400 rounded-full animate-pulse"></div>
            <span className="font-medium">Profile</span>
          </div>
          <div className="absolute -left-2 top-1/2 transform -translate-y-1/2 w-0 h-0 border-t-4 border-b-4 border-r-4 border-transparent border-r-violet-900/90"></div>
        </div>
      </div>
    </Link>
  );
};

// ========================
// MAIN COMPONENT
// ========================
const Sidebar: React.FC = () => {
  const { activeSection, updateActiveSection } = useActiveSection();

  // Separate profile item from navigation items
  const navigationItems = SIDEBAR_ITEMS.filter((item) => item.id !== "profile");
  const profileItem = SIDEBAR_ITEMS.find((item) => item.id === "profile")!;

  return (
    <div className={styles.container}>
      {/* Navigation Section */}
      <nav className={styles.nav}>
        {navigationItems.map((item) => (
          <NavItem
            key={item.id}
            item={item}
            isActive={activeSection === item.id}
            onActivate={updateActiveSection}
          />
        ))}
      </nav>

      {/* Profile Section */}
      <ProfileButton
        item={profileItem}
        isActive={activeSection === "profile"}
        onActivate={updateActiveSection}
      />
    </div>
  );
};

export default Sidebar;