'use client';

import React, { useState } from 'react';
import {
  X,
  Send,
  ShieldAlert,
  Check,
  Copy,
  Phone,
  Mail,
  Building,
  MessageSquare,
  RefreshCw,
  UserCheck,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { Lead, Employee } from '../lib/types';
import {
  generateEmployeeNotificationText,
  generateClientNotificationText,
  getWhatsAppClickUrl,
  getEmailClickUrl,
} from '../lib/whatsappService';

interface LeadDetailDrawerProps {
  lead: Lead | null;
  onClose: () => void;
  employees: Employee[];
  onRefreshData?: () => void;
}

export const LeadDetailDrawer: React.FC<LeadDetailDrawerProps> = ({
  lead,
  onClose,
  employees,
  onRefreshData,
}) => {
  const [copiedNotice, setCopiedNotice] = useState(false);
  const [copiedEmpText, setCopiedEmpText] = useState(false);
  const [copiedClientText, setCopiedClientText] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);
  const [isSettling, setIsSettling] = useState(false);
  const [selectedEmpId, setSelectedEmpId] = useState<string>('');
  const [notificationStatus, setNotificationStatus] = useState<string | null>(null);
  const [settlementSuccessMessage, setSettlementSuccessMessage] = useState<string | null>(null);

  if (!lead) return null;

  const currentEmpId = selectedEmpId || lead.assignedEmployeeId;
  const assignedEmp = employees.find((e) => e.id === currentEmpId);

  // Determine Client Channel Preference
  const clientSource = (lead.source || 'inbound_call').toLowerCase();
  const isEmailChannel = clientSource === 'email' && lead.email && lead.email.includes('@');
  const clientChannelUsed: 'whatsapp' | 'email' = isEmailChannel ? 'email' : 'whatsapp';

  // Format Messages
  const employeeAlertMessage = generateEmployeeNotificationText(
    assignedEmp ? assignedEmp.name : 'Team Specialist',
    {
      fullName: lead.fullName,
      phone: lead.phone,
      email: lead.email,
      totalDebtAmount: lead.totalDebtAmount,
      source: lead.source,
    }
  );

  const clientNotificationMessage = generateClientNotificationText(
    lead.fullName,
    {
      name: assignedEmp ? assignedEmp.name : 'Unassigned Specialist',
      phone: assignedEmp ? assignedEmp.phone : '+91 98765 43210',
      email: assignedEmp ? assignedEmp.email : 'support@tryam.ai',
    }
  );

  const legalNoticeText = `FORMAL LEGAL REPRESENTATION & CEASE-AND-DESIST NOTICE

To: Legal & Recovery Department, All Listed Lenders
Subject: Client Representation & Prohibition of Workplace Harassment
Client Name: ${lead.fullName}
Total Debt Case ID: ${lead.id}

Notice is hereby served under RBI Guidelines on Fair Practices Code for Lenders (RBI/2015-16/160):
1. Client ${lead.fullName} has formally retained TRYAM Automation Debt Settlement Agency to negotiate and restructure credit liabilities totaling ₹${lead.totalDebtAmount.toLocaleString(
    'en-IN'
  )}.
2. Direct workplace contacting or harassment by third-party recovery personnel violates client privacy and employment security. All future communications regarding debt settlement MUST be directed strictly to assigned specialist ${
    assignedEmp ? assignedEmp.name : 'TRYAM Team'
  } (${assignedEmp ? assignedEmp.email : 'legal@tryam.ai'}).
3. Requesting formal statement of account and target settlement waiver proposal within 7 working days.

Issued by TRYAM Enterprise Debt Hub`;

  const copyToClipboard = (text: string, setFn: (val: boolean) => void) => {
    navigator.clipboard.writeText(text);
    setFn(true);
    setTimeout(() => setFn(false), 2000);
  };

  const clientWhatsAppUrl = getWhatsAppClickUrl(
    lead.phone,
    clientNotificationMessage
  );

  const clientEmailUrl = getEmailClickUrl(
    lead.email || '',
    `TRYAM Settlement Specialist Assigned - ${lead.fullName}`,
    clientNotificationMessage
  );

  const empWhatsAppUrl = assignedEmp?.phone
    ? getWhatsAppClickUrl(assignedEmp.phone, employeeAlertMessage)
    : '#';

  const handleAdminApproveAndAssign = async (empIdToAssign: string) => {
    if (!empIdToAssign) return;
    setIsAssigning(true);
    setNotificationStatus(null);

    try {
      const res = await fetch('/api/leads/assign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leadId: lead.id,
          employeeId: empIdToAssign,
          adminApproved: true,
        }),
      });
      const json = await res.json();

      if (json.success) {
        setNotificationStatus(
          `✅ Lead assigned to ${json.data?.employee?.name || 'Specialist'}. Client (${json.data?.clientNotificationResult?.channelUsed?.toUpperCase() || 'WHATSAPP'}) & Employee alerts sent.`
        );
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

  const handleMarkCaseSettled = async () => {
    setIsSettling(true);
    setSettlementSuccessMessage(null);

    try {
      const res = await fetch('/api/leads/settle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leadId: lead.id,
          employeeId: currentEmpId,
        }),
      });
      const json = await res.json();

      if (json.success) {
        setSettlementSuccessMessage(
          `🎉 Client Case Finished & Settled! Celebration WhatsApp sent to ${lead.fullName} (${lead.phone}).`
        );
        if (onRefreshData) onRefreshData();
      } else {
        setSettlementSuccessMessage(`Error: ${json.error}`);
      }
    } catch (err: any) {
      setSettlementSuccessMessage(`Failed to settle case: ${err.message}`);
    } finally {
      setIsSettling(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        background: 'rgba(0, 0, 0, 0.4)',
        backdropFilter: 'blur(10px)',
        display: 'flex',
        justifyContent: 'flex-end',
      }}
    >
      <div
        className="animate-fade-in"
        style={{
          width: '100%',
          maxWidth: '640px',
          height: '100%',
          background: 'var(--bg-surface)',
          borderLeft: '1px solid var(--border-subtle)',
          padding: '32px',
          overflowY: 'auto',
          boxShadow: 'var(--card-shadow)',
          color: 'var(--text-primary)',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
          <div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <span className={`badge-status ${lead.status || 'new'}`}>{(lead.status || 'new').replace('_', ' ')}</span>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  padding: '3px 8px',
                  borderRadius: '6px',
                  background: 'var(--bg-pill)',
                  color: 'var(--accent-apple-blue)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                Channel: {clientChannelUsed.toUpperCase()}
              </span>
            </div>
            <h2 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)', marginTop: '8px' }}>
              {lead.fullName}
            </h2>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
              Client Case ID: <span style={{ fontFamily: 'var(--font-mono)' }}>{lead.id}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'var(--bg-pill)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-secondary)',
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

        {/* CASE SETTLEMENT COMPLETION ACTION BUTTON */}
        <div
          style={{
            background: lead.status === 'settled' ? 'rgba(52, 199, 89, 0.1)' : 'var(--bg-pill)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '16px',
            padding: '18px',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={18} color="var(--accent-apple-blue)" />
              <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
                {lead.status === 'settled' ? '🎉 Client Case Fully Settled' : 'Employee Case Completion Control'}
              </span>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
              {lead.status === 'settled'
                ? 'This client has achieved full loan settlement. Celebration WhatsApp dispatched!'
                : 'Click when negotiations finish to mark as Settled & send Celebration WhatsApp to client.'}
            </p>
          </div>

          <button
            onClick={handleMarkCaseSettled}
            disabled={isSettling || lead.status === 'settled'}
            className="btn-apple-primary"
            style={{
              padding: '10px 18px',
              fontSize: '12px',
              whiteSpace: 'nowrap',
            }}
          >
            {isSettling ? <RefreshCw size={14} className="spin" /> : <CheckCircle2 size={15} />}
            <span>{lead.status === 'settled' ? 'Settled (Completed)' : 'Client Case Finished'}</span>
          </button>
        </div>

        {settlementSuccessMessage && (
          <div style={{ padding: '12px 16px', borderRadius: '12px', background: 'rgba(52, 199, 89, 0.1)', border: '1px solid rgba(52, 199, 89, 0.3)', color: '#248a3d', fontSize: '12px', marginBottom: '24px' }}>
            {settlementSuccessMessage}
          </div>
        )}

        {/* Contact Info Bar */}
        <div
          style={{
            background: 'var(--bg-pill)',
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
            <Phone size={15} color="var(--accent-apple-blue)" />
            <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{lead.phone}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-primary)' }}>
            <Mail size={15} color="var(--accent-apple-blue)" />
            <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{lead.email || 'No email provided'}</span>
          </div>
        </div>

        {/* Debt Breakdown Card */}
        <div className="glass-card" style={{ padding: '20px', marginBottom: '24px' }}>
          <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Extracted Debt Metrics
          </span>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: '6px', marginBottom: '16px' }}>
            <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Total Debt Portfolio</span>
            <span style={{ fontSize: '24px', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>
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
                  background: 'var(--bg-pill)',
                  border: '1px solid var(--border-subtle)',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  fontSize: '13px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Building size={14} color="var(--accent-apple-blue)" />
                  <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{lender.name}</span>
                </div>
                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--text-primary)' }}>
                  ₹{lender.amount.toLocaleString('en-IN')}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Admin Reassignment & Approval Control */}
        <div className="glass-card" style={{ padding: '20px', marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <UserCheck size={18} color="var(--accent-apple-blue)" />
              <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                Admin Workload & Employee Reassignment Control
              </span>
            </div>
            {isAssigning && <RefreshCw size={14} className="spin" color="var(--accent-apple-blue)" />}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                background: 'var(--accent-apple-blue)',
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
              <h4 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)' }}>
                {assignedEmp ? assignedEmp.name : 'Unassigned Employee'}
              </h4>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                {assignedEmp ? `${assignedEmp.phone} • ${assignedEmp.email}` : 'Select a specialist below to assign'}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)' }}>
              Change / Assign Employee Specialist:
            </label>
            <div style={{ display: 'flex', gap: '10px' }}>
              <select
                value={currentEmpId}
                onChange={(e) => setSelectedEmpId(e.target.value)}
                disabled={isAssigning}
                style={{
                  flex: 1,
                  padding: '10px 12px',
                  fontSize: '13px',
                  borderRadius: '10px',
                  background: 'var(--bg-pill)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border-subtle)',
                  outline: 'none',
                }}
              >
                <option value="">Select Employee to Assign...</option>
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.name} ({(emp.role || 'agent').replace('_', ' ')}) - {emp.activeCases} active cases
                  </option>
                ))}
              </select>

              <button
                onClick={() => handleAdminApproveAndAssign(selectedEmpId || currentEmpId)}
                disabled={isAssigning || !currentEmpId}
                className="btn-apple-primary"
                style={{ padding: '10px 16px', fontSize: '12px', whiteSpace: 'nowrap', borderRadius: '10px' }}
              >
                <Check size={14} />
                <span>Approve & Notify Client</span>
              </button>
            </div>
          </div>

          {notificationStatus && (
            <p style={{ fontSize: '12px', color: '#248a3d', marginTop: '12px', fontWeight: 500 }}>
              {notificationStatus}
            </p>
          )}
        </div>

        {/* CHANNEL-AWARE CLIENT NOTIFICATION CARD */}
        <div className="glass-card" style={{ padding: '20px', marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <MessageSquare size={18} color="var(--accent-apple-blue)" />
              <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                Client Notification ({clientChannelUsed.toUpperCase()}) — Specialist Details Sent
              </span>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => copyToClipboard(clientNotificationMessage, setCopiedClientText)}
                className="btn-apple-secondary"
                style={{ padding: '6px 12px', fontSize: '11px' }}
              >
                {copiedClientText ? <Check size={13} color="#248a3d" /> : <Copy size={13} />}
                <span>{copiedClientText ? 'Copied' : 'Copy Text'}</span>
              </button>

              {isEmailChannel ? (
                <a
                  href={clientEmailUrl}
                  className="btn-apple-primary"
                  style={{ padding: '6px 12px', fontSize: '11px', textDecoration: 'none' }}
                >
                  <Mail size={13} />
                  <span>Send Client Email</span>
                </a>
              ) : (
                <a
                  href={clientWhatsAppUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-apple-primary"
                  style={{ padding: '6px 12px', fontSize: '11px', textDecoration: 'none' }}
                >
                  <Send size={13} />
                  <span>Open Client WhatsApp</span>
                </a>
              )}
            </div>
          </div>
          <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '8px' }}>
            This message with the representative's details (Name: <strong>{assignedEmp?.name}</strong>, Phone: <strong>{assignedEmp?.phone}</strong>, Email: <strong>{assignedEmp?.email}</strong>) is sent to the client via <strong>{clientChannelUsed.toUpperCase()}</strong>.
          </p>
          <pre
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              color: 'var(--text-primary)',
              background: 'var(--bg-pill)',
              border: '1px solid var(--border-subtle)',
              padding: '12px',
              borderRadius: '10px',
              whiteSpace: 'pre-wrap',
              lineHeight: '1.5',
            }}
          >
            {clientNotificationMessage}
          </pre>
        </div>

        {/* WhatsApp Notification Alert Card (Sent TO THE EMPLOYEE) */}
        <div className="glass-card" style={{ padding: '20px', marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <MessageSquare size={18} color="var(--accent-apple-blue)" />
              <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                Employee Assignment Alert (Sent to Specialist)
              </span>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => copyToClipboard(employeeAlertMessage, setCopiedEmpText)}
                className="btn-apple-secondary"
                style={{ padding: '6px 12px', fontSize: '11px' }}
              >
                {copiedEmpText ? <Check size={13} color="#248a3d" /> : <Copy size={13} />}
                <span>{copiedEmpText ? 'Copied' : 'Copy Text'}</span>
              </button>
              {assignedEmp?.phone && (
                <a
                  href={empWhatsAppUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-apple-primary"
                  style={{ padding: '6px 12px', fontSize: '11px', textDecoration: 'none' }}
                >
                  <Send size={13} />
                  <span>Notify Specialist</span>
                </a>
              )}
            </div>
          </div>
          <pre
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              color: 'var(--text-primary)',
              background: 'var(--bg-pill)',
              border: '1px solid var(--border-subtle)',
              padding: '12px',
              borderRadius: '10px',
              whiteSpace: 'pre-wrap',
              lineHeight: '1.5',
            }}
          >
            {employeeAlertMessage}
          </pre>
        </div>

        {/* Anti-Harassment Legal Notice Generator */}
        {lead.harassmentReported && (
          <div
            style={{
              background: 'rgba(255, 59, 48, 0.08)',
              border: '1px solid rgba(255, 59, 48, 0.2)',
              borderRadius: '16px',
              padding: '20px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShieldAlert size={18} color="#ff3b30" />
                <span style={{ fontSize: '13px', fontWeight: 600, color: '#ff3b30' }}>
                  RBI Anti-Harassment Representation Notice
                </span>
              </div>
              <button
                onClick={() => copyToClipboard(legalNoticeText, setCopiedNotice)}
                className="btn-apple-secondary"
                style={{ padding: '6px 12px', fontSize: '11px' }}
              >
                {copiedNotice ? <Check size={13} color="#248a3d" /> : <Copy size={13} />}
                <span>{copiedNotice ? 'Copied' : 'Copy Notice'}</span>
              </button>
            </div>
            <pre
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '11px',
                color: 'var(--text-primary)',
                background: 'var(--bg-pill)',
                border: '1px solid var(--border-subtle)',
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
