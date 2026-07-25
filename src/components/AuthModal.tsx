'use client';

import React, { useState } from 'react';
import { X, ShieldCheck, Lock, User, ArrowRight, CheckCircle } from 'lucide-react';
import { Role, UserSession } from '../lib/types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (session: UserSession) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onLoginSuccess }) => {
  const [selectedRole, setSelectedRole] = useState<Role>('admin');
  const [email, setEmail] = useState('admin@tryam.ai');
  const [password, setPassword] = useState('••••••••');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleRoleSelect = (role: Role) => {
    setSelectedRole(role);
    if (role === 'admin') setEmail('admin@tryam.ai');
    if (role === 'senior_specialist') setEmail('rahul.s@tryam.ai');
    if (role === 'agent') setEmail('priya.p@tryam.ai');
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your work email');
      return;
    }

    const nameMap: Record<Role, string> = {
      admin: 'Agency Admin Manager',
      senior_specialist: 'Rahul Sharma (Senior Rep)',
      agent: 'Priya Patel (Agent)',
    };

    onLoginSuccess({
      isAuthenticated: true,
      user: {
        id: selectedRole === 'admin' ? 'admin-001' : selectedRole === 'senior_specialist' ? 'emp-101' : 'emp-102',
        name: nameMap[selectedRole],
        email: email,
        role: selectedRole,
      },
    });

    onClose();
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        background: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(16px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
    >
      <div
        className="glass-card animate-fade-in"
        style={{
          width: '100%',
          maxWidth: '440px',
          padding: '32px',
          background: 'linear-gradient(180deg, rgba(24, 25, 35, 0.95) 0%, rgba(14, 15, 22, 0.95) 100%)',
          borderRadius: '24px',
          position: 'relative',
          border: '1px solid rgba(255, 255, 255, 0.12)',
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: 'rgba(255, 255, 255, 0.06)',
            border: 'none',
            color: 'var(--text-muted)',
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <X size={16} />
        </button>

        {/* Modal Header */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '18px',
              background: 'var(--accent-primary-gradient)',
              margin: '0 auto 16px auto',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 10px 25px rgba(99, 102, 241, 0.4)',
            }}
          >
            <ShieldCheck size={28} color="#fff" />
          </div>
          <h2 style={{ fontSize: '22px', fontWeight: 700, letterSpacing: '-0.4px', color: '#fff' }}>
            TRYAM AI Access Portal
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '6px' }}>
            Enterprise Loan Settlement CRM & Lead Engine
          </p>
        </div>

        {/* Role Selector Tabs */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Select Access Role
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
            {(['admin', 'senior_specialist', 'agent'] as Role[]).map((role) => (
              <button
                key={role}
                type="button"
                onClick={() => handleRoleSelect(role)}
                style={{
                  padding: '10px 6px',
                  borderRadius: '12px',
                  border: selectedRole === role ? '1px solid var(--accent-primary)' : '1px solid var(--border-subtle)',
                  background: selectedRole === role ? 'rgba(99, 102, 241, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                  color: selectedRole === role ? '#fff' : 'var(--text-secondary)',
                  fontSize: '11px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  textAlign: 'center',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                {selectedRole === role && <CheckCircle size={12} color="#818cf8" />}
                <span>
                  {role === 'admin' ? 'Admin' : role === 'senior_specialist' ? 'Senior Rep' : 'Agent'}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Form Inputs */}
        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
              Work Email
            </label>
            <div style={{ position: 'relative' }}>
              <User size={15} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  width: '100%',
                  background: 'rgba(0, 0, 0, 0.3)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '12px',
                  padding: '11px 12px 11px 36px',
                  color: '#fff',
                  fontSize: '13px',
                  outline: 'none',
                }}
              />
            </div>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
              Security Passcode / PIN
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={15} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: '100%',
                  background: 'rgba(0, 0, 0, 0.3)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '12px',
                  padding: '11px 12px 11px 36px',
                  color: '#fff',
                  fontSize: '13px',
                  outline: 'none',
                }}
              />
            </div>
          </div>

          {error && (
            <p style={{ color: '#f43f5e', fontSize: '12px', marginBottom: '14px', textAlign: 'center' }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            className="btn-apple-primary"
            style={{ width: '100%', justifyContent: 'center', padding: '13px' }}
          >
            <span>Authenticate Session</span>
            <ArrowRight size={16} />
          </button>
        </form>

        <p style={{ textAlign: 'center', fontSize: '11px', color: 'var(--text-muted)', marginTop: '20px' }}>
          Role-Based Access Control Enabled • 256-Bit Encrypted
        </p>
      </div>
    </div>
  );
};
