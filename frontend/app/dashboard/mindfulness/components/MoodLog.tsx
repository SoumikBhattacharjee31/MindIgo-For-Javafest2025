import { Entry } from '../dataTypes';
import MoodCard from './MoodCard';

interface MoodLogProps {
    moodData: Entry[];
}

const MoodLog: React.FC<MoodLogProps> = ({ moodData }) => {
    // Get last 7 days
    const boundary = 7;

    const checkBoundary = (date: Date) => {
        const today = new Date();
        const dateOffset = new Date();
        dateOffset.setDate(today.getDate() - boundary);
        
        // Use date-only comparison to avoid timezone issues
        const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const offsetOnly = new Date(dateOffset.getFullYear(), dateOffset.getMonth(), dateOffset.getDate());
        
        return dateOnly >= offsetOnly && dateOnly <= todayOnly;
    }

    const last7DaysData = moodData.filter((entry) => checkBoundary(new Date(entry.date)));

    const addVacantDays = () => {
        const today = new Date();
        const vacantDays = [];
        for (let i = 0; i < 7; i++) {
            const date = new Date();
            date.setDate(today.getDate() - i);
            if (!last7DaysData.find(entry => new Date(entry.date).toDateString() === date.toDateString())) {
                vacantDays.push({ mood: null, date });
            }
        }
        return vacantDays;
    }
    const completeData = [...last7DaysData, ...addVacantDays()].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return (
        <div className="p-4 rounded-lg w-full">
            <h3 className="text-lg font-semibold text-pink-500 mb-2 text-center">Mood Log</h3>

            <div className="grid grid-cols-7 gap-2">
                {completeData.map((entry, index) => (
                    <MoodCard
                        key={index}
                        mood={entry.mood}
                        date={new Date(entry.date)}
                    />
                ))
                }
            </div>
        </div>
    );
};

export default MoodLog;