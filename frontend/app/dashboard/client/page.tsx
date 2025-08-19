"use client"

import React, { useState } from 'react';
import { 
  Heart, 
  Moon, 
  Droplets, 
  Smile, 
  Dumbbell, 
  Brain, 
  Wind, 
  Calendar,
  BarChart3,
  Plus,
  ChevronRight,
  Activity
} from 'lucide-react';

import Navbar from '@/app/components/Navbar';
import Sidebar from './components/Sidebar';


interface SidebarItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  category: 'analytics' | 'wellness' | 'other';
}

interface MetricCard {
  title: string;
  value: string;
  change: string;
  trend: 'up' | 'down' | 'neutral';
  icon: React.ReactNode;
}

const Dashboard = () => {
  const [activeSection, setActiveSection] = useState<string>('overview');

  const sidebarItems: SidebarItem[] = [
          { id: 'overview', label: 'Overview', icon: <BarChart3 className="w-5 h-5" />, category: 'other' },
          { id: 'sleep', label: 'Sleep Cycle', icon: <Moon className="w-5 h-5" />, category: 'analytics' },
          { id: 'hydration', label: 'Water Intake', icon: <Droplets className="w-5 h-5" />, category: 'analytics' },
          { id: 'mood', label: 'Daily Mood', icon: <Smile className="w-5 h-5" />, category: 'analytics' },
          { id: 'workout', label: 'Workouts', icon: <Dumbbell className="w-5 h-5" />, category: 'analytics' },
          { id: 'heart-rate', label: 'Heart Rate', icon: <Heart className="w-5 h-5" />, category: 'analytics' },
          { id: 'meditation', label: 'Meditation', icon: <Brain className="w-5 h-5" />, category: 'wellness' },
          { id: 'breathing', label: 'Breathing Exercises', icon: <Wind className="w-5 h-5" />, category: 'wellness' },
          { id: 'journal', label: 'Journal', icon: <Calendar className="w-5 h-5" />, category: 'wellness' },
      ];
  

  const quickMetrics: MetricCard[] = [
    {
      title: 'Sleep Quality',
      value: '7.5h',
      change: '+12%',
      trend: 'up',
      icon: <Moon className="w-6 h-6 text-blue-600" />
    },
    {
      title: "Today's Mood",
      value: 'Good',
      change: '↗ Improving',
      trend: 'up',
      icon: <Smile className="w-6 h-6 text-green-600" />
    },
    {
      title: 'Water Intake',
      value: '6/8 cups',
      change: '75%',
      trend: 'neutral',
      icon: <Droplets className="w-6 h-6 text-cyan-600" />
    },
    {
      title: 'Active Minutes',
      value: '45 min',
      change: '+5 min',
      trend: 'up',
      icon: <Activity className="w-6 h-6 text-orange-600" />
    }
  ];

  const upcomingActivities = [
    { time: '2:00 PM', activity: 'Mindfulness Session', type: 'meditation' },
    { time: '4:30 PM', activity: 'Breathing Exercise', type: 'breathing' },
    { time: '7:00 PM', activity: 'Evening Reflection', type: 'journal' },
  ];

  const renderMainContent = () => {
    switch (activeSection) {
      case 'overview':
        return (
          <div className="space-y-6">
            {/* Quick Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {quickMetrics.map((metric, index) => (
                <div key={index} className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between mb-4">
                    {metric.icon}
                    <span className={`text-sm font-medium px-2 py-1 rounded-full ${
                      metric.trend === 'up' ? 'text-green-700 bg-green-100' :
                      metric.trend === 'down' ? 'text-red-700 bg-red-100' :
                      'text-gray-700 bg-gray-100'
                    }`}>
                      {metric.change}
                    </span>
                  </div>
                  <h3 className="text-gray-600 text-sm font-medium">{metric.title}</h3>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{metric.value}</p>
                </div>
              ))}
            </div>

            {/* Today's Schedule */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Today's Wellness Journey</h3>
                  <div className="h-64 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg flex items-center justify-center">
                    <p className="text-gray-600">Interactive wellness chart will go here</p>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                {/* Upcoming Activities */}
                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Upcoming</h3>
                  <div className="space-y-3">
                    {upcomingActivities.map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900 text-sm">{item.activity}</p>
                          <p className="text-gray-600 text-xs">{item.time}</p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <button className="p-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors">
                      <Brain className="w-5 h-5 mx-auto mb-1" />
                      <span className="text-xs font-medium">Meditate</span>
                    </button>
                    <button className="p-3 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors">
                      <Wind className="w-5 h-5 mx-auto mb-1" />
                      <span className="text-xs font-medium">Breathe</span>
                    </button>
                    <button className="p-3 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors">
                      <Calendar className="w-5 h-5 mx-auto mb-1" />
                      <span className="text-xs font-medium">Journal</span>
                    </button>
                    <button className="p-3 bg-orange-50 text-orange-700 rounded-lg hover:bg-orange-100 transition-colors">
                      <Plus className="w-5 h-5 mx-auto mb-1" />
                      <span className="text-xs font-medium">Add Entry</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
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
        <Navbar />
      <div className="flex">
        <Sidebar activeSection={activeSection} setActiveSection={setActiveSection} sidebarItems={sidebarItems}/>
        {/* Main Content */}
        <div className="flex-1 p-8">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Good morning! 👋
              </h1>
              <p className="text-gray-600">
                Here's how your wellness journey is progressing today.
              </p>
            </div>

            {/* Main Content Area */}
            {renderMainContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;