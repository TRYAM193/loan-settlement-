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
  Filter,
} from 'lucide-react';
import { Lead, LeadSource } from '../lib/types';

interface LeadsTableProps {
  leads: Lead[];
  onSelectLead: (lead: Lead) => void;
  searchQuery: string;
}

export const LeadsTable: React.FC<LeadsTableProps> = ({ leads, onSelectLead, searchQuery }) => {
  const [filterChannel, setFilterChannel] = useState<string>('all');

  const filteredLeads = leads.filter((lead) => {
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
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', color: '#60a5fa', fontSize: '12px', fontWeight: 600 }}>
            <Globe size={13} /> Google Business
          </span>
        );
      case 'whatsapp':
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', color: '#34d399', fontSize: '12px', fontWeight: 600 }}>
            <MessageSquare size={13} /> WhatsApp Inbound
          </span>
        );
      case 'inbound_call':
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', color: '#f43f5e', fontSize: '12px', fontWeight: 600 }}>
            <PhoneCall size={13} /> Telephony Bridge
          </span>
        );
      default:
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', color: '#a5b4fc', fontSize: '12px', fontWeight: 600 }}>
            <Mail size={13} /> Direct Email
          </span>
        );
    }
  };

  return (
    <div className="glass-card" style={{ padding: '24px', overflow: 'hidden' }}>
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
          <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#fff', letterSpacing: '-0.3px' }}>
            Ingested Client Directory
          </h3>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
            Showing {filteredLeads.length} leads assigned via workload engine
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
              <th style={{ padding: '12px 14px' }}>Client</th>
              <th style={{ padding: '12px 14px' }}>Source Channel</th>
              <th style={{ padding: '12px 14px' }}>Total Debt</th>
              <th style={{ padding: '12px 14px' }}>Assigned Rep</th>
              <th style={{ padding: '12px 14px' }}>Status</th>
              <th style={{ padding: '12px 14px', textAlign: 'right' }}>Action</th>
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
                onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                {/* Client info */}
                <td style={{ padding: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '10px',
                        background: 'rgba(255, 255, 255, 0.06)',
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
                      <div style={{ fontWeight: 600, fontSize: '14px', color: '#fff', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span>{lead.fullName}</span>
                        {lead.harassmentReported && (
                          <ShieldAlert size={14} color="#f43f5e" />
                        )}
                      </div>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{lead.phone}</span>
                    </div>
                  </div>
                </td>

                {/* Source */}
                <td style={{ padding: '14px' }}>{getSourceBadge(lead.source)}</td>

                {/* Total Debt */}
                <td style={{ padding: '14px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#fff', fontSize: '14px' }}>
                  ₹{lead.totalDebtAmount.toLocaleString('en-IN')}
                </td>

                {/* Assigned Rep */}
                <td style={{ padding: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <User size={14} color="#a5b4fc" />
                    <span style={{ fontSize: '13px', color: 'var(--text-primary)', fontWeight: 500 }}>
                      {lead.assignedEmployeeName || 'Unassigned'}
                    </span>
                  </div>
                </td>

                {/* Status */}
                <td style={{ padding: '14px' }}>
                  <span className={`badge-status ${lead.status}`}>{lead.status.replace('_', ' ')}</span>
                </td>

                {/* Action arrow */}
                <td style={{ padding: '14px', textAlign: 'right' }}>
                  <button
                    className="btn-apple-secondary"
                    style={{ padding: '6px 12px', fontSize: '12px' }}
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectLead(lead);
                    }}
                  >
                    <span>View File</span>
                    <ChevronRight size={14} />
                  </button>
                </td>
              </tr>
            ))}

            {filteredLeads.length === 0 && (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)', fontSize: '14px' }}>
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
