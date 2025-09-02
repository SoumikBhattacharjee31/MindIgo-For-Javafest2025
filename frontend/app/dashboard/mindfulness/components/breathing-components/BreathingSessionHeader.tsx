import { ArrowLeft, Volume2, VolumeX } from "lucide-react";

interface BreathingSessionHeaderProps {
    onBack: () => void;
    musicEnabled: boolean;
    title: string;
    toggleMusic: () => void;
}

const BreathingSessionHeader = ({
    onBack,
    musicEnabled,
    title,
    toggleMusic
}: BreathingSessionHeaderProps) => {
    return (
        <div className="flex items-center justify-between p-6">
            <ArrowLeft
                className="w-6 h-6 cursor-pointer hover:text-purple-300 transition-colors"
                onClick={onBack}
            />
            <h1 className="text-xl font-semibold">{title}</h1>
            <button
                onClick={toggleMusic}
                className="p-2 rounded-full hover:bg-white/10 transition-colors"
            >
                {musicEnabled ? <Volume2 className="w-6 h-6" /> : <VolumeX className="w-6 h-6" />}
            </button>
        </div>
    );
}

export default BreathingSessionHeader;