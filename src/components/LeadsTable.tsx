'use client';

import React, { useState } from 'react';
import {
  Globe,
  MessageSquare,
  PhoneCall,
  Mail,
  ShieldAlert,
  ChevronRight,
  User,
  CheckCircle2,
  Zap,
} from 'lucide-react';
import { Lead, LeadSource, Employee } from '../lib/types';

interface LeadsTableProps {
  leads: Lead[];
  onSelectLead: (lead: Lead) => void;
  searchQuery: string;
  employees?: Employee[];
  onRefreshData?: () => void;
}

export const LeadsTable: React.FC<LeadsTableProps> = ({
  leads,
  onSelectLead,
  searchQuery,
  employees = [],
  onRefreshData,
}) => {
  const [filterChannel, setFilterChannel] = useState<string>('all');
  const [approvingLeadId, setApprovingLeadId] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Calculate priority score for sorting
  const getPriorityWeight = (lead: Lead) => {
    let weight = 0;
    if (lead.harassmentReported) weight += 100;
    if (lead.distressScore === 'Critical') weight += 80;
    else if (lead.distressScore === 'High') weight += 50;
    else if (lead.distressScore === 'Medium') weight += 20;
    weight += (lead.totalDebtAmount / 100000); // Scale by debt
    return weight;
  };

  // Sort leads so Critical & High priority rank at the top
  const sortedLeads = [...leads].sort((a, b) => getPriorityWeight(b) - getPriorityWeight(a));

  const filteredLeads = sortedLeads.filter((lead) => {
    const matchesSearch =
      lead.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.phone.includes(searchQuery) ||
      (lead.assignedEmployeeName && lead.assignedEmployeeName.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    if (filterChannel === 'all') return true;
    if (filterChannel === 'harassment') return lead.harassmentReported;
    return lead.source === filterChannel;
  });

  const getSourceBadge = (source: LeadSource) => {
    switch (source) {
      case 'google_business':
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', color: 'var(--accent-apple-blue)', fontSize: '12px', fontWeight: 600 }}>
            <Globe size={13} /> Google Business
          </span>
        );
      case 'whatsapp':
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', color: '#248a3d', fontSize: '12px', fontWeight: 600 }}>
            <MessageSquare size={13} /> WhatsApp Inbound
          </span>
        );
      case 'inbound_call':
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', color: '#ff3b30', fontSize: '12px', fontWeight: 600 }}>
            <PhoneCall size={13} /> Telephony Bridge
          </span>
        );
      default:
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', color: 'var(--text-secondary)', fontSize: '12px', fontWeight: 600 }}>
            <Mail size={13} /> Direct Email
          </span>
        );
    }
  };

  const getPriorityBadge = (lead: Lead) => {
    if (lead.harassmentReported || lead.distressScore === 'Critical') {
      return (
        <span style={{ background: 'rgba(255, 59, 48, 0.12)', color: '#ff3b30', border: '1px solid rgba(255, 59, 48, 0.3)', padding: '4px 10px', borderRadius: '8px', fontSize: '11px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
          <ShieldAlert size={12} /> CRITICAL (#1)
        </span>
      );
    }
    if (lead.distressScore === 'High' || lead.totalDebtAmount >= 300000) {
      return (
        <span style={{ background: 'rgba(255, 149, 0, 0.12)', color: '#ff9500', border: '1px solid rgba(255, 149, 0, 0.3)', padding: '4px 10px', borderRadius: '8px', fontSize: '11px', fontWeight: 700 }}>
          HIGH PRIORITY
        </span>
      );
    }
    return (
      <span style={{ background: 'var(--bg-pill)', color: 'var(--text-secondary)', border: '1px solid var(--border-subtle)', padding: '4px 10px', borderRadius: '8px', fontSize: '11px', fontWeight: 600 }}>
        STANDARD
      </span>
    );
  };

  const handleAdminApproveRow = async (e: React.MouseEvent, lead: Lead) => {
    e.stopPropagation();
    setApprovingLeadId(lead.id);

    // Pick best employee or existing assigned employee
    const targetEmpId = lead.assignedEmployeeId || (employees[0] ? employees[0].id : '');

    try {
      const res = await fetch('/api/leads/assign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leadId: lead.id,
          employeeId: targetEmpId,
          adminApproved: true,
        }),
      });

      const json = await res.json();
      if (json.success) {
        setSuccessToast(`✅ Admin Approved! Assigned to ${json.data.employee.name}. Client & Agent WhatsApp dispatched.`);
        setTimeout(() => setSuccessToast(null), 4000);
        if (onRefreshData) onRefreshData();
      }
    } catch (err) {
      console.error('Failed approving assignment:', err);
    } finally {
      setApprovingLeadId(null);
    }
  };

  return (
    <div className="glass-card" style={{ padding: '24px', overflow: 'hidden' }}>
      {/* Toast Notification */}
      {successToast && (
        <div
          className="animate-fade-in"
          style={{
            marginBottom: '16px',
            padding: '12px 16px',
            background: 'rgba(52, 199, 89, 0.12)',
            border: '1px solid rgba(52, 199, 89, 0.4)',
            borderRadius: '14px',
            color: '#248a3d',
            fontSize: '13px',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <CheckCircle2 size={16} />
          <span>{successToast}</span>
        </div>
      )}

      {/* Header & Filter Bar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '14px',
          marginBottom: '20px',
        }}
      >
        <div>
          <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.3px' }}>
            AI-Prioritized Client Directory
          </h3>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
            Auto-ranked by Distress Score & Debt Volume ({filteredLeads.length} Total Leads)
          </p>
        </div>

        {/* Channel Filter Pills */}
        <div className="apple-pill-nav">
          <button
            onClick={() => setFilterChannel('all')}
            className={`apple-pill-item ${filterChannel === 'all' ? 'active' : ''}`}
          >
            All Channels
          </button>
          <button
            onClick={() => setFilterChannel('google_business')}
            className={`apple-pill-item ${filterChannel === 'google_business' ? 'active' : ''}`}
          >
            Google
          </button>
          <button
            onClick={() => setFilterChannel('whatsapp')}
            className={`apple-pill-item ${filterChannel === 'whatsapp' ? 'active' : ''}`}
          >
            WhatsApp
          </button>
          <button
            onClick={() => setFilterChannel('inbound_call')}
            className={`apple-pill-item ${filterChannel === 'inbound_call' ? 'active' : ''}`}
          >
            Calls
          </button>
          <button
            onClick={() => setFilterChannel('email')}
            className={`apple-pill-item ${filterChannel === 'email' ? 'active' : ''}`}
          >
            Email
          </button>
          <button
            onClick={() => setFilterChannel('harassment')}
            className={`apple-pill-item ${filterChannel === 'harassment' ? 'active' : ''}`}
          >
            Harassment Flagged
          </button>
        </div>
      </div>

      {/* Table */}
      <div style={{ overflowX: 'auto' }}>
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            textAlign: 'left',
          }}
        >
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              <th style={{ padding: '12px 14px' }}>Priority Rank</th>
              <th style={{ padding: '12px 14px' }}>Client</th>
              <th style={{ padding: '12px 14px' }}>Source Channel</th>
              <th style={{ padding: '12px 14px' }}>Total Debt</th>
              <th style={{ padding: '12px 14px' }}>Assigned Rep</th>
              <th style={{ padding: '12px 14px' }}>Status</th>
              <th style={{ padding: '12px 14px', textAlign: 'right' }}>Admin Control</th>
            </tr>
          </thead>
          <tbody>
            {filteredLeads.map((lead) => (
              <tr
                key={lead.id}
                onClick={() => onSelectLead(lead)}
                style={{
                  borderBottom: '1px solid var(--border-subtle)',
                  cursor: 'pointer',
                  transition: 'background 0.2s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-pill)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                {/* Priority Rank */}
                <td style={{ padding: '14px' }}>{getPriorityBadge(lead)}</td>

                {/* Client info */}
                <td style={{ padding: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '10px',
                        background: 'var(--accent-apple-blue)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 700,
                        color: '#fff',
                        fontSize: '14px',
                      }}
                    >
                      {lead.fullName.charAt(0)}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '14px', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span>{lead.fullName}</span>
                        {lead.harassmentReported && (
                          <ShieldAlert size={14} color="#ff3b30" />
                        )}
                      </div>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{lead.phone}</span>
                    </div>
                  </div>
                </td>

                {/* Source */}
                <td style={{ padding: '14px' }}>{getSourceBadge(lead.source)}</td>

                {/* Total Debt */}
                <td style={{ padding: '14px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--text-primary)', fontSize: '14px' }}>
                  ₹{lead.totalDebtAmount.toLocaleString('en-IN')}
                </td>

                {/* Assigned Rep */}
                <td style={{ padding: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <User size={14} color="var(--accent-apple-blue)" />
                    <span style={{ fontSize: '13px', color: 'var(--text-primary)', fontWeight: 500 }}>
                      {lead.assignedEmployeeName || 'Unassigned'}
                    </span>
                  </div>
                </td>

                {/* Status */}
                <td style={{ padding: '14px' }}>
                  <span className={`badge-status ${lead.status}`}>{lead.status.replace('_', ' ')}</span>
                </td>

                {/* Action buttons */}
                <td style={{ padding: '14px', textAlign: 'right' }}>
                  <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                    {lead.status !== 'assigned' && lead.status !== 'settled' && (
                      <button
                        className="btn-apple-primary"
                        style={{ padding: '6px 12px', fontSize: '11px' }}
                        disabled={approvingLeadId === lead.id}
                        onClick={(e) => handleAdminApproveRow(e, lead)}
                      >
                        <Zap size={13} />
                        <span>{approvingLeadId === lead.id ? 'Approving...' : 'Approve & Assign'}</span>
                      </button>
                    )}

                    <button
                      className="btn-apple-secondary"
                      style={{ padding: '6px 12px', fontSize: '11px' }}
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectLead(lead);
                      }}
                    >
                      <span>View File</span>
                      <ChevronRight size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {filteredLeads.length === 0 && (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)', fontSize: '14px' }}>
                  No leads found matching your criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
