import { AlignJustify, User, Settings, LogOut, Bell, HelpCircle } from "lucide-react";
import { useState, useRef, useEffect } from "react";
interface SidebarProp {
  activeSection: string;
  setActiveSection: (section: string) => void;
  sidebarItems: SidebarItem[];
}

interface SidebarItem {
  id: string;
  label: string;
  icon: React.ReactNode;
}

const Sidebar: React.FC<SidebarProp> = ({
  activeSection,
  setActiveSection,
  sidebarItems,
}) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const dropdownItems = [
    { id: 'notifications', label: 'Notifications', icon: <Bell className="w-4 h-4" /> },
    { id: 'settings', label: 'Settings', icon: <Settings className="w-4 h-4" /> },
    { id: 'help', label: 'Help & Support', icon: <HelpCircle className="w-4 h-4" /> },
    { id: 'logout', label: 'Sign Out', icon: <LogOut className="w-4 h-4" /> },
  ];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="flex flex-col items-center fixed">
      {/* Top section with dropdown */}
      <div className="relative mb-4" ref={dropdownRef}>
        <button
          className="w-12 h-12 bg-gradient-to-br from-blue-100 to-indigo-100 hover:from-blue-200 hover:to-indigo-200 rounded-2xl flex items-center justify-center transition-all duration-300 ease-out hover:rounded-xl shadow-sm hover:shadow-md group"
          onClick={() => setShowDropdown(!showDropdown)}
        >
          <AlignJustify className="w-5 h-5 text-indigo-600 group-hover:text-indigo-700" />
        </button>

        {/* Dropdown Menu */}
        {showDropdown && (
          <div className="absolute top-14 left-0 w-56 bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-indigo-100/50 py-3 z-50 animate-in slide-in-from-top-2 duration-200">
            <div className="px-4 py-2 border-b border-indigo-50">
              <p className="text-sm font-semibold text-gray-800">MindfulSpace</p>
              <p className="text-xs text-gray-500">Mental Wellness Hub</p>
            </div>
            <div className="py-2">
              {dropdownItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    // if (item.id !== 'logout') {
                    //   setActiveSection(item.id);
                    // }
                    setShowDropdown(false);
                  }}
                  className={`w-full px-4 py-2.5 flex items-center text-left transition-all duration-200 ${
                    item.id === 'logout' 
                      ? 'hover:bg-red-50 text-red-600 hover:text-red-700' 
                      : 'hover:bg-indigo-50/70 text-gray-700 hover:text-indigo-700'
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

      {/* Navigation items */}
      <nav className="flex flex-col items-center space-y-3 flex-1">
        {sidebarItems
          .filter((item) => item.id !== "profile")
          .map((item) => (
            <div key={item.id} className="flex relative group">
              <button
                onClick={() => setActiveSection(item.id)}
                className={`w-12 h-12 flex items-center justify-center rounded-2xl transition-all duration-300 ease-out relative ${
                  activeSection === item.id
                    ? "bg-gradient-to-br from-indigo-100 to-blue-100 rounded-xl shadow-md"
                    : "bg-transparent hover:bg-gradient-to-br hover:from-indigo-50 hover:to-blue-50 hover:rounded-xl hover:shadow-sm"
                }`}
              >
                {/* Active indicator pill */}
                {activeSection === item.id && (
                  <span className="absolute -left-1 top-1/2 transform -translate-y-1/2 w-1 h-10 bg-gradient-to-b from-indigo-500 to-blue-500 rounded-r-full shadow-sm"></span>
                )}
                
                <span className={`transition-all duration-200 ${
                  activeSection === item.id 
                    ? "text-indigo-700" 
                    : "text-indigo-400 group-hover:text-indigo-600"
                }`}>
                  {item.icon}
                </span>
              </button>

              {/* Tooltip */}
              <div className="absolute left-full ml-4 px-3 py-2 bg-gray-900/90 backdrop-blur-sm text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap z-50 shadow-lg">
                {item.label}
                <div className="absolute -left-1 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-gray-900/90 rotate-45"></div>
              </div>
            </div>
          ))}
      </nav>

      {/* Bottom Profile Section */}
      <div className="flex relative group">
        <button
          onClick={() => setActiveSection("profile")}
          className={`w-12 h-12 flex items-center justify-center rounded-2xl transition-all duration-300 ease-out relative ${
            activeSection === "profile"
              ? "bg-gradient-to-br from-indigo-100 to-blue-100 rounded-xl shadow-md"
              : "bg-transparent hover:bg-gradient-to-br hover:from-indigo-50 hover:to-blue-50 hover:rounded-xl hover:shadow-sm"
          }`}
        >
          {/* Active indicator pill */}
          {activeSection === "profile" && (
            <span className="absolute -left-1 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-indigo-500 to-blue-500 rounded-r-full shadow-sm"></span>
          )}
          
          <User className={`w-5 h-5 transition-all duration-200 ${
            activeSection === "profile" 
              ? "text-indigo-700" 
              : "text-indigo-400 group-hover:text-indigo-600"
          }`} />
        </button>

        {/* Profile Tooltip */}
        <div className="absolute left-full ml-4 px-3 py-2 bg-gray-900/90 backdrop-blur-sm text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap z-50 shadow-lg">
          Profile
          <div className="absolute -left-1 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-gray-900/90 rotate-45"></div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;