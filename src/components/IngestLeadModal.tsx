'use client';

import React, { useState } from 'react';
import { X, Sparkles, PhoneCall, MessageSquare, Mail, Globe, UserCheck, AlertTriangle } from 'lucide-react';
import { Employee, Lead, LeadSource } from '../lib/types';
import { calculateBestEmployee } from '../lib/store';

interface IngestLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  employees: Employee[];
  onAddLead: (lead: Lead, assignedEmpId: string) => void;
}

export const IngestLeadModal: React.FC<IngestLeadModalProps> = ({
  isOpen,
  onClose,
  employees,
  onAddLead,
}) => {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [source, setSource] = useState<LeadSource>('google_business');
  const [debtAmount, setDebtAmount] = useState('450000');
  const [distressScore, setDistressScore] = useState<'Low' | 'Medium' | 'High' | 'Critical'>('High');
  const [harassment, setHarassment] = useState(true);
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const numDebt = parseFloat(debtAmount) || 0;
  const bestAssignment = calculateBestEmployee(employees, numDebt);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !phone) return;

    const assignedEmp = bestAssignment ? bestAssignment.employee : employees[0];

    const newLead: Lead = {
      id: `lead-${Date.now().toString().slice(-4)}`,
      fullName,
      phone,
      email: email || `${fullName.toLowerCase().replace(/\s+/g, '.')}@client.com`,
      source,
      status: 'assigned',
      assignedEmployeeId: assignedEmp.id,
      assignedEmployeeName: assignedEmp.name,
      totalDebtAmount: numDebt,
      lenders: [
        { name: 'Primary Bank Loan / Credit Card', amount: numDebt, type: 'Credit Debt' },
      ],
      distressScore,
      harassmentReported: harassment,
      createdAt: new Date().toISOString(),
      notes: notes || `Client logged via ${source.replace('_', ' ')}. Smart workload engine routed to ${assignedEmp.name}.`,
    };

    onAddLead(newLead, assignedEmp.id);
    onClose();
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
          maxWidth: '560px',
          padding: '28px',
          background: 'linear-gradient(180deg, rgba(20, 21, 30, 0.95) 0%, rgba(12, 13, 19, 0.95) 100%)',
          borderRadius: '24px',
          position: 'relative',
          maxHeight: '90vh',
          overflowY: 'auto',
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

        {/* Title */}
        <div style={{ marginBottom: '22px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={20} color="#818cf8" />
            <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#fff', letterSpacing: '-0.3px' }}>
              Ingest New Client Lead
            </h2>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Log inbound customer from Google Business, Calls, or WhatsApp
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Source Tabs */}
          <div style={{ marginBottom: '18px' }}>
            <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '8px', textTransform: 'uppercase' }}>
              Lead Acquisition Channel
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '6px' }}>
              {[
                { id: 'google_business', label: 'Google', icon: Globe },
                { id: 'whatsapp', label: 'WhatsApp', icon: MessageSquare },
                { id: 'inbound_call', label: 'Call', icon: PhoneCall },
                { id: 'email', label: 'Email', icon: Mail },
              ].map((item) => {
                const IconComp = item.icon;
                const isSelected = source === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSource(item.id as LeadSource)}
                    style={{
                      padding: '10px 4px',
                      borderRadius: '12px',
                      border: isSelected ? '1px solid var(--accent-primary)' : '1px solid var(--border-subtle)',
                      background: isSelected ? 'rgba(99, 102, 241, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                      color: isSelected ? '#fff' : 'var(--text-secondary)',
                      fontSize: '11px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <IconComp size={16} color={isSelected ? '#818cf8' : 'var(--text-muted)'} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Form Fields Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
            <div>
              <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                Customer Full Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Ramesh Kumar"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                style={{
                  width: '100%',
                  background: 'rgba(0, 0, 0, 0.3)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '10px',
                  padding: '10px 12px',
                  color: '#fff',
                  fontSize: '13px',
                  outline: 'none',
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                Phone Number *
              </label>
              <input
                type="text"
                required
                placeholder="+91 98765 43210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                style={{
                  width: '100%',
                  background: 'rgba(0, 0, 0, 0.3)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '10px',
                  padding: '10px 12px',
                  color: '#fff',
                  fontSize: '13px',
                  outline: 'none',
                }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
            <div>
              <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                Total Debt Amount (₹) *
              </label>
              <input
                type="number"
                required
                value={debtAmount}
                onChange={(e) => setDebtAmount(e.target.value)}
                style={{
                  width: '100%',
                  background: 'rgba(0, 0, 0, 0.3)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '10px',
                  padding: '10px 12px',
                  color: '#fff',
                  fontSize: '13px',
                  outline: 'none',
                  fontFamily: 'var(--font-mono)',
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                Distress Level
              </label>
              <select
                value={distressScore}
                onChange={(e) => setDistressScore(e.target.value as any)}
                style={{
                  width: '100%',
                  background: 'rgba(0, 0, 0, 0.3)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '10px',
                  padding: '10px 12px',
                  color: '#fff',
                  fontSize: '13px',
                  outline: 'none',
                }}
              >
                <option value="Low">Low Distress</option>
                <option value="Medium">Medium Distress</option>
                <option value="High">High Distress</option>
                <option value="Critical">Critical (Workplace Harassment)</option>
              </select>
            </div>
          </div>

          {/* Harassment Checkbox */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '18px' }}>
            <input
              type="checkbox"
              id="harass"
              checked={harassment}
              onChange={(e) => setHarassment(e.target.checked)}
              style={{ accentColor: 'var(--accent-rose)', width: '16px', height: '16px' }}
            />
            <label htmlFor="harass" style={{ fontSize: '12px', color: '#fda4af', cursor: 'pointer' }}>
              Flag Recovery Agent Workplace Harassment (Auto-Generate Legal Notice)
            </label>
          </div>

          {/* Live Smart Assignment Card */}
          {bestAssignment && (
            <div
              style={{
                background: 'rgba(99, 102, 241, 0.1)',
                border: '1px solid rgba(99, 102, 241, 0.3)',
                borderRadius: '14px',
                padding: '14px',
                marginBottom: '20px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <UserCheck size={16} color="#818cf8" />
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#a5b4fc' }}>
                  Smart Engine Lead Assignment Preview
                </span>
              </div>
              <p style={{ fontSize: '12px', color: 'var(--text-primary)', fontWeight: 500 }}>
                Will assign to <strong style={{ color: '#60a5fa' }}>{bestAssignment.employee.name}</strong> ({bestAssignment.employee.role.replace('_', ' ')})
              </p>
              <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                {bestAssignment.reason}
              </p>
            </div>
          )}

          <button
            type="submit"
            className="btn-apple-primary"
            style={{ width: '100%', justifyContent: 'center', padding: '12px' }}
          >
            <span>Log Client & Trigger Workload Assignment</span>
          </button>
        </form>
      </div>
    </div>
  );
};
