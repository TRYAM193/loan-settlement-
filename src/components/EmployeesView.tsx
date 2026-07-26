'use client';

import React from 'react';
import { UserCheck, Shield, Phone, Mail, Award, CheckCircle2, Clock } from 'lucide-react';
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
          background: 'rgba(99, 102, 241, 0.1)',
          border: '1px solid rgba(99, 102, 241, 0.3)',
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
          <UserCheck size={22} color="#818cf8" />
          <div>
            <h4 style={{ fontSize: '15px', fontWeight: 700, color: '#fff' }}>
              Workload-Aware Lead Balancing Algorithm
            </h4>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
              Incoming leads from Google Business, WhatsApp, or Calls are instantly routed to the employee with the lowest active cases.
            </p>
          </div>
        </div>
        <div
          style={{
            background: 'rgba(255, 255, 255, 0.06)',
            padding: '6px 14px',
            borderRadius: '999px',
            fontSize: '12px',
            color: '#a5b4fc',
            fontWeight: 600,
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
                    border: '2px solid rgba(255, 255, 255, 0.1)',
                  }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <h4 style={{ fontSize: '16px', fontWeight: 700, color: '#fff' }}>{emp.name}</h4>
                    {emp.role === 'senior_specialist' && (
                      <Award size={14} color="#f59e0b" />
                    )}
                  </div>
                  <span style={{ fontSize: '12px', color: '#a5b4fc', textTransform: 'capitalize' }}>
                    {emp.role.replace('_', ' ')}
                  </span>
                </div>

                {/* Status Badge */}
                <select
                  value={emp.status}
                  onChange={(e) => onToggleStatus && onToggleStatus(emp.id, e.target.value as EmployeeStatus)}
                  style={{
                    background:
                      emp.status === 'available'
                        ? 'rgba(16, 185, 129, 0.15)'
                        : emp.status === 'on_call'
                        ? 'rgba(245, 158, 11, 0.15)'
                        : 'rgba(244, 63, 94, 0.15)',
                    color:
                      emp.status === 'available'
                        ? '#34d399'
                        : emp.status === 'on_call'
                        ? '#fcd34d'
                        : '#fda4af',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '999px',
                    padding: '4px 10px',
                    fontSize: '11px',
                    fontWeight: 700,
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
                  <span style={{ fontWeight: 700, fontFamily: 'var(--font-mono)', color: '#fff' }}>
                    {emp.activeCases} / {emp.maxCapacity} cases
                  </span>
                </div>
                <div
                  style={{
                    width: '100%',
                    height: '8px',
                    background: 'rgba(255, 255, 255, 0.08)',
                    borderRadius: '999px',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      width: `${loadPercent}%`,
                      height: '100%',
                      background:
                        loadPercent > 80
                          ? 'var(--accent-rose-gradient)'
                          : loadPercent > 50
                          ? 'var(--accent-amber-gradient)'
                          : 'var(--accent-emerald-gradient)',
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
                <span style={{ fontWeight: 700, fontFamily: 'var(--font-mono)', color: '#34d399' }}>
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
