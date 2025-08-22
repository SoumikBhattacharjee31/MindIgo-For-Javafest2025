import {ChevronRight} from 'lucide-react';

interface ActivityCardProp{
    activity: string;
    time: string;
    nudge: string;
}

const ActivityCard:React.FC<ActivityCardProp> = ({
    activity,
    time,
    nudge
}) => {
    return (
        <div className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg hover:from-blue-50 hover:to-indigo-50 transition-all">
            <div className="flex-1">
                <p className="font-medium text-gray-900 text-sm">{activity}</p>
                <p className="text-gray-600 text-xs">{time}</p>
                <p className="text-xs text-indigo-600 font-medium mt-1">{nudge}</p>
            </div>
            <ChevronRight className="w-4 h-4 text-indigo-400" />
        </div>
    );
}

export default ActivityCard;