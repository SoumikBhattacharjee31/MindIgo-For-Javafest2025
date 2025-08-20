"use client"

import React, { useState } from 'react';
import { BarChart3, House, Gamepad2, User } from 'lucide-react';

import Sidebar from './components/Sidebar';
import { FaUserDoctor } from 'react-icons/fa6';
import { GiMeditation } from 'react-icons/gi';
import HomePage from './pages/HomePage';


interface SidebarItem {
  id: string;
  label: string;
  icon: React.ReactNode;
}



const Dashboard = () => {
  const [activeSection, setActiveSection] = useState<string>('overview');

  const sidebarItems: SidebarItem[] = [
    { id: 'home', label: 'Home', icon: <House className='w-5 h-5' /> },
    { id: 'game', label: 'Game', icon: <Gamepad2 className='w-5 h-5' /> },
    { id: 'counselor', label: 'Counselor', icon: <FaUserDoctor className='w-5 h-5' /> },
    { id: 'mindfulness', label: 'Mindfulness', icon: <GiMeditation className='w-5 h-5' /> },
    { id: 'analytics', label: 'Analytics', icon: <BarChart3 className='w-5 h-5' /> },
    { id: 'profile', label: 'Profile', icon: <User className='w-5 h-5' /> }
  ];



  const renderMainContent = () => {
    switch (activeSection) {
      case 'home':
        return <HomePage />;
      default:
        return (
          <div className="bg-white rounded-lg p-8 shadow-sm border border-gray-100">
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                {sidebarItems.find(item => item.id === activeSection)?.icon}
              </div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                {sidebarItems.find(item => item.id === activeSection)?.label}
              </h2>
              <p className="text-gray-600 mb-6">
                This section is ready for customization. Add your specific {activeSection} tracking components here.
              </p>
              <div className="bg-gray-50 rounded-lg p-6 max-w-md mx-auto">
                <h4 className="font-medium text-gray-900 mb-2">Customization Space</h4>
                <p className="text-sm text-gray-600">
                  Implement charts, forms, progress trackers, or any other components specific to {activeSection} monitoring.
                </p>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* <Navbar /> */}
      <div className="flex">
        <div className='w-16 bg-gradient-to-b from-indigo-50/80 via-blue-50/60 to-violet-50/40 min-h-screen  py-3 shadow-lg border-r border-indigo-100/50 flex justify-center'>
          <Sidebar activeSection={activeSection} setActiveSection={setActiveSection} sidebarItems={sidebarItems} />
        </div>
        <div className="flex-1 p-8">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Good morning! 👋
              </h1>
              <p className="text-gray-600">
                Here's how your wellness journey is progressing today.
              </p>
            </div>

            {renderMainContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;