"use client";

const colorMap = {
  blue: "bg-blue-50 text-blue-600 border-blue-200",
  green: "bg-green-50 text-green-600 border-green-200",
  purple: "bg-purple-50 text-purple-600 border-purple-200",
  red: "bg-red-50 text-red-600 border-red-200",
  yellow: "bg-yellow-50 text-yellow-600 border-yellow-200",
  indigo: "bg-indigo-50 text-indigo-600 border-indigo-200",
  pink: "bg-pink-50 text-pink-600 border-pink-200",
};

type Color = keyof typeof colorMap;

interface StatsCardProps {
  title: string;
  value: number;
  icon: string;
  color: Color;
}

const StatsCard = ({ title, value, icon, color }: StatsCardProps) => {
  const getColorClasses = (color: Color) => {
    return colorMap[color] || colorMap.blue;
  };

  const formatNumber = (num: number) => {
    if (num >= 1_000_000) {
      return (num / 1_000_000).toFixed(1) + "M";
    }
    if (num >= 1_000) {
      return (num / 1_000).toFixed(1) + "K";
    }
    return num.toString();
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">
            {formatNumber(value)}
          </p>
        </div>
        <div
          className={`w-12 h-12 rounded-lg border flex items-center justify-center text-2xl ${getColorClasses(
            color
          )}`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
};

export default StatsCard;