import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useUserStore } from '@/store/useUserStore';
import { Button } from '@/components/ui/Button';
import styles from './Header.module.css';

export const Header: React.FC = () => {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const { user, isLoggedIn } = useUserStore();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleLanguage = () => {
    const nextLang = i18n.language.startsWith('pt') ? 'en-US' : 'pt-BR';
    i18n.changeLanguage(nextLang);
  };

  return (
    <header className={`${styles.header} ${scrolled ? styles.scrolled : ''}`}>
      <div className={styles.container}>
        <Link to="/" className={styles.logo}>
          <span className={styles.logoIcon}>🧭</span>
          <span className={`gradient-text ${styles.logoText}`}>Comfort Nomad</span>
        </Link>

        <nav className={styles.nav}>
          <Link to="/" className={`${styles.link} ${location.pathname === '/' ? styles.active : ''}`}>
            {t('nav.home')}
          </Link>
          <Link to="/search" className={`${styles.link} ${location.pathname === '/search' ? styles.active : ''}`}>
            {t('nav.explore')}
          </Link>
        </nav>

        <div className={styles.actions}>
          <button onClick={toggleLanguage} className={styles.langToggle}>
            {i18n.language.startsWith('pt') ? 'PT' : 'EN'}
          </button>
          
          {isLoggedIn ? (
            <Link to="/profile" className={styles.avatarLink}>
              <div className={styles.avatar}>
                {user?.name?.charAt(0).toUpperCase()}
              </div>
            </Link>
          ) : (
            <Link to="/login">
              <Button variant="ghost" size="sm">Login</Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

