import React from 'react';

interface PageWrapperProps {
  children: React.ReactNode;
  className?: string;
}

export const PageWrapper: React.FC<PageWrapperProps> = ({ children, className = '' }) => {
  return (
    <main 
      className={`animate-fade-in ${className}`}
      style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '88px 1.5rem 4rem', // 72px header + 16px
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {children}
    </main>
  );
};
