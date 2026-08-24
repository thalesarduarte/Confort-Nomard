import React from 'react';
import styles from './ProgressBar.module.css';

interface ProgressBarProps {
  value: number; // 0-100
  label?: string;
  color?: string; // valid CSS color
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ 
  value, 
  label, 
  color = 'var(--accent-teal)',
  className = ''
}) => {
  return (
    <div className={`${styles.container} ${className}`}>
      {label && (
        <div className={styles.header}>
          <span className={styles.label}>{label}</span>
          <span className={styles.value}>{value}%</span>
        </div>
      )}
      <div className={styles.track}>
        <div 
          className={styles.fill} 
          style={{ 
            width: `${Math.max(0, Math.min(100, value))}%`,
            backgroundColor: color
          }} 
        />
      </div>
    </div>
  );
};
