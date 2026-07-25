'use client';

import React, { useState } from 'react';
import { X, FileText, Send, ShieldAlert, Check, Copy, User, Phone, Mail, Building } from 'lucide-react';
import { Lead, Employee } from '../lib/types';

interface LeadDetailDrawerProps {
  lead: Lead | null;
  onClose: () => void;
  employees: Employee[];
}

export const LeadDetailDrawer: React.FC<LeadDetailDrawerProps> = ({ lead, onClose, employees }) => {
  const [copiedNotice, setCopiedNotice] = useState(false);
  const [copiedStatus, setCopiedStatus] = useState(false);

  if (!lead) return null;

  const assignedEmp = employees.find((e) => e.id === lead.assignedEmployeeId);

  const legalNoticeText = `FORMAL LEGAL REPRESENTATION & CEASE-AND-DESIST NOTICE

To: Legal & Recovery Department, All Listed Lenders
Subject: Client Representation & Prohibition of Workplace Harassment
Client Name: ${lead.fullName}
Total Debt Case ID: ${lead.id}

Notice is hereby served under RBI Guidelines on Fair Practices Code for Lenders (RBI/2015-16/160):
1. Client ${lead.fullName} has formally retained TRYAM Automation Debt Settlement Agency to negotiate and restructure credit liabilities totaling ₹${lead.totalDebtAmount.toLocaleString('en-IN')}.
2. Direct workplace contacting or harassment by third-party recovery personnel violates client privacy and employment security. All future communications regarding debt settlement MUST be directed strictly to assigned specialist ${assignedEmp ? assignedEmp.name : 'TRYAM Team'} (${assignedEmp ? assignedEmp.email : 'legal@tryam.ai'}).
3. Requesting formal statement of account and target settlement waiver proposal within 7 working days.

Issued by TRYAM Enterprise Debt Hub`;

  const whatsappStatusText = `Hello ${lead.fullName}, your settlement proposal with ${lead.lenders[0]?.name || 'Bank'} is currently in active review. Target waiver range: 40%–45%. Your assigned specialist is ${lead.assignedEmployeeName || 'Rahul'}. Next review date: 28th.`;

  const copyToClipboard = (text: string, setCopied: (v: boolean) => void) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        background: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(12px)',
        display: 'flex',
        justifyContent: 'flex-end',
      }}
    >
      <div
        className="animate-fade-in"
        style={{
          width: '100%',
          maxWidth: '620px',
          height: '100%',
          background: '#0e0f17',
          borderLeft: '1px solid var(--border-subtle)',
          padding: '32px',
          overflowY: 'auto',
          boxShadow: '-20px 0 50px rgba(0, 0, 0, 0.8)',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
          <div>
            <span className={`badge-status ${lead.status}`}>{lead.status.replace('_', ' ')}</span>
            <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#fff', marginTop: '8px' }}>
              {lead.fullName}
            </h2>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
              Client Case ID: <span style={{ fontFamily: 'var(--font-mono)' }}>{lead.id}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.06)',
              border: 'none',
              color: 'var(--text-muted)',
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Contact Info Bar */}
        <div
          style={{
            background: 'rgba(255, 255, 255, 0.03)',
            borderRadius: '14px',
            padding: '16px',
            border: '1px solid var(--border-subtle)',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '12px',
            marginBottom: '24px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-primary)' }}>
            <Phone size={15} color="#818cf8" />
            <span>{lead.phone}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-primary)' }}>
            <Mail size={15} color="#38bdf8" />
            <span>{lead.email}</span>
          </div>
        </div>

        {/* Debt Breakdown Card */}
        <div className="glass-card" style={{ padding: '20px', marginBottom: '24px' }}>
          <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Extracted Debt Metrics
          </span>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: '6px', marginBottom: '16px' }}>
            <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Total Debt Portfolio</span>
            <span style={{ fontSize: '24px', fontWeight: 800, fontFamily: 'var(--font-mono)', color: '#fff' }}>
              ₹{lead.totalDebtAmount.toLocaleString('en-IN')}
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {lead.lenders.map((lender, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  background: 'rgba(0, 0, 0, 0.25)',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  fontSize: '13px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Building size={14} color="#a5b4fc" />
                  <span style={{ color: '#fff', fontWeight: 500 }}>{lender.name}</span>
                </div>
                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: '#f8fafc' }}>
                  ₹{lender.amount.toLocaleString('en-IN')}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Assigned Rep Section */}
        <div className="glass-card" style={{ padding: '20px', marginBottom: '24px' }}>
          <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Workload-Assigned Employee
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginTop: '12px' }}>
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                background: 'var(--accent-primary-gradient)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '16px',
                fontWeight: 700,
                color: '#fff',
              }}
            >
              {lead.assignedEmployeeName ? lead.assignedEmployeeName.charAt(0) : 'U'}
            </div>
            <div>
              <h4 style={{ fontSize: '15px', fontWeight: 700, color: '#fff' }}>
                {lead.assignedEmployeeName || 'Unassigned'}
              </h4>
              <p style={{ fontSize: '12px', color: '#a5b4fc' }}>
                {assignedEmp ? `${assignedEmp.role.replace('_', ' ')} • ${assignedEmp.activeCases} active cases` : 'Pending Workload Assignment'}
              </p>
            </div>
          </div>
        </div>

        {/* Anti-Harassment Legal Notice Generator */}
        {lead.harassmentReported && (
          <div
            style={{
              background: 'rgba(244, 63, 94, 0.08)',
              border: '1px solid rgba(244, 63, 94, 0.3)',
              borderRadius: '16px',
              padding: '20px',
              marginBottom: '24px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShieldAlert size={18} color="#f43f5e" />
                <span style={{ fontSize: '13px', fontWeight: 700, color: '#fda4af' }}>
                  RBI Anti-Harassment Representation Notice
                </span>
              </div>
              <button
                onClick={() => copyToClipboard(legalNoticeText, setCopiedNotice)}
                className="btn-apple-secondary"
                style={{ padding: '6px 12px', fontSize: '11px' }}
              >
                {copiedNotice ? <Check size={13} color="#34d399" /> : <Copy size={13} />}
                <span>{copiedNotice ? 'Copied' : 'Copy Notice'}</span>
              </button>
            </div>
            <pre
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '11px',
                color: '#fecdd3',
                background: 'rgba(0, 0, 0, 0.4)',
                padding: '12px',
                borderRadius: '10px',
                whiteSpace: 'pre-wrap',
                lineHeight: '1.5',
              }}
            >
              {legalNoticeText}
            </pre>
          </div>
        )}

        {/* WhatsApp Automated Status Auto-Responder */}
        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#38bdf8' }}>
              WhatsApp Auto Status Update Payload
            </span>
            <button
              onClick={() => copyToClipboard(whatsappStatusText, setCopiedStatus)}
              className="btn-apple-secondary"
              style={{ padding: '6px 12px', fontSize: '11px' }}
            >
              {copiedStatus ? <Check size={13} color="#34d399" /> : <Send size={13} />}
              <span>{copiedStatus ? 'Sent to WhatsApp' : 'Copy Payload'}</span>
            </button>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', background: 'rgba(0,0,0,0.3)', padding: '12px', borderRadius: '10px' }}>
            {whatsappStatusText}
          </p>
        </div>
      </div>
    </div>
  );
};
