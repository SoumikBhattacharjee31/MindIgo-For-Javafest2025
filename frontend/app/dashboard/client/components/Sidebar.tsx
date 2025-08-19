import { 
  Heart, 
  Moon, 
  Droplets, 
  Smile, 
  Dumbbell, 
  Brain, 
  Wind, 
  Calendar,
  Settings,
  User,
  BarChart3,
  Plus,
  ChevronRight,
  Activity
} from 'lucide-react';

interface SidebarProp{
    activeSection: string;
    setActiveSection: (section: string) => void;
    sidebarItems: SidebarItem[];
}
interface SidebarItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  category: 'analytics' | 'wellness' | 'other';
}

const Sidebar: React.FC<SidebarProp> = ({ activeSection, setActiveSection, sidebarItems }) => {
    return(
        <div className="w-64 bg-white shadow-sm border-r border-gray-200 min-h-screen">
          
          {/* Navigation */}
          <nav className="px-4 space-y-1">
            {/* Body Analytics Section */}
            <div className="mb-4">
              <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Body Analytics
              </h3>
              {sidebarItems
                .filter(item => item.category === 'analytics')
                .map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveSection(item.id)}
                    className={`w-full flex items-center px-3 py-2 text-sm rounded-lg transition-colors ${
                      activeSection === item.id
                        ? 'bg-blue-100 text-blue-700 font-medium'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {item.icon}
                    <span className="ml-3">{item.label}</span>
                  </button>
                ))
              }
            </div>

            {/* Wellness Section */}
            <div className="mb-4">
              <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Wellness Activities
              </h3>
              {sidebarItems
                .filter(item => item.category === 'wellness')
                .map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveSection(item.id)}
                    className={`w-full flex items-center px-3 py-2 text-sm rounded-lg transition-colors ${
                      activeSection === item.id
                        ? 'bg-blue-100 text-blue-700 font-medium'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {item.icon}
                    <span className="ml-3">{item.label}</span>
                  </button>
                ))
              }
            </div>

            {/* Other Section */}
            <div className="border-t border-gray-200 pt-4">
              {sidebarItems
                .filter(item => item.category === 'other')
                .map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveSection(item.id)}
                    className={`w-full flex items-center px-3 py-2 text-sm rounded-lg transition-colors ${
                      activeSection === item.id
                        ? 'bg-blue-100 text-blue-700 font-medium'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {item.icon}
                    <span className="ml-3">{item.label}</span>
                  </button>
                ))
              }
            </div>
          </nav>
        </div>

    );
};

export default Sidebar;