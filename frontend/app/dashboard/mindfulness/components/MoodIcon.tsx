import React from 'react';

interface MoodIconProp {
  mood: string | number;
  size?: number;
}

const MoodIcon: React.FC<MoodIconProp> = ({ mood, size = 24 }) => {
    const getMoodIcon = () => {
        // Handle both string and number mood values
        const moodValue = typeof mood === 'string' ? mood : mood;
        
        // Map numeric values to emojis (1-10 scale to match your moods array)
        if (typeof mood === 'number') {
            switch (mood) {
                case 1:
                    return <span style={{ fontSize: size }} className="inline-block">😢</span>; // terrible
                case 2:
                    return <span style={{ fontSize: size }} className="inline-block">😔</span>; // sad
                case 3:
                    return <span style={{ fontSize: size }} className="inline-block">😟</span>; // anxious
                case 4:
                    return <span style={{ fontSize: size }} className="inline-block">😡</span>; // angry
                case 5:
                    return <span style={{ fontSize: size }} className="inline-block">😐</span>; // neutral
                case 6:
                    return <span style={{ fontSize: size }} className="inline-block">😌</span>; // relaxed
                case 7:
                    return <span style={{ fontSize: size }} className="inline-block">😊</span>; // happy
                case 8:
                    return <span style={{ fontSize: size }} className="inline-block">🤩</span>; // excited
                case 9:
                    return <span style={{ fontSize: size }} className="inline-block">💪</span>; // motivated
                case 10:
                    return <span style={{ fontSize: size }} className="inline-block">😍</span>; // amazing
                default:
                    return <span style={{ fontSize: size }} className="inline-block">😐</span>; // neutral fallback
            }
        }
        
        // Handle string mood values - matching all moods from your moods array
        switch (moodValue) {
            case 'amazing':
                return <span style={{ fontSize: size }} className="inline-block">😍</span>;
            case 'happy':
                return <span style={{ fontSize: size }} className="inline-block">😊</span>;
            case 'neutral':
                return <span style={{ fontSize: size }} className="inline-block">😐</span>;
            case 'sad':
                return <span style={{ fontSize: size }} className="inline-block">😔</span>;
            case 'terrible':
                return <span style={{ fontSize: size }} className="inline-block">😢</span>;
            case 'angry':
                return <span style={{ fontSize: size }} className="inline-block">😡</span>;
            case 'anxious':
                return <span style={{ fontSize: size }} className="inline-block">😟</span>;
            case 'excited':
                return <span style={{ fontSize: size }} className="inline-block">🤩</span>;
            case 'relaxed':
                return <span style={{ fontSize: size }} className="inline-block">😌</span>;
            case 'motivated':
                return <span style={{ fontSize: size }} className="inline-block">💪</span>;
            case 'awesome':
                return <span style={{ fontSize: size }} className="inline-block">😍</span>;
            case 'good':
                return <span style={{ fontSize: size }} className="inline-block">😊</span>;
            
            default:
                return <span style={{ fontSize: size }} className="inline-block">😐</span>; // neutral fallback
        }
    };

    return getMoodIcon();
};

export default MoodIcon;