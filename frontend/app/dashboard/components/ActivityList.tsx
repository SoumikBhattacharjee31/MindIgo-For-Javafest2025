import {Calendar} from 'lucide-react';
import ActivityCard from '@/app/dashboard/components/ActivityCard';
import activities from '@/app/dashboard/mock/activity_data.json';

const ActivityList = () => {
    return (
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-indigo-500" />
                Your Fun Daily Reminders Await! 🎊
            </h3>
            <p className="text-sm text-gray-600 mb-4">Let's make today amazing together!</p>
            <div className="space-y-3">
                {activities.map((item, index) => (
                    <ActivityCard
                        key={index}
                        activity={item.activity}
                        time={item.time}
                        nudge={item.nudge}
                    />
                ))}
            </div>
        </div>

    );
};

export default ActivityList;