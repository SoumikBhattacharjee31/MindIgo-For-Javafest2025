'use client'
import { useState,useEffect } from 'react';
import { Plus, Minus } from 'lucide-react';

interface NumberPickerProps {
  min: number;
  max: number;
  defaultValue: number;
  onChange: (value: number) => void;
  loop?: boolean;
  label?: string;
  unit?: string;
}

const NumberPicker: React.FC<NumberPickerProps> = ({ 
  min, 
  max, 
  defaultValue, 
  onChange, 
  loop = true,
  label,
  unit = "sec"
}) => {
  const [value, setValue] = useState(defaultValue);

  const handleIncrease = () => {
    let newValue = value + 1;
    if (loop && newValue > max) {
      newValue = min;
    } else if (!loop && newValue > max) {
      newValue = max;
    }
    setValue(newValue);
    onChange(newValue);
  };

  const handleDecrease = () => {
    let newValue = value - 1;
    if (loop && newValue < min) {
      newValue = max;
    } else if (!loop && newValue < min) {
      newValue = min;
    }
    setValue(newValue);
    onChange(newValue);
  };

  useEffect(() => {
    setValue(defaultValue);
  }, [defaultValue]);

  return (
    <div className="flex flex-col items-center">
      {label && (
        <label className="block text-white/70 text-sm mb-3 font-medium">{label}</label>
      )}
      <div className="flex flex-col w-20 bg-gradient-to-b from-white/10 to-white/5 rounded-xl shadow-lg border border-white/20 overflow-hidden">
        {/* Plus Button */}
        <button
          onClick={handleIncrease}
          disabled={!loop && value >= max}
          className="h-12 bg-gradient-to-b from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 
                     disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed
                     text-white transition-all duration-200 
                     active:scale-95 shadow-md hover:shadow-lg
                     border-b border-emerald-700/30 flex items-center justify-center"
        >
          <Plus size={20} strokeWidth={3} />
        </button>

        {/* Current Value Display */}
        <div className="h-16 flex flex-col items-center justify-center bg-white/20 backdrop-blur-sm 
                        border-y border-white/30 relative">
          <span className="text-2xl font-bold text-white drop-shadow-md">
            {value}
          </span>
          <span className="text-xs text-white/70 font-medium">
            {unit}
          </span>
        </div>

        {/* Minus Button */}
        <button
          onClick={handleDecrease}
          disabled={!loop && value <= min}
          className="h-12 bg-gradient-to-b from-rose-500 to-rose-600 hover:from-rose-400 hover:to-rose-500
                     disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed
                     text-white transition-all duration-200 
                     active:scale-95 shadow-md hover:shadow-lg
                     border-t border-rose-700/30 flex items-center justify-center"
        >
          <Minus size={20} strokeWidth={3} />
        </button>
      </div>
    </div>
  );
};
export default NumberPicker;