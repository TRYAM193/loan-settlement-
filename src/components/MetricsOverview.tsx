'use client';

import React from 'react';
import { IndianRupee, Users, ShieldAlert, Zap, TrendingUp, CheckCircle2 } from 'lucide-react';
import { Employee, Lead, Settlement } from '../lib/types';

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
  const totalDebt = leads.reduce((acc, curr) => acc + curr.totalDebtAmount, 0);
  const activeLeadsCount = leads.length;
  const harassmentCount = leads.filter((l) => l.harassmentReported).length;

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
        gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
        gap: '18px',
        marginBottom: '28px',
      }}
    >
      {/* Metric 1: Total Debt Portfolio */}
      <div className="glass-card" style={{ padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <span style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-secondary)' }}>
              Active Debt Portfolio
            </span>
            <h3
              style={{
                fontSize: '26px',
                fontWeight: 800,
                marginTop: '6px',
                fontFamily: 'var(--font-mono)',
                color: '#fff',
                letterSpacing: '-0.5px',
              }}
            >
              {formatCurrency(totalDebt)}
            </h3>
          </div>
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: 'rgba(99, 102, 241, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid rgba(99, 102, 241, 0.3)',
            }}
          >
            <IndianRupee size={20} color="#818cf8" />
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '14px', fontSize: '11px', color: '#34d399' }}>
          <TrendingUp size={13} />
          <span>+14.2% extracted via AI vision OCR</span>
        </div>
      </div>

      {/* Metric 2: Omnichannel Leads */}
      <div className="glass-card" style={{ padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <span style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-secondary)' }}>
              Active Ingested Clients
            </span>
            <h3
              style={{
                fontSize: '26px',
                fontWeight: 800,
                marginTop: '6px',
                fontFamily: 'var(--font-mono)',
                color: '#fff',
                letterSpacing: '-0.5px',
              }}
            >
              {activeLeadsCount}
            </h3>
          </div>
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: 'rgba(56, 189, 248, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid rgba(56, 189, 248, 0.3)',
            }}
          >
            <Users size={20} color="#38bdf8" />
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '14px', fontSize: '11px', color: 'var(--text-muted)' }}>
          <span>Captured via Google, WhatsApp & Calls</span>
        </div>
      </div>

      {/* Metric 3: Workload Balancing Efficiency */}
      <div className="glass-card" style={{ padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <span style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-secondary)' }}>
              Team Capacity Utilization
            </span>
            <h3
              style={{
                fontSize: '26px',
                fontWeight: 800,
                marginTop: '6px',
                fontFamily: 'var(--font-mono)',
                color: '#fff',
                letterSpacing: '-0.5px',
              }}
            >
              {workloadPercentage}%
            </h3>
          </div>
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: 'rgba(16, 185, 129, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid rgba(16, 185, 129, 0.3)',
            }}
          >
            <Zap size={20} color="#34d399" />
          </div>
        </div>
        {/* Progress Bar */}
        <div
          style={{
            width: '100%',
            height: '6px',
            background: 'rgba(255, 255, 255, 0.08)',
            borderRadius: '999px',
            marginTop: '16px',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              width: `${workloadPercentage}%`,
              height: '100%',
              background: 'var(--accent-emerald-gradient)',
              borderRadius: '999px',
              transition: 'width 0.5s ease',
            }}
          />
        </div>
      </div>

      {/* Metric 4: Harassment Protection Cases */}
      <div className="glass-card" style={{ padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <span style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-secondary)' }}>
              Anti-Harassment Notices
            </span>
            <h3
              style={{
                fontSize: '26px',
                fontWeight: 800,
                marginTop: '6px',
                fontFamily: 'var(--font-mono)',
                color: '#fb7185',
                letterSpacing: '-0.5px',
              }}
            >
              {harassmentReportedCount(harassmentCount)}
            </h3>
          </div>
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: 'rgba(244, 63, 94, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid rgba(244, 63, 94, 0.3)',
            }}
          >
            <ShieldAlert size={20} color="#f43f5e" />
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '14px', fontSize: '11px', color: '#fb7185' }}>
          <CheckCircle2 size={13} />
          <span>RBI Fair Practices Protection Active</span>
        </div>
      </div>
    </div>
  );
};

function harassmentReportedCount(count: number) {
  return count > 0 ? `${count} Protected` : '0 Active';
}
