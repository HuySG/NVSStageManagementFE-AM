import { ArrowUp, ArrowDown } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: number;
  change: number;
}

export default function StatsCard({ title, value, change }: StatsCardProps) {
  return (
    <div className="flex w-full max-w-2xl flex-col rounded-xl bg-white p-10 shadow-md dark:bg-gray-900">
      <div className="flex items-center justify-between text-2xl text-gray-600 dark:text-gray-300">
        <span>{title}</span>
        {change !== 0 && (
          <span
            className={`flex items-center ${change > 0 ? "text-green-500" : "text-red-500"}`}
          >
            {change > 0 ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
            {Math.abs(change)}
          </span>
        )}
      </div>
      <div className="text-2xl font-semibold text-gray-900 dark:text-white">
        {value}
      </div>
    </div>
  );
}
