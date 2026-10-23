import React from 'react';
import styles from './Chip.module.css';

interface ChipProps {
  children: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
  icon?: React.ReactNode;
  variant?: 'default' | 'success' | 'danger';
  className?: string;
}

export const Chip: React.FC<ChipProps> = ({ 
  children, 
  active = false, 
  onClick, 
  icon,
  variant = 'default',
  className = ''
}) => {
  const isClickable = !!onClick;
  
  return (
    <div 
      className={`
        ${styles.chip} 
        ${active ? styles.active : ''} 
        ${isClickable ? styles.clickable : ''} 
        ${styles[variant]}
        ${className}
      `}
      onClick={onClick}
    >
      {icon && <span className={styles.icon}>{icon}</span>}
      {children}
    </div>
  );
};
