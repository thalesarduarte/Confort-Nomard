import React from 'react';
import styles from './Card.module.css';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  glass?: boolean;
  glow?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  glass = true,
  glow = false,
  className = '',
  ...props
}) => {
  const rootClass = [
    styles.card,
    glass ? styles.glass : '',
    glow ? styles.glow : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={rootClass} {...props}>
      {children}
    </div>
  );
};
