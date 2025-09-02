interface ProgressBarProps {
    progress: number;
    totalTime: number;
    duration: number;

}

const ProgressBar = ({ progress, totalTime, duration }: ProgressBarProps) => {
    return (
        <div className="mx-6 mb-6">
            <div className="w-full bg-white/20 rounded-full h-2">
                <div
                    className="bg-gradient-to-r from-green-400 to-blue-500 h-2 rounded-full transition-all duration-1000"
                    style={{ width: `${Math.min(progress, 100)}%` }}
                />
            </div>
            <div className="text-center text-sm text-white/70 mt-2">
                {Math.floor(totalTime / 60)}:{(totalTime % 60).toString().padStart(2, '0')} / {duration}:00
            </div>
        </div>
    );
}

export default ProgressBar;