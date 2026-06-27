import { useEffect, useState, type FC } from 'react';

interface AnimatedCounterProps {
  value: number | string | undefined | null;
  formatter?: (val: number) => string;
}

export const AnimatedCounter: FC<AnimatedCounterProps> = ({ value, formatter }) => {
  const numValue = Number(value);
  const isNumeric = !isNaN(numValue) && value !== null && value !== undefined && value !== '';
  
  const [count, setCount] = useState(() => {
    if (!isNumeric) return 0;
    // Server/initial state safety check
    return 0;
  });

  useEffect(() => {
    if (!isNumeric) return;
    
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) {
      setCount(numValue);
      return;
    }

    let start = 0;
    const end = numValue;
    if (start === end) {
      setCount(end);
      return;
    }

    const duration = 800; // 800ms animation
    const startTime = performance.now();

    let animationFrameId: number;

    const updateCount = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Ease out quad
      const easeProgress = progress * (2 - progress);
      const currentVal = Math.round(start + (end - start) * easeProgress);

      setCount(currentVal);

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(updateCount);
      }
    };

    animationFrameId = requestAnimationFrame(updateCount);
    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [numValue, isNumeric]);

  if (!isNumeric) {
    return <>{value ?? ''}</>;
  }

  return <>{formatter ? formatter(count) : count}</>;
};
