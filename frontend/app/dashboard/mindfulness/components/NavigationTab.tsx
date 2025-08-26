import { JSX } from "react";

interface Tab {
    label: string;
    component: JSX.Element;
}

interface NavigationTabProps {
    tabs: Tab[];
    currentPage: number;
    setCurrentPage: (page: number) => void;
}

const NavigationTab: React.FC<NavigationTabProps> = ({ tabs, currentPage, setCurrentPage }) => {
    return (
        <div className="w-full">
            <div className="flex rounded-t-lg overflow-hidden shadow-sm">
                {tabs.map((tab, index) => (
                    <button
                        key={index}
                        onClick={() => setCurrentPage(index)}
                        className={`
                                flex-1 px-6 py-3 text-sm font-medium transition-all duration-200 
                                relative border-r border-gray-300 last:border-r-0
                                ${currentPage === index
                                ? 'bg-white text-gray-900 shadow-sm'
                                : 'bg-gray-200 text-gray-600 hover:bg-gray-100 hover:text-gray-800'
                            }
                            `}
                    >
                        {tab.label}
                        {/* Active tab indicator */}
                        {currentPage === index && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500"></div>
                        )}
                    </button>
                ))}
            </div>
        </div>

    );
};

export default NavigationTab;
