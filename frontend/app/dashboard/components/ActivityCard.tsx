import { ChevronRight, CheckCircle2, Circle, Calendar, Brain, Stethoscope, Wind } from 'lucide-react';

interface ActivityCardProp {
    activity: string;
    time?: string;
    nudge: string;
    type: 'mood' | 'breathing' | 'appointment' | 'quiz';
    isCompleted: boolean;
    onClick?: () => void;
}

const ActivityCard: React.FC<ActivityCardProp> = ({
    activity,
    time,
    nudge,
    type,
    isCompleted,
    onClick
}) => {
    const getIcon = () => {
        switch (type) {
            case 'mood':
                return <Brain className="w-4 h-4" />;
            case 'breathing':
                return <Wind className="w-4 h-4" />;
            case 'appointment':
                return <Stethoscope className="w-4 h-4" />;
            case 'quiz':
                return <Calendar className="w-4 h-4" />;
            default:
                return <Circle className="w-4 h-4" />;
        }
    };

    const getTypeColor = () => {
        switch (type) {
            case 'mood':
                return 'from-yellow-50 to-orange-50 hover:from-yellow-100 hover:to-orange-100 text-yellow-600';
            case 'breathing':
                return 'from-blue-50 to-cyan-50 hover:from-blue-100 hover:to-cyan-100 text-blue-600';
            case 'appointment':
                return 'from-red-50 to-pink-50 hover:from-red-100 hover:to-pink-100 text-red-600';
            case 'quiz':
                return 'from-purple-50 to-indigo-50 hover:from-purple-100 hover:to-indigo-100 text-purple-600';
            default:
                return 'from-gray-50 to-blue-50 hover:from-blue-50 hover:to-indigo-50 text-indigo-600';
        }
    };

    return (
        <div 
            className={`flex items-center justify-between p-3 bg-gradient-to-r rounded-lg transition-all cursor-pointer ${
                isCompleted 
                    ? 'from-green-50 to-emerald-50 opacity-75' 
                    : getTypeColor()
            }`}
            onClick={onClick}
        >
            <div className="flex items-center gap-3 flex-1">
                <div className={`${isCompleted ? 'text-green-600' : getTypeColor().split(' ').pop()}`}>
                    {getIcon()}
                </div>
                <div className="flex-1">
                    <div className="flex items-center gap-2">
                        <p className={`font-medium text-sm ${
                            isCompleted ? 'text-gray-600 line-through' : 'text-gray-900'
                        }`}>
                            {activity}
                        </p>
                        {isCompleted && (
                            <CheckCircle2 className="w-4 h-4 text-green-600" />
                        )}
                    </div>
                    {time && (
                        <p className="text-gray-600 text-xs">{time}</p>
                    )}
                    <p className={`text-xs font-medium mt-1 ${
                        isCompleted ? 'text-green-600' : 'text-indigo-600'
                    }`}>
                        {isCompleted ? 'Completed! Great job! ✨' : nudge}
                    </p>
                </div>
            </div>
            {!isCompleted && <ChevronRight className="w-4 h-4 text-indigo-400" />}
        </div>
    );
}

export default ActivityCard;