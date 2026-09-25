import { useState, useEffect } from 'react';

export interface CountdownResult {
  formatted: string;
  hours: number;
  minutes: number;
  seconds: number;
  isExpired: boolean;
  totalSecondsRemaining: number;
}

export const useCountdown = (targetDate: string | Date | undefined): CountdownResult => {
  const calculate = (): CountdownResult => {
    if (!targetDate) {
      return {
        formatted: '00:00:00',
        hours: 0,
        minutes: 0,
        seconds: 0,
        isExpired: true,
        totalSecondsRemaining: 0,
      };
    }

    const targetTime = new Date(targetDate).getTime();
    const now = new Date().getTime();
    const difference = targetTime - now;

    if (difference <= 0) {
      return {
        formatted: 'Expired',
        hours: 0,
        minutes: 0,
        seconds: 0,
        isExpired: true,
        totalSecondsRemaining: 0,
      };
    }

    const totalSeconds = Math.floor(difference / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
    const formatted = `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;

    return {
      formatted,
      hours,
      minutes,
      seconds,
      isExpired: false,
      totalSecondsRemaining: totalSeconds,
    };
  };

  const [timeLeft, setTimeLeft] = useState<CountdownResult>(calculate());

  useEffect(() => {
    const timer = setInterval(() => {
      const nextVal = calculate();
      setTimeLeft(nextVal);
      if (nextVal.isExpired) {
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  return timeLeft;
};
