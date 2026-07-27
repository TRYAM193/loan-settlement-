'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Building2,
  PlusCircle,
  Search,
  LogOut,
  Lock,
  Database,
} from 'lucide-react';
import { UserSession } from '../lib/types';

interface NavbarProps {
  session: UserSession;
  onOpenIngestModal: () => void;
  onOpenAuthModal: () => void;
  onLogout: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  session,
  onOpenIngestModal,
  onOpenAuthModal,
  onLogout,
  searchQuery,
  setSearchQuery,
}) => {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const savedTheme = localStorage.getItem('tryam_theme') as 'light' | 'dark' | null;
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.setAttribute('data-theme', savedTheme);
    } else {
      document.documentElement.setAttribute('data-theme', 'light');
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    localStorage.setItem('tryam_theme', nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme);
  };

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        background: 'var(--bg-glass)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--border-subtle)',
        padding: '12px 28px',
        transition: 'background-color 0.3s ease',
      }}
    >
      <div
        style={{
          maxWidth: '1400px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '20px',
        }}
      >
        {/* Brand Logo & Telephony Status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              background: 'var(--accent-apple-gradient)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 10px rgba(0, 113, 227, 0.3)',
            }}
          >
            <Building2 size={20} color="#fff" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span
                style={{
                  fontWeight: 700,
                  fontSize: '17px',
                  letterSpacing: '-0.3px',
                  color: 'var(--text-primary)',
                }}
              >
                TRYAM CRM
              </span>
              <span
                style={{
                  fontSize: '10px',
                  fontWeight: 600,
                  background: 'var(--bg-pill)',
                  color: 'var(--accent-apple-blue)',
                  padding: '2px 8px',
                  borderRadius: '999px',
                  border: '1px solid var(--border-subtle)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.4px',
                }}
              >
                Enterprise AI
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
              <span className="spin" style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#34c759' }} />
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 500 }}>
                Live Telephony & Ingestion Active
              </span>
            </div>
          </div>
        </div>

        {/* Global Search Input */}
        <div style={{ flex: 1, maxWidth: '420px', position: 'relative' }}>
          <Search
            size={15}
            color="var(--text-muted)"
            style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }}
          />
          <input
            type="text"
            placeholder="Search leads by name, phone, bank, or rep..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              background: 'var(--bg-pill)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '999px',
              padding: '9px 16px 9px 38px',
              color: 'var(--text-primary)',
              fontSize: '13px',
              outline: 'none',
              transition: 'all 0.2s ease',
            }}
            onFocus={(e) => (e.target.style.borderColor = 'var(--accent-apple-blue)')}
            onBlur={(e) => (e.target.style.borderColor = 'var(--border-subtle)')}
          />
        </div>

        {/* Action Buttons & Theme Switcher */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Apple Light / Dark Theme Switcher Button */}
          <button
            onClick={toggleTheme}
            className="btn-apple-secondary"
            style={{ padding: '8px 12px', fontSize: '12px' }}
            title={theme === 'light' ? 'Switch to Space Gray Dark Mode' : 'Switch to Apple Light Studio Mode'}
          >
            {theme === 'light' ? (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>
                <span>Space Gray</span>
              </>
            ) : (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>
                <span>Light Studio</span>
              </>
            )}
          </button>

          {/* New Lead Ingestion */}
          <button onClick={onOpenIngestModal} className="btn-apple-primary">
            <PlusCircle size={16} />
            <span>+ Ingest Lead</span>
          </button>

          {/* User Auth Session Pill */}
          {session.isAuthenticated && session.user ? (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: 'var(--bg-pill)',
                padding: '4px 10px 4px 6px',
                borderRadius: '999px',
                border: '1px solid var(--border-subtle)',
              }}
            >
              <div
                style={{
                  width: '26px',
                  height: '26px',
                  borderRadius: '50%',
                  background: 'var(--accent-apple-blue)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '11px',
                  fontWeight: 700,
                  color: '#fff',
                }}
              >
                {session.user.name.charAt(0)}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {session.user.name}
                </span>
                <span style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'capitalize' }}>
                  {session.user.role.replace('_', ' ')}
                </span>
              </div>
              <button
                onClick={onOpenAuthModal}
                style={{
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-primary)',
                  cursor: 'pointer',
                  padding: '3px 8px',
                  borderRadius: '8px',
                  fontSize: '10px',
                  fontWeight: 600,
                  marginLeft: '4px',
                }}
                title="Switch Role or Login Account"
              >
                Switch
              </button>
              <button
                onClick={onLogout}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex',
                }}
                title="Logout"
              >
                <LogOut size={14} />
              </button>
            </div>
          ) : (
            <button onClick={onOpenAuthModal} className="btn-apple-secondary">
              <Lock size={14} color="#ff3b30" />
              <span>Login</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
