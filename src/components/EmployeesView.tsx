'use client';

import React from 'react';
import { UserCheck, Award } from 'lucide-react';
import { Employee, EmployeeStatus, Lead } from '../lib/types';

interface EmployeesViewProps {
  employees: Employee[];
  onToggleStatus?: (employeeId: string, newStatus: EmployeeStatus) => void;
  leads?: Lead[];
}

export const EmployeesView: React.FC<EmployeesViewProps> = ({ employees, onToggleStatus, leads }) => {
  return (
    <div>
      {/* Explanation Banner */}
      <div
        style={{
          background: 'var(--bg-pill)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '16px',
          padding: '18px 24px',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '14px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <UserCheck size={22} color="var(--accent-apple-blue)" />
          <div>
            <h4 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)' }}>
              Workload-Aware Lead Balancing Algorithm
            </h4>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
              Incoming leads from Google Business, WhatsApp, or Calls are instantly routed to the employee with the lowest active cases.
            </p>
          </div>
        </div>
        <div
          style={{
            background: 'var(--bg-surface)',
            padding: '6px 14px',
            borderRadius: '999px',
            fontSize: '12px',
            color: 'var(--accent-apple-blue)',
            fontWeight: 600,
            border: '1px solid var(--border-subtle)',
          }}
        >
          {employees.filter((e) => e.status === 'available').length} / {employees.length} Agents Available
        </div>
      </div>

      {/* Grid of Employees */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '20px',
        }}
      >
        {employees.map((emp) => {
          const loadPercent = Math.round((emp.activeCases / emp.maxCapacity) * 100);
          return (
            <div key={emp.id} className="glass-card" style={{ padding: '22px' }}>
              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
                <img
                  src={emp.avatarUrl}
                  alt={emp.name}
                  style={{
                    width: '50px',
                    height: '50px',
                    borderRadius: '50%',
                    objectFit: 'cover',
                    border: '2px solid var(--border-subtle)',
                  }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <h4 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>{emp.name}</h4>
                    {emp.role === 'senior_specialist' && (
                      <Award size={14} color="#f59e0b" />
                    )}
                  </div>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'capitalize' }}>
                    {emp.role.replace('_', ' ')}
                  </span>
                </div>

                {/* Status Badge */}
                <select
                  value={emp.status}
                  onChange={(e) => onToggleStatus && onToggleStatus(emp.id, e.target.value as EmployeeStatus)}
                  style={{
                    background: 'var(--bg-pill)',
                    color: 'var(--text-primary)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '999px',
                    padding: '4px 10px',
                    fontSize: '11px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    outline: 'none',
                  }}
                >
                  <option value="available">🟢 Available</option>
                  <option value="on_call">🟡 On Call</option>
                  <option value="away">🔴 Away</option>
                </select>
              </div>

              {/* Specialization */}
              {emp.specialization && (
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '14px' }}>
                  🎯 {emp.specialization}
                </p>
              )}

              {/* Workload Progress Bar */}
              <div style={{ marginTop: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '6px' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Current Active Cases</span>
                  <span style={{ fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>
                    {emp.activeCases} / {emp.maxCapacity} cases
                  </span>
                </div>
                <div
                  style={{
                    width: '100%',
                    height: '8px',
                    background: 'var(--bg-pill)',
                    borderRadius: '999px',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      width: `${loadPercent}%`,
                      height: '100%',
                      background: 'var(--accent-apple-blue)',
                      borderRadius: '999px',
                      transition: 'width 0.4s ease',
                    }}
                  />
                </div>
              </div>

              {/* Total Settled */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginTop: '16px',
                  paddingTop: '12px',
                  borderTop: '1px solid var(--border-subtle)',
                  fontSize: '12px',
                }}
              >
                <span style={{ color: 'var(--text-muted)' }}>Historical Debt Settled</span>
                <span style={{ fontWeight: 700, fontFamily: 'var(--font-mono)', color: '#248a3d' }}>
                  ₹{(emp.totalSettledAmount / 100000).toFixed(1)} Lakhs
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
