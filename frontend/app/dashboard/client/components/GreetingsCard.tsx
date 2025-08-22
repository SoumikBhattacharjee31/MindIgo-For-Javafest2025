"use client"
import { Sun, Moon, Sunrise, Sunset } from "lucide-react";
import { useState, useEffect } from "react";
import quotes from "@/public/quotes.json"
import Loader from "@/app/components/Loader";

const GreetingCard = () => {
    const [currentTime, setCurrentTime] = useState(new Date());
    const [quoteIndex, setQuoteIndex] = useState<number>(0);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    function getRandomInt(min: number, max: number) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    useEffect(() => {
        setCurrentTime(new Date())
        setQuoteIndex(getRandomInt(0, quotes.length - 1));
        setIsLoading(false);
    }, []);

    const getTimeBasedGreeting = () => {
        const hour = currentTime.getHours();

        if (hour >= 5 && hour < 12) {
            return {
                greeting: "Good Morning",
                message: "Take a moment to breathe deeply and set a positive intention for your day ahead.",
                icon: hour < 8 ? Sunrise : Sun
            };
        } else if (hour >= 12 && hour < 17) {
            return {
                greeting: "Good Afternoon",
                message: "Remember to pause, reflect, and nurture your mind with kindness.",
                icon: Sun
            };
        } else if (hour >= 17 && hour < 21) {
            return {
                greeting: "Good Evening",
                message: "Wind down gently and acknowledge the progress you've made today.",
                icon: Sunset
            };
        } else {
            return {
                greeting: "Good Night",
                message: "Rest well, knowing tomorrow brings new opportunities for peace and growth.",
                icon: Moon
            };
        }
    };

    const getDailyQuote = () => {
        return quotes[quoteIndex];
    };

    const { greeting, message, icon: TimeIcon } = getTimeBasedGreeting();
    const dailyQuote = getDailyQuote();

    return isLoading ? (<Loader text="Loading"/>
    ) : (
        <div className="bg-gradient-to-b from-indigo-300 to-violet-400 rounded-xl p-6 text-gray-900 shadow-lg">
            <div className="flex items-center gap-3 mb-4">
                <TimeIcon className="w-6 h-6 text-yellow-500" />
                <h2 className="text-xl font-bold">{greeting} to Your Mental Wellness Journey!</h2>
            </div>

            <p className="mb-4 opacity-90">{message}</p>

            <div className="bg-gradient-to-b from-blue-50 via-white to-blue-100 bg-opacity-50 rounded-lg p-4 text-gray-800">
                <p className="text-lg text-blue-400 mb-2 leading-relaxed font-bold">
                    "{dailyQuote.text}"
                </p>
                <p className="text-xs opacity-80 text-right">
                    — {dailyQuote.author}
                </p>
            </div>
        </div>
    )



};

export default GreetingCard;