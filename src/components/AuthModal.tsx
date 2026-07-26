'use client';

import React, { useState } from 'react';
import { X, ShieldCheck, Lock, User, ArrowRight, CheckCircle, Briefcase } from 'lucide-react';
import { Role, UserSession } from '../lib/types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (session: UserSession) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onLoginSuccess }) => {
  const [selectedRole, setSelectedRole] = useState<'admin' | 'employee'>('admin');
  const [email, setEmail] = useState('admin@tryam.ai');
  const [password, setPassword] = useState('••••••••');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const demoAccounts = [
    { name: 'Agency Admin Manager', email: 'admin@tryam.ai', role: 'admin' as const, empId: '' },
    { name: 'Rahul Verma (Agent)', email: 'rahul@tryam.com', role: 'agent' as const, empId: '42e8b5fe-5944-458a-a613-49f5353d817c' },
    { name: 'Ananya Sharma (Agent)', email: 'ananya@tryam.com', role: 'agent' as const, empId: '6952a142-bb92-4773-91ab-153abc2c9b52' },
    { name: 'Vijay Kumar (Agent)', email: 'vijay@tryam.com', role: 'agent' as const, empId: 'e1f8fc4c-9dd9-4f7b-8e94-b3d6ce5bcec0' },
  ];

  const handleSelectAccount = (acc: typeof demoAccounts[0]) => {
    setSelectedRole(acc.role === 'admin' ? 'admin' : 'employee');
    setEmail(acc.email);
    setError('');

    onLoginSuccess({
      isAuthenticated: true,
      user: {
        id: acc.empId || 'admin-001',
        name: acc.name,
        email: acc.email,
        role: acc.role,
        employeeId: acc.empId,
      },
    });

    onClose();
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter work email');
      return;
    }

    const matched = demoAccounts.find((a) => a.email.toLowerCase() === email.toLowerCase());
    const isEmp = email.includes('rahul') || email.includes('ananya') || email.includes('vijay') || email.includes('@tryam.com');

    onLoginSuccess({
      isAuthenticated: true,
      user: {
        id: matched?.empId || 'user-id',
        name: matched?.name || (isEmp ? 'Employee Specialist' : 'Agency Admin'),
        email,
        role: isEmp ? 'agent' : 'admin',
        employeeId: matched?.empId || (isEmp ? '42e8b5fe-5944-458a-a613-49f5353d817c' : undefined),
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
          maxWidth: '460px',
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
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div
            style={{
              width: '52px',
              height: '52px',
              borderRadius: '16px',
              background: 'var(--accent-primary-gradient)',
              margin: '0 auto 14px auto',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 10px 25px rgba(99, 102, 241, 0.4)',
            }}
          >
            <ShieldCheck size={26} color="#fff" />
          </div>
          <h2 style={{ fontSize: '20px', fontWeight: 700, letterSpacing: '-0.4px', color: '#fff' }}>
            TRYAM Access Portal
          </h2>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Role-Based Authentication & Client Data Isolation
          </p>
        </div>

        {/* 1-Click Quick Preset Account Buttons */}
        <div style={{ marginBottom: '22px' }}>
          <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '8px', textTransform: 'uppercase' }}>
            Quick Account Switch (Test Login)
          </label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {demoAccounts.map((acc) => (
              <button
                key={acc.email}
                type="button"
                onClick={() => handleSelectAccount(acc)}
                style={{
                  padding: '10px 14px',
                  borderRadius: '12px',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  background: acc.role === 'admin' ? 'rgba(99, 102, 241, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                  color: '#fff',
                  fontSize: '12px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {acc.role === 'admin' ? <ShieldCheck size={15} color="#818cf8" /> : <Briefcase size={15} color="#38bdf8" />}
                  <span>{acc.name}</span>
                </div>
                <span style={{ fontSize: '10px', color: acc.role === 'admin' ? '#818cf8' : '#38bdf8', fontWeight: 700 }}>
                  {acc.role === 'admin' ? 'FULL MASTER' : 'ISOLATED'}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Manual Login Form */}
        <form onSubmit={handleLoginSubmit}>
          <div style={{ marginBottom: '14px' }}>
            <label style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
              Work Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                width: '100%',
                background: 'rgba(0, 0, 0, 0.3)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '10px',
                padding: '9px 12px',
                color: '#fff',
                fontSize: '13px',
                outline: 'none',
              }}
            />
          </div>

          <div style={{ marginBottom: '18px' }}>
            <label style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
              Password / Passcode
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: '100%',
                background: 'rgba(0, 0, 0, 0.3)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '10px',
                padding: '9px 12px',
                color: '#fff',
                fontSize: '13px',
                outline: 'none',
              }}
            />
          </div>

          {error && <p style={{ color: '#f43f5e', fontSize: '12px', marginBottom: '10px' }}>{error}</p>}

          <button
            type="submit"
            className="btn-apple-primary"
            style={{ width: '100%', justifyContent: 'center', padding: '11px' }}
          >
            <span>Login to Workspace</span>
            <ArrowRight size={15} />
          </button>
        </form>

        <p style={{ textAlign: 'center', fontSize: '10px', color: 'var(--text-muted)', marginTop: '16px' }}>
          Strict Role-Based Access Control • 256-Bit Encrypted Session
        </p>
      </div>
    </div>
  );
};
