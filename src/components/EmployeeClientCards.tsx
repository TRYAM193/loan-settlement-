'use client';

import React, { useState } from 'react';
import { AntigravityCard } from './AntigravityCard';
import {
  Phone,
  Mail,
  Building,
  ShieldAlert,
  Sparkles,
  CheckCircle2,
  Copy,
  Check,
  Upload,
  RefreshCw,
  FileText,
  X,
  Send,
} from 'lucide-react';
import { Lead, Employee } from '../lib/types';

interface EmployeeClientCardsProps {
  leads: Lead[];
  employee: Employee | null;
  onRefreshData?: () => void;
}

export const EmployeeClientCards: React.FC<EmployeeClientCardsProps> = ({
  leads,
  employee,
  onRefreshData,
}) => {
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [copiedNotice, setCopiedNotice] = useState(false);
  const [isSettling, setIsSettling] = useState(false);
  const [isUploadingOcr, setIsUploadingOcr] = useState(false);
  const [settlementSuccessMsg, setSettlementSuccessMsg] = useState<string | null>(null);
  const [ocrSuccessMsg, setOcrSuccessMsg] = useState<string | null>(null);

  const handleMarkCaseFinished = async (leadId: string) => {
    setIsSettling(true);
    setSettlementSuccessMsg(null);

    try {
      const res = await fetch('/api/leads/settle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leadId,
          employeeId: employee?.id,
        }),
      });
      const json = await res.json();

      if (json.success) {
        setSettlementSuccessMsg(
          `🎉 Client Case Finished & Settled! Celebration WhatsApp sent from Main Company Number.`
        );
        if (onRefreshData) onRefreshData();
      } else {
        setSettlementSuccessMsg(`Error: ${json.error}`);
      }
    } catch (err: any) {
      setSettlementSuccessMsg(`Failed to settle case: ${err.message}`);
    } finally {
      setIsSettling(false);
    }
  };

  const handleDocumentOcrUpload = async (e: React.ChangeEvent<HTMLInputElement>, lead: Lead) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';

    setIsUploadingOcr(true);
    setOcrSuccessMsg(null);

    try {
      const formData = new FormData();
      formData.append('lead_id', lead.id);
      formData.append('phone', lead.phone);
      formData.append('document', file);

      const res = await fetch('/api/ingest/document-ocr', {
        method: 'POST',
        body: formData,
      });
      const json = await res.json();

      if (json.success) {
        setOcrSuccessMsg(
          `✅ TRYAM Enterprise Vision AI parsed notice! Lender: ${json.parsedMetrics.lender_name}, Principal: ₹${json.parsedMetrics.original_principal.toLocaleString(
            'en-IN'
          )}, Target Waiver: ₹${json.parsedMetrics.target_settlement_amount.toLocaleString('en-IN')}.`
        );
        if (onRefreshData) onRefreshData();
      } else {
        setOcrSuccessMsg(`Error: ${json.error}`);
      }
    } catch (err: any) {
      setOcrSuccessMsg(`Failed OCR scan: ${err.message}`);
    } finally {
      setIsUploadingOcr(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedNotice(true);
    setTimeout(() => setCopiedNotice(false), 2000);
  };

  return (
    <div>
      {leads.length === 0 ? (
        <div className="glass-card" style={{ padding: '40px', textAlign: 'center' }}>
          <h4 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)' }}>
            No Active Assigned Clients Yet
          </h4>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            When the system or admin assigns clients to your caseload, they will appear here as interactive cards.
          </p>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '20px',
          }}
        >
          {leads.map((lead) => {
            const isSettled = lead.status === 'settled';

            return (
              <AntigravityCard
                key={lead.id}
                onClick={() => setSelectedLead(lead)}
                glowColor={isSettled ? 'rgba(52, 199, 89, 0.15)' : 'rgba(0, 113, 227, 0.15)'}
                style={{
                  padding: '20px',
                  borderRadius: '18px',
                  border: '1px solid var(--border-subtle)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                }}
              >
                {/* Card Top Header */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <span className={`badge-status ${lead.status}`}>
                      {isSettled ? '🎉 Case Settled' : lead.status.replace('_', ' ')}
                    </span>
                    <span
                      style={{
                        fontSize: '10px',
                        fontWeight: 600,
                        padding: '3px 8px',
                        borderRadius: '999px',
                        background: 'var(--bg-pill)',
                        color: 'var(--text-secondary)',
                      }}
                    >
                      {lead.distressScore} Distress
                    </span>
                  </div>

                  <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
                    {lead.fullName}
                  </h3>
                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                    📞 {lead.phone} • {lead.source.replace('_', ' ').toUpperCase()}
                  </p>

                  {/* Debt Portfolio Pill */}
                  <div
                    style={{
                      background: 'var(--bg-pill)',
                      borderRadius: '12px',
                      padding: '12px',
                      border: '1px solid var(--border-subtle)',
                      marginBottom: '16px',
                    }}
                  >
                    <span style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                      Assigned Debt Portfolio
                    </span>
                    <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', marginTop: '2px' }}>
                      ₹{lead.totalDebtAmount.toLocaleString('en-IN')}
                    </div>
                  </div>
                </div>

                {/* Card Action Footer */}
                <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedLead(lead);
                    }}
                    className="btn-apple-primary"
                    style={{ flex: 1, justifyContent: 'center', padding: '9px 12px', fontSize: '12px' }}
                  >
                    <FileText size={14} />
                    <span>Open Case Details</span>
                  </button>
                </div>
              </AntigravityCard>
            );
          })}
        </div>
      )}

      {/* CENTER POPUP MODAL TAILORED FOR EMPLOYEE SPECIALISTS */}
      {selectedLead && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 110,
            background: 'rgba(0, 0, 0, 0.4)',
            backdropFilter: 'blur(12px)',
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
              maxWidth: '580px',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '28px',
              borderRadius: '24px',
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              position: 'relative',
              boxShadow: 'var(--card-shadow)',
              color: 'var(--text-primary)',
            }}
          >
            {/* Close Button */}
            <button
              onClick={() => setSelectedLead(null)}
              style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                background: 'var(--bg-pill)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-secondary)',
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

            {/* Header */}
            <div style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <span className={`badge-status ${selectedLead.status}`}>
                  {selectedLead.status === 'settled' ? '🎉 Case Finished & Settled' : selectedLead.status.replace('_', ' ')}
                </span>
              </div>
              <h2 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-primary)' }}>
                {selectedLead.fullName}
              </h2>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                📞 {selectedLead.phone} • {selectedLead.email || 'No email'}
              </p>
            </div>

            {/* CASE COMPLETION BUTTON */}
            <div
              style={{
                background: selectedLead.status === 'settled' ? 'rgba(52, 199, 89, 0.1)' : 'var(--bg-pill)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '16px',
                padding: '16px',
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Sparkles size={16} color="var(--accent-apple-blue)" />
                  <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {selectedLead.status === 'settled' ? '🎉 Case Settled' : 'Finish Client Case'}
                  </span>
                </div>
                <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  Mark finished & dispatch Celebration WhatsApp.
                </p>
              </div>

              <button
                onClick={() => handleMarkCaseFinished(selectedLead.id)}
                disabled={isSettling || selectedLead.status === 'settled'}
                className="btn-apple-primary"
                style={{ padding: '8px 14px', fontSize: '12px' }}
              >
                {isSettling ? <RefreshCw size={14} className="spin" /> : <CheckCircle2 size={14} />}
                <span>{selectedLead.status === 'settled' ? 'Settled' : 'Client Case Finished'}</span>
              </button>
            </div>

            {settlementSuccessMsg && (
              <div style={{ padding: '10px 14px', borderRadius: '10px', background: 'rgba(52, 199, 89, 0.1)', color: '#248a3d', fontSize: '12px', marginBottom: '16px' }}>
                {settlementSuccessMsg}
              </div>
            )}

            {/* TRYAM VISION OCR BANK NOTICE PARSER */}
            <div className="glass-card" style={{ padding: '16px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>
                  📄 TRYAM Enterprise Vision Notice Scanner
                </span>
                {isUploadingOcr && <RefreshCw size={14} className="spin" color="var(--accent-apple-blue)" />}
              </div>
              <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '12px' }}>
                Upload any bank legal notice image/PDF. TRYAM Vision AI will extract principal debt, interest, and target settlement waiver.
              </p>

              <label
                className="btn-apple-secondary"
                style={{ cursor: 'pointer', display: 'inline-flex', width: '100%', justifyContent: 'center' }}
              >
                <Upload size={14} />
                <span>{isUploadingOcr ? 'Scanning with TRYAM Vision AI...' : 'Upload Bank Legal Notice Image / PDF'}</span>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => handleDocumentOcrUpload(e, selectedLead)}
                  style={{ display: 'none' }}
                  disabled={isUploadingOcr}
                />
              </label>

              {ocrSuccessMsg && (
                <div style={{ padding: '10px', borderRadius: '8px', background: 'var(--bg-pill)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)', fontSize: '11px', marginTop: '10px' }}>
                  {ocrSuccessMsg}
                </div>
              )}
            </div>

            {/* DEBT BREAKDOWN */}
            <div className="glass-card" style={{ padding: '16px', marginBottom: '20px' }}>
              <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Extracted Lender Breakdown
              </span>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px', marginBottom: '12px' }}>
                <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Total Liability</span>
                <span style={{ fontSize: '18px', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>
                  ₹{selectedLead.totalDebtAmount.toLocaleString('en-IN')}
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {(selectedLead.lenders || []).map((lender, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      background: 'var(--bg-pill)',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                  >
                    <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{lender.name}</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--text-primary)' }}>
                      ₹{lender.amount.toLocaleString('en-IN')}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* ANTI HARASSMENT NOTICE */}
            {selectedLead.harassmentReported && (
              <div style={{ background: 'rgba(255, 59, 48, 0.08)', border: '1px solid rgba(255, 59, 48, 0.2)', padding: '16px', borderRadius: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: '#ff3b30' }}>
                    🛡️ Anti-Harassment Representation Notice
                  </span>
                  <button
                    onClick={() => copyToClipboard(`CEASE & DESIST NOTICE FOR ${selectedLead.fullName}`)}
                    className="btn-apple-secondary"
                    style={{ padding: '4px 8px', fontSize: '10px' }}
                  >
                    {copiedNotice ? <Check size={12} color="#248a3d" /> : <Copy size={12} />}
                    <span>{copiedNotice ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <p style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                  Client is protected under RBI Fair Practices Code. Serve this representation notice to recovery personnel to halt direct contacting.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
