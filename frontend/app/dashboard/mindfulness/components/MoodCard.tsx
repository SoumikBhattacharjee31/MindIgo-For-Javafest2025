import MoodIcon from './MoodIcon';
interface MoodCardProps {
    mood: string | null;
    date: Date;
}

const getDayAbbr = (date: Date) => {
    const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
    return days[date.getDay()];
};

const MoodCard: React.FC<MoodCardProps> = ({ mood, date }) => {
    return (
        <div className={`flex flex-col items-center space-y-1 p-2 rounded-t-3xl rounded-b-3xl bg-gradient-to-br  ${mood ? ' from-violet-100 via-blue-100 to-green-100' : ' from-violet-300 via-blue-300 to-green-300 opacity-50'}`}>
            <div className="text-xs font-medium text-blue-600">
                {getDayAbbr(date)}
            </div>
            <div className="h-8 flex items-center justify-center">
                {mood && (
                    <MoodIcon mood={mood} size={20} />
                )}
            </div>
            <div className="text-xs text-pink-400">
                {date.getDate()}/{date.getMonth()}
            </div>
        </div>
    );
}

export default MoodCard;