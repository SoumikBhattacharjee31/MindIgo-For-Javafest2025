"use client";
import React, { ReactNode } from "react";

interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  color?: "blue" | "green" | "yellow" | "red" | "purple";
}

const colorClasses = {
    "blue": "bg-blue-500",
    "green": "bg-green-500",
    "yellow": "bg-yellow-500",
    "purple": "bg-purple-500",
    "red": "bg-red-500",
};
const StatCard = ({ title, value, icon, color = "blue" }: StatCardProps) => {
  const colorClass = colorClasses[color];
  return (
    <div className="bg-white p-6 rounded-lg shadow flex items-center space-x-4">
      <div className={`p-3 rounded-full ${colorClass} text-white`}>
        {icon}
      </div>
      <div>
        <h3 className="text-gray-500 text-sm">{title}</h3>
        <p className="text-2xl font-bold text-gray-800">{value}</p>
      </div>
    </div>
  );
};

export default StatCard;