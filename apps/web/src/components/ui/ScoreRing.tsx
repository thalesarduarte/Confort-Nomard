import React, { useEffect, useState } from 'react';
import styles from './ScoreRing.module.css';

interface ScoreRingProps {
  score: number; // 0 to 100
  size?: number;
  strokeWidth?: number;
  className?: string;
  animate?: boolean;
}

export const ScoreRing: React.FC<ScoreRingProps> = ({
  score,
  size = 120,
  strokeWidth = 8,
  className = '',
  animate = true
}) => {
  const [displayScore, setDisplayScore] = useState(animate ? 0 : score);
  
  useEffect(() => {
    if (!animate) return;
    const duration = 1000;
    const steps = 60;
    const stepTime = duration / steps;
    let currentStep = 0;
    
    const timer = setInterval(() => {
      currentStep++;
      setDisplayScore(Math.round((score / steps) * currentStep));
      if (currentStep >= steps) {
        setDisplayScore(score);
        clearInterval(timer);
      }
    }, stepTime);
    
    return () => clearInterval(timer);
  }, [score, animate]);

  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (displayScore / 100) * circumference;
  
  const getColor = (s: number) => {
    if (s >= 75) return 'var(--accent-teal)';
    if (s >= 50) return 'var(--accent-amber)';
    return 'var(--accent-red)';
  };

  const color = getColor(score); // Use target score for color to avoid color flipping during animation

  return (
    <div className={`${styles.container} ${className}`} style={{ width: size, height: size }}>
      <svg width={size} height={size} className={styles.svg}>
        {/* Background ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(255,255,255,0.1)"
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Progress ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className={styles.progress}
          style={{ transition: animate ? 'stroke-dashoffset 1s ease-out' : 'none' }}
        />
      </svg>
      <div className={styles.scoreContent} style={{ color }}>
        <span className={styles.score}>{displayScore}</span>
      </div>
    </div>
  );
};
