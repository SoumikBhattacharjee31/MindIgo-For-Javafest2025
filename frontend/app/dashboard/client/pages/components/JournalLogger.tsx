import { Star } from 'lucide-react';
const JournalLogger = () => {
    return (
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
    );
}

export default JournalLogger;