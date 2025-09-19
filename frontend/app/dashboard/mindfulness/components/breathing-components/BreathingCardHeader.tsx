import { Info } from "lucide-react";
const BreathingCardHeader = () => {
  return (
    <div className="flex items-center justify-between mb-8">
      <div className="flex items-center space-x-4">
        <h1 className="text-xl font-medium">Choose a breathing exercise</h1>
      </div>
      <Info className="w-6 h-6" />
    </div>
  );
};
export default BreathingCardHeader;
