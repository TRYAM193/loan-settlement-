'use client';

import React from 'react';
import {
  Building2,
  PlusCircle,
  Database,
  UserCheck,
  PhoneCall,
  Search,
  ShieldCheck,
  LogOut,
  Lock,
} from 'lucide-react';
import { UserSession } from '../lib/types';

interface NavbarProps {
  session: UserSession;
  onOpenIngestModal: () => void;
  onOpenDbModal: () => void;
  onOpenAuthModal: () => void;
  onLogout: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  session,
  onOpenIngestModal,
  onOpenDbModal,
  onOpenAuthModal,
  onLogout,
  searchQuery,
  setSearchQuery,
}) => {
  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        background: 'rgba(9, 9, 11, 0.8)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--border-subtle)',
        padding: '12px 28px',
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              background: 'var(--accent-primary-gradient)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 14px rgba(99, 102, 241, 0.4)',
            }}
          >
            <Building2 size={22} color="#fff" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span
                style={{
                  fontWeight: 700,
                  fontSize: '17px',
                  letterSpacing: '-0.3px',
                  background: 'linear-gradient(180deg, #FFFFFF 0%, #CBD5E1 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                TRYAM CRM
              </span>
              <span
                style={{
                  fontSize: '10px',
                  fontWeight: 700,
                  background: 'rgba(99, 102, 241, 0.2)',
                  color: '#a5b4fc',
                  padding: '2px 8px',
                  borderRadius: '999px',
                  border: '1px solid rgba(99, 102, 241, 0.3)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}
              >
                Enterprise AI
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
              <span className="pulse-dot" style={{ background: '#10b981' }} />
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 500 }}>
                Google & Telephony Ingestion Active
              </span>
            </div>
          </div>
        </div>

        {/* Global Search Input */}
        <div style={{ flex: 1, maxWidth: '420px', position: 'relative' }}>
          <Search
            size={16}
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
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '999px',
              padding: '9px 16px 9px 40px',
              color: 'var(--text-primary)',
              fontSize: '13px',
              outline: 'none',
              transition: 'all 0.2s ease',
            }}
            onFocus={(e) => (e.target.style.borderColor = 'var(--accent-primary)')}
            onBlur={(e) => (e.target.style.borderColor = 'var(--border-subtle)')}
          />
        </div>

        {/* Action Buttons & Auth Pill */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* DB Schema Export Button for Friend */}
          <button
            onClick={onOpenDbModal}
            className="btn-apple-secondary"
            title="Download PostgreSQL DDL & Prisma schema for DB engineer"
          >
            <Database size={15} color="#60a5fa" />
            <span style={{ fontSize: '12px' }}>DB Schema DDL</span>
          </button>

          {/* New Lead Ingestion */}
          <button onClick={onOpenIngestModal} className="btn-apple-primary">
            <PlusCircle size={17} />
            <span>+ Ingest Lead</span>
          </button>

          {/* User Auth Session Pill */}
          {session.isAuthenticated && session.user ? (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                background: 'rgba(255, 255, 255, 0.05)',
                padding: '4px 12px 4px 6px',
                borderRadius: '999px',
                border: '1px solid var(--border-subtle)',
              }}
            >
              <div
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  background: 'var(--accent-emerald-gradient)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '12px',
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
                <span style={{ fontSize: '10px', color: '#a5b4fc', textTransform: 'capitalize' }}>
                  {session.user.role.replace('_', ' ')}
                </span>
              </div>
              <button
                onClick={onLogout}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: '4px',
                  marginLeft: '4px',
                  display: 'flex',
                }}
                title="Logout"
              >
                <LogOut size={14} />
              </button>
            </div>
          ) : (
            <button onClick={onOpenAuthModal} className="btn-apple-secondary">
              <Lock size={14} color="#f43f5e" />
              <span>Login</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
