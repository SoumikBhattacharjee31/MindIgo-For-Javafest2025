import React from 'react';

interface MoodIconProp {
  mood: string | number;
  size?: number;
}

const MoodIcon: React.FC<MoodIconProp> = ({ mood, size = 24 }) => {
    const getMoodIcon = () => {
        // Handle both string and number mood values
        const moodValue = typeof mood === 'string' ? mood : mood;
        
        // Map numeric values to emojis (1-5 scale)
        if (typeof mood === 'number') {
            switch (mood) {
                case 1:
                    return <span style={{ fontSize: size }} className="inline-block">😢</span>;
                case 2:
                    return <span style={{ fontSize: size }} className="inline-block">😔</span>;
                case 3:
                    return <span style={{ fontSize: size }} className="inline-block">😐</span>;
                case 4:
                    return <span style={{ fontSize: size }} className="inline-block">😊</span>;
                case 5:
                    return <span style={{ fontSize: size }} className="inline-block">😍</span>;
                default:
                    return <span style={{ fontSize: size }} className="inline-block">😐</span>;
            }
        }
        
        // Handle string mood values
        switch (moodValue) {
            case 'awesome':
                return <span style={{ fontSize: size }} className="inline-block">😍</span>;
            case 'good':
                return <span style={{ fontSize: size }} className="inline-block">😊</span>;
            case 'sad':
                return <span style={{ fontSize: size }} className="inline-block">😔</span>;
            case 'terrible':
                return <span style={{ fontSize: size }} className="inline-block">😢</span>;
            default:
                return <span style={{ fontSize: size }} className="inline-block">😐</span>;
        }
    };

    return getMoodIcon();
};


export default MoodIcon;