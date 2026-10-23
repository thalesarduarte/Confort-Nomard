import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer style={{
      borderTop: '1px solid var(--border)',
      padding: '2rem 1.5rem',
      textAlign: 'center',
      color: 'var(--text-muted)',
      fontSize: '0.875rem'
    }}>
      <p>Comfort Nomad © {new Date().getFullYear()}. Sinta-se em casa, antes mesmo de chegar.</p>
      <p>Sobre · Dados fictícios e ilustrativos nesta versão.</p>
    </footer>
  );
};
