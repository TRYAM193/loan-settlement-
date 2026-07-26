'use client';

import React from 'react';
import { IndianRupee, Users, ShieldAlert, Zap, TrendingUp, Activity } from 'lucide-react';
import { Employee, Lead, Settlement } from '../lib/types';
import { AntigravityCard } from './AntigravityCard';

interface MetricsOverviewProps {
  leads: Lead[];
  employees: Employee[];
  settlements: Settlement[];
}

export const MetricsOverview: React.FC<MetricsOverviewProps> = ({
  leads,
  employees,
  settlements,
}) => {
  const activeLeads = leads.filter((l) => l.status !== 'settled');
  const settledLeads = leads.filter((l) => l.status === 'settled');

  const totalActiveDebt = activeLeads.reduce((acc, curr) => acc + curr.totalDebtAmount, 0);
  const activeLeadsCount = activeLeads.length;
  const harassmentCount = activeLeads.filter((l) => l.harassmentReported).length;

  const totalActiveCases = employees.reduce((acc, curr) => acc + curr.activeCases, 0);
  const totalMaxCapacity = employees.reduce((acc, curr) => acc + curr.maxCapacity, 0);
  const workloadPercentage = Math.round((totalActiveCases / (totalMaxCapacity || 1)) * 100);

  const formatCurrency = (val: number) => {
    if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)} Cr`;
    if (val >= 100000) return `₹${(val / 100000).toFixed(2)} L`;
    return `₹${val.toLocaleString('en-IN')}`;
  };

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '18px',
        marginBottom: '28px',
        perspective: '1200px',
      }}
    >
      {/* Metric 1: Active Debt Portfolio */}
      <AntigravityCard glowColor="rgba(0, 113, 227, 0.15)" style={{ padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <span style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-muted)' }}>
              Active Debt Portfolio
            </span>
            <h3
              style={{
                fontSize: '26px',
                fontWeight: 700,
                marginTop: '6px',
                fontFamily: 'var(--font-mono)',
                color: 'var(--text-primary)',
                letterSpacing: '-0.5px',
              }}
            >
              {formatCurrency(totalActiveDebt)}
            </h3>
          </div>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              background: 'rgba(0, 113, 227, 0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid rgba(0, 113, 227, 0.15)',
            }}
          >
            <IndianRupee size={20} color="var(--accent-apple-blue)" />
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '14px', fontSize: '12px', color: '#248a3d', fontWeight: 600 }}>
          <TrendingUp size={13} />
          <span>+14.2% extracted via AI vision OCR</span>
        </div>
      </AntigravityCard>

      {/* Metric 2: Active Ingested Clients */}
      <AntigravityCard glowColor="rgba(0, 113, 227, 0.15)" style={{ padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <span style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-muted)' }}>
              Active Ingested Clients
            </span>
            <h3
              style={{
                fontSize: '26px',
                fontWeight: 700,
                marginTop: '6px',
                fontFamily: 'var(--font-mono)',
                color: 'var(--text-primary)',
                letterSpacing: '-0.5px',
              }}
            >
              {activeLeadsCount}
            </h3>
          </div>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              background: 'var(--bg-pill)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <Users size={20} color="var(--text-secondary)" />
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '14px', fontSize: '12px', color: 'var(--text-muted)' }}>
          <Activity size={13} />
          <span>
            {settledLeads.length > 0 ? `${settledLeads.length} Settled Case(s)` : 'Captured via Google, WhatsApp & Calls'}
          </span>
        </div>
      </AntigravityCard>

      {/* Metric 3: Team Capacity Utilization */}
      <AntigravityCard glowColor="rgba(0, 113, 227, 0.15)" style={{ padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <span style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-muted)' }}>
              Team Capacity Utilization
            </span>
            <h3
              style={{
                fontSize: '26px',
                fontWeight: 700,
                marginTop: '6px',
                fontFamily: 'var(--font-mono)',
                color: 'var(--text-primary)',
                letterSpacing: '-0.5px',
              }}
            >
              {workloadPercentage}%
            </h3>
          </div>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              background: 'var(--bg-pill)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <Zap size={20} color="var(--text-secondary)" />
          </div>
        </div>
        {/* Restrained Apple Progress Bar */}
        <div
          style={{
            width: '100%',
            height: '6px',
            background: 'var(--bg-pill)',
            borderRadius: '999px',
            marginTop: '16px',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              width: `${workloadPercentage}%`,
              height: '100%',
              background: 'var(--accent-apple-blue)',
              borderRadius: '999px',
              transition: 'width 0.5s ease',
            }}
          />
        </div>
      </AntigravityCard>

      {/* Metric 4: Anti-Harassment Notices */}
      <AntigravityCard glowColor="rgba(0, 113, 227, 0.15)" style={{ padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <span style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-muted)' }}>
              Anti-Harassment Notices
            </span>
            <h3
              style={{
                fontSize: '26px',
                fontWeight: 700,
                marginTop: '6px',
                fontFamily: 'var(--font-mono)',
                color: 'var(--text-primary)',
                letterSpacing: '-0.5px',
              }}
            >
              {harassmentReportedCount(harassmentCount)}
            </h3>
          </div>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              background: 'rgba(255, 59, 48, 0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid rgba(255, 59, 48, 0.15)',
            }}
          >
            <ShieldAlert size={20} color="#ff3b30" />
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '14px', fontSize: '12px', color: 'var(--text-secondary)' }}>
          <Activity size={13} color="#248a3d" />
          <span>RBI Fair Practices Protection Active</span>
        </div>
      </AntigravityCard>
    </div>
  );
};

function harassmentReportedCount(count: number) {
  return count > 0 ? `${count} Protected` : '0 Active';
}
