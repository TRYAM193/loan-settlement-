'use client';

import React, { useState } from 'react';
import { X, Database, Check, Copy, Code, Sparkles } from 'lucide-react';
import { POSTGRES_DDL_SQL, PRISMA_SCHEMA } from '../lib/db-schema-exporter';

interface DbHandoverModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DbHandoverModal: React.FC<DbHandoverModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'sql' | 'prisma'>('sql');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const contentToCopy = activeTab === 'sql' ? POSTGRES_DDL_SQL : PRISMA_SCHEMA;

  const handleCopy = () => {
    navigator.clipboard.writeText(contentToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        background: 'rgba(0, 0, 0, 0.8)',
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
          maxWidth: '720px',
          padding: '30px',
          background: 'linear-gradient(180deg, rgba(18, 19, 28, 0.96) 0%, rgba(10, 11, 17, 0.96) 100%)',
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

        {/* Header */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Database size={22} color="#60a5fa" />
            <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#fff' }}>
              Database Handover Package (For Backend Friend)
            </h2>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Ready-to-run PostgreSQL DDL & Prisma Schema supporting employees, leads, and smart assignment functions.
          </p>
        </div>

        {/* Tab & Copy Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <div className="apple-pill-nav">
            <button
              onClick={() => setActiveTab('sql')}
              className={`apple-pill-item ${activeTab === 'sql' ? 'active' : ''}`}
            >
              PostgreSQL DDL (.sql)
            </button>
            <button
              onClick={() => setActiveTab('prisma')}
              className={`apple-pill-item ${activeTab === 'prisma' ? 'active' : ''}`}
            >
              Prisma Schema (.prisma)
            </button>
          </div>

          <button onClick={handleCopy} className="btn-apple-secondary" style={{ padding: '7px 14px', fontSize: '12px' }}>
            {copied ? <Check size={14} color="#34d399" /> : <Copy size={14} />}
            <span>{copied ? 'Copied to Clipboard' : 'Copy Code'}</span>
          </button>
        </div>

        {/* Code Box */}
        <pre
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '12px',
            color: '#a5b4fc',
            background: 'rgba(0, 0, 0, 0.5)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '14px',
            padding: '16px',
            maxHeight: '380px',
            overflowY: 'auto',
            lineHeight: '1.5',
            whiteSpace: 'pre-wrap',
          }}
        >
          {contentToCopy}
        </pre>
      </div>
    </div>
  );
};
