import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

export default function CountdownTimer({ targetDate }: { targetDate: string }) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [expired, setExpired] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const target = new Date(targetDate).getTime();
      const diff = target - now;

      if (diff <= 0) {
        setExpired(true);
        clearInterval(interval);
        return;
      }

      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000),
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [targetDate]);

  if (expired) {
    return (
      <div className="flex items-center gap-2 text-green-600 dark:text-green-400 font-semibold">
        <Clock className="w-4 h-4" />
        <span>Тур уже начался!</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <Clock className="w-5 h-5 text-blue-500" />
      <div className="flex gap-2">
        {[
          { value: timeLeft.days, label: 'д' },
          { value: timeLeft.hours, label: 'ч' },
          { value: timeLeft.minutes, label: 'м' },
          { value: timeLeft.seconds, label: 'с' },
        ].map((item, i) => (
          <div key={i} className="flex flex-col items-center">
            <div className="bg-blue-600 text-white rounded-lg px-2 py-1 min-w-[36px] text-center font-bold text-sm">
              {String(item.value).padStart(2, '0')}
            </div>
            <span className="text-[10px] text-gray-500 dark:text-gray-400">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
