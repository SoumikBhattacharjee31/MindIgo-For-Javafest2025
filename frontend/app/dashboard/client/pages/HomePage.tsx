import { 
  Moon, 
  Droplets, 
  Smile,  
  Brain, 
  Wind, 
  Calendar,
  Plus,
  ChevronRight,
  Activity,
  Star,
} from 'lucide-react';
import GreetingsCard from '../components/GreetingsCard';

interface MetricCard {
  title: string;
  value: string;
  change: string;
  trend: 'up' | 'down' | 'neutral';
  icon: React.ReactNode;
  encouragement: string;
}

const HomePage = () => {
    const quickMetrics: MetricCard[] = [
        {
            title: 'Sleep Quality',
            value: '7.5h',
            change: '+12%',
            trend: 'up',
            icon: <Moon className="w-6 h-6 text-blue-600" />,
            encouragement: "Sweet dreams lead to sweet insights! 😴✨"
        },
        {
            title: "Today's Mood",
            value: 'Good',
            change: '↗ Improving',
            trend: 'up',
            icon: <Smile className="w-6 h-6 text-green-600" />,
            encouragement: "Your mood data helps us brighten your days! 🌈"
        },
        {
            title: 'Water Intake',
            value: '6/8 cups',
            change: '75%',
            trend: 'neutral',
            icon: <Droplets className="w-6 h-6 text-cyan-600" />,
            encouragement: "Stay hydrated, stay amazing! More logs = better tips 💧"
        },
        {
            title: 'Active Minutes',
            value: '45 min',
            change: '+5 min',
            trend: 'up',
            icon: <Activity className="w-6 h-6 text-orange-600" />,
            encouragement: "Every step counts! Keep tracking for personalized insights 🚀"
        }
    ];

    const upcomingActivities = [
        { time: '2:00 PM', activity: 'Mindfulness Session', type: 'meditation', nudge: "Your mind will thank you! 🧘‍♀️" },
        { time: '4:30 PM', activity: 'Breathing Exercise', type: 'breathing', nudge: "Breathe in positivity! 🌸" },
        { time: '7:00 PM', activity: 'Evening Reflection', type: 'journal', nudge: "Time to celebrate today's wins! 📝" },
    ];

    return (
        <div className="space-y-6">
            {/* Header with motivational message */}
            <GreetingsCard/>

            {/* Quick Metrics */}
            <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Star className="w-5 h-5 text-yellow-500" />
                    Your Daily Superstars! 
                    <span className="text-sm font-normal text-gray-600">Track more to unlock magical insights 🎉</span>
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {quickMetrics.map((metric, index) => (
                        <div key={index} className="bg-white rounded-lg p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between mb-4">
                                {metric.icon}
                                <span className={`text-sm font-medium px-2 py-1 rounded-full ${metric.trend === 'up' ? 'text-green-700 bg-green-100' :
                                        metric.trend === 'down' ? 'text-red-700 bg-red-100' :
                                            'text-gray-700 bg-gray-100'
                                    }`}>
                                    {metric.change}
                                </span>
                            </div>
                            <h3 className="text-gray-600 text-sm font-medium">{metric.title}</h3>
                            <p className="text-2xl font-bold text-gray-900 mt-1">{metric.value}</p>
                            <p className="text-xs text-purple-600 mt-2 font-medium">{metric.encouragement}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Today's Schedule */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <Star className="w-5 h-5 text-purple-500" />
                            Today's Wellness Journey
                        </h3>
                        <div className="h-64 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg flex flex-col items-center justify-center text-center p-8">
                            <div className="bg-white/80 rounded-lg p-6 backdrop-blur-sm">
                                <Star className="w-8 h-8 text-yellow-500 mx-auto mb-3" />
                                <h4 className="text-lg font-semibold text-gray-800 mb-2">Track your journey and watch the magic happen! 🌟</h4>
                                <p className="text-sm text-gray-600">Fill in your daily info for personalized analysis and unlock amazing insights about yourself!</p>
                                <button className="mt-3 px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors">
                                    Start Logging! ✨
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    {/* Upcoming Activities */}
                    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-indigo-500" />
                            Your Fun Daily Reminders Await! 🎊
                        </h3>
                        <p className="text-sm text-gray-600 mb-4">Let's make today amazing together!</p>
                        <div className="space-y-3">
                            {upcomingActivities.map((item, index) => (
                                <div key={index} className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg hover:from-blue-50 hover:to-indigo-50 transition-all">
                                    <div className="flex-1">
                                        <p className="font-medium text-gray-900 text-sm">{item.activity}</p>
                                        <p className="text-gray-600 text-xs">{item.time}</p>
                                        <p className="text-xs text-indigo-600 font-medium mt-1">{item.nudge}</p>
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-indigo-400" />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
                            <Plus className="w-5 h-5 text-green-500" />
                            Quick Actions 🚀
                        </h3>
                        <p className="text-sm text-gray-600 mb-4">Jump in and start building your wellness story!</p>
                        <div className="grid grid-cols-2 gap-3">
                            <button className="p-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-all transform hover:scale-105 group">
                                <Brain className="w-5 h-5 mx-auto mb-1 group-hover:animate-pulse" />
                                <span className="text-xs font-medium block">Meditate</span>
                                <span className="text-xs text-blue-600 opacity-75">& Log Your Mood! 😊</span>
                            </button>
                            <button className="p-3 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-all transform hover:scale-105 group">
                                <Wind className="w-5 h-5 mx-auto mb-1 group-hover:animate-pulse" />
                                <span className="text-xs font-medium block">Breathe</span>
                                <span className="text-xs text-green-600 opacity-75">& Feel Amazing! 🌿</span>
                            </button>
                            <button className="p-3 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-all transform hover:scale-105 group">
                                <Calendar className="w-5 h-5 mx-auto mb-1 group-hover:animate-pulse" />
                                <span className="text-xs font-medium block">Journal</span>
                                <span className="text-xs text-purple-600 opacity-75">& Reflect! ✨</span>
                            </button>
                            <button className="p-3 bg-orange-50 text-orange-700 rounded-lg hover:bg-orange-100 transition-all transform hover:scale-105 group">
                                <Plus className="w-5 h-5 mx-auto mb-1 group-hover:animate-pulse" />
                                <span className="text-xs font-medium block">Add Entry</span>
                                <span className="text-xs text-orange-600 opacity-75">& Unlock Insights! 🔍</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HomePage;