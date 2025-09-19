interface MetricCardProp {
  title: string;
  value: string;
  change: string;
  trend: string | "up" | "down" | "neutral";
  icon: React.ReactNode;
  encouragement: string;
}

const MetricCard: React.FC<MetricCardProp> = ({
  title,
  value,
  change,
  trend,
  icon,
  encouragement,
}) => {
  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        {icon}
        <span
          className={`text-sm font-medium px-2 py-1 rounded-full ${
            trend === "up"
              ? "text-green-700 bg-green-100"
              : trend === "down"
              ? "text-red-700 bg-red-100"
              : "text-gray-700 bg-gray-100"
          }`}
        >
          {change}
        </span>
      </div>
      <h3 className="text-gray-600 text-sm font-medium">{title}</h3>
      <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
      <p className="text-xs text-purple-600 mt-2 font-medium">
        {encouragement}
      </p>
    </div>
  );
};

export default MetricCard;
