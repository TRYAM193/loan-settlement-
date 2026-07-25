'use client';

import React, { useState } from 'react';
import { X, FileText, Send, ShieldAlert, Check, Copy, User, Phone, Mail, Building, MessageSquare, RefreshCw } from 'lucide-react';
import { Lead, Employee } from '../lib/types';
import { generateEmployeeNotificationText, getWhatsAppClickUrl } from '../lib/whatsappService';

interface LeadDetailDrawerProps {
  lead: Lead | null;
  onClose: () => void;
  employees: Employee[];
  onRefreshData?: () => void;
}

export const LeadDetailDrawer: React.FC<LeadDetailDrawerProps> = ({ lead, onClose, employees, onRefreshData }) => {
  const [copiedNotice, setCopiedNotice] = useState(false);
  const [copiedWhatsAppText, setCopiedWhatsAppText] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);
  const [selectedEmpId, setSelectedEmpId] = useState<string>('');
  const [notificationStatus, setNotificationStatus] = useState<string | null>(null);

  if (!lead) return null;

  const currentEmpId = selectedEmpId || lead.assignedEmployeeId;
  const assignedEmp = employees.find((e) => e.id === currentEmpId);

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

  const employeeNotificationMessage = generateEmployeeNotificationText(
    assignedEmp ? assignedEmp.name : 'Team Agent',
    {
      fullName: lead.fullName,
      phone: lead.phone,
      email: lead.email,
      totalDebtAmount: lead.totalDebtAmount,
      source: lead.source,
    }
  );

  const whatsappUrl = assignedEmp?.phone
    ? getWhatsAppClickUrl(assignedEmp.phone, employeeNotificationMessage)
    : '#';

  const copyToClipboard = (text: string, setCopied: (v: boolean) => void) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReassignEmployee = async (newEmpId: string) => {
    if (!newEmpId || newEmpId === lead.assignedEmployeeId) return;
    setIsAssigning(true);
    setNotificationStatus(null);

    try {
      const res = await fetch('/api/leads/assign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadId: lead.id, employeeId: newEmpId }),
      });
      const json = await res.json();

      if (json.success) {
        setSelectedEmpId(newEmpId);
        setNotificationStatus(`Assigned to ${json.data.employee.name}. WhatsApp alert dispatched!`);
        if (onRefreshData) onRefreshData();
      } else {
        setNotificationStatus(`Error: ${json.error}`);
      }
    } catch (err: any) {
      setNotificationStatus(`Failed to reassign: ${err.message}`);
    } finally {
      setIsAssigning(false);
    }
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
            <span>{lead.email || 'No email provided'}</span>
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
            {(lead.lenders || []).map((lender, idx) => (
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

        {/* Assigned Rep & Reassignment Dropdown */}
        <div className="glass-card" style={{ padding: '20px', marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Assigned Employee & Caseload
            </span>
            {isAssigning && <RefreshCw size={14} className="spin" color="#6366f1" />}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
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
              {assignedEmp ? assignedEmp.name.charAt(0) : 'U'}
            </div>
            <div style={{ flex: 1 }}>
              <h4 style={{ fontSize: '15px', fontWeight: 700, color: '#fff' }}>
                {assignedEmp ? assignedEmp.name : 'Unassigned Employee'}
              </h4>
              <p style={{ fontSize: '12px', color: '#a5b4fc' }}>
                {assignedEmp ? `${assignedEmp.phone} • ${assignedEmp.email}` : 'Assign an employee to start handling'}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <select
              value={currentEmpId}
              onChange={(e) => handleReassignEmployee(e.target.value)}
              disabled={isAssigning}
              className="apple-input"
              style={{ flex: 1, padding: '8px 12px', fontSize: '13px', borderRadius: '10px' }}
            >
              <option value="">Select Employee to Assign...</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.name} ({emp.activeCases} active cases)
                </option>
              ))}
            </select>
          </div>

          {notificationStatus && (
            <p style={{ fontSize: '12px', color: '#34d399', marginTop: '10px', fontWeight: 500 }}>
              {notificationStatus}
            </p>
          )}
        </div>

        {/* WhatsApp Notification Alert Card (Sent TO Employee) */}
        <div className="glass-card" style={{ padding: '20px', marginBottom: '24px', border: '1px solid rgba(52, 211, 153, 0.3)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <MessageSquare size={18} color="#34d399" />
              <span style={{ fontSize: '13px', fontWeight: 700, color: '#34d399' }}>
                WhatsApp Employee Alert Preview
              </span>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => copyToClipboard(employeeNotificationMessage, setCopiedWhatsAppText)}
                className="btn-apple-secondary"
                style={{ padding: '6px 12px', fontSize: '11px' }}
              >
                {copiedWhatsAppText ? <Check size={13} color="#34d399" /> : <Copy size={13} />}
                <span>{copiedWhatsAppText ? 'Copied' : 'Copy Text'}</span>
              </button>
              {assignedEmp?.phone && (
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-apple-primary"
                  style={{ padding: '6px 12px', fontSize: '11px', textDecoration: 'none', background: '#059669', color: '#fff' }}
                >
                  <Send size={13} />
                  <span>Open WhatsApp</span>
                </a>
              )}
            </div>
          </div>
          <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '8px' }}>
            This WhatsApp alert with client details (Name, Phone, Email, Debt) is automatically sent to{' '}
            <strong>{assignedEmp ? assignedEmp.name : 'the assigned employee'}</strong> ({assignedEmp ? assignedEmp.phone : 'N/A'}).
          </p>
          <pre
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              color: '#a7f3d0',
              background: 'rgba(0, 0, 0, 0.4)',
              padding: '12px',
              borderRadius: '10px',
              whiteSpace: 'pre-wrap',
              lineHeight: '1.5',
            }}
          >
            {employeeNotificationMessage}
          </pre>
        </div>

        {/* Anti-Harassment Legal Notice Generator */}
        {lead.harassmentReported && (
          <div
            style={{
              background: 'rgba(244, 63, 94, 0.08)',
              border: '1px solid rgba(244, 63, 94, 0.3)',
              borderRadius: '16px',
              padding: '20px',
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
      </div>
    </div>
  );
};
