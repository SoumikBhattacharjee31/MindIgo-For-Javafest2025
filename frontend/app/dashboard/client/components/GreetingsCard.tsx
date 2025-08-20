import { Star } from "lucide-react";

const GreetingsCard = () => {
    return (
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg p-6 text-white">
            <div className="flex items-center gap-2">
                <Star className="w-6 h-6" />
                <h2 className="text-xl font-bold">Welcome to Your Wellness Journey! 🌟</h2>
            </div>
            <p className="mt-2 opacity-90">Every log, every moment counts towards your amazing transformation!</p>
        </div>
    );
};

export default GreetingsCard;
