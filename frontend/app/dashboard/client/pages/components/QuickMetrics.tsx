import { Moon, Droplets, Smile, Activity, Star } from 'lucide-react';

import metricData from '../../mock/metric_data.json';
import MetricCard from './MetricCard';

const QuickMetrics = () => {
    const getIcon = (id: string) => {
        switch (id) {
            case 'sleep':
                return <Moon className="w-5 h-5 text-blue-500" />;
            case 'mood':
                return <Smile className="w-5 h-5 text-yellow-500" />;
            case 'water':
                return <Droplets className="w-5 h-5 text-blue-500" />;
            case 'activity':
                return <Activity className="w-5 h-5 text-green-500" />;
            default:
                return null;
        }
    }
    return (
        <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-500" />
                Your Daily Superstars!
                <span className="text-sm font-normal text-gray-600">Track more to unlock magical insights 🎉</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                {metricData.map((metric, index) => (
                    <MetricCard 
                        key={index} 
                        title={metric.title} 
                        value={metric.value} 
                        change={metric.change} 
                        trend={metric.trend} 
                        icon={getIcon(metric.id)} 
                        encouragement={metric.encouragement} 
                    />
                ))}
            </div>
        </div>
    );
}

export default QuickMetrics;