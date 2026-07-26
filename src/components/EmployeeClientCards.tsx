'use client';

import React, { useState } from 'react';
import {
  User,
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
  ExternalLink,
  MessageSquare,
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
          `✅ Gemini 2.5 Flash Vision parsed notice! Lender: ${json.parsedMetrics.lender_name}, Principal: ₹${json.parsedMetrics.original_principal.toLocaleString(
            'en-IN'
          )}, Target Waiver: ₹${json.parsedMetrics.target_settlement_amount.toLocaleString('en-IN')}.`
        );
        if (onRefreshData) onRefreshData();
      } else {
        setOcrSuccessMsg(`Error: ${json.error}`);
      }
    } catch (err: any) {
      setOcrSuccessMsg(`Failed OCR upload: ${err.message}`);
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
      {/* GRID LAYOUT OF CLIENT CARDS */}
      {leads.length === 0 ? (
        <div className="glass-card" style={{ padding: '40px', textAlign: 'center' }}>
          <User size={36} color="var(--text-muted)" style={{ margin: '0 auto 12px auto' }} />
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#fff' }}>No Active Clients Assigned</h3>
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
              <div
                key={lead.id}
                className="glass-card animate-fade-in"
                style={{
                  padding: '20px',
                  borderRadius: '18px',
                  border: isSettled ? '1px solid rgba(52, 211, 153, 0.4)' : '1px solid var(--border-subtle)',
                  background: isSettled
                    ? 'linear-gradient(180deg, rgba(16, 185, 129, 0.08) 0%, rgba(14, 15, 22, 0.95) 100%)'
                    : 'linear-gradient(180deg, rgba(24, 25, 35, 0.8) 0%, rgba(14, 15, 22, 0.9) 100%)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  transition: 'all 0.2s ease',
                  cursor: 'pointer',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
                }}
                onClick={() => setSelectedLead(lead)}
              >
                {/* Card Top Header */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <span
                      style={{
                        fontSize: '10px',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        padding: '3px 8px',
                        borderRadius: '6px',
                        background: isSettled ? 'rgba(52, 211, 153, 0.2)' : 'rgba(99, 102, 241, 0.2)',
                        color: isSettled ? '#34d399' : '#a5b4fc',
                        border: isSettled ? '1px solid rgba(52, 211, 153, 0.4)' : '1px solid rgba(99, 102, 241, 0.3)',
                      }}
                    >
                      {isSettled ? '🎉 Case Settled (Happy Customer)' : lead.status.replace('_', ' ')}
                    </span>
                    <span
                      style={{
                        fontSize: '10px',
                        fontWeight: 700,
                        padding: '3px 8px',
                        borderRadius: '6px',
                        background:
                          lead.distressScore === 'High' || lead.distressScore === 'Critical'
                            ? 'rgba(244, 63, 94, 0.2)'
                            : 'rgba(251, 191, 36, 0.2)',
                        color:
                          lead.distressScore === 'High' || lead.distressScore === 'Critical' ? '#f43f5e' : '#fbbf24',
                      }}
                    >
                      {lead.distressScore} Distress
                    </span>
                  </div>

                  <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#fff', marginBottom: '4px' }}>
                    {lead.fullName}
                  </h3>
                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                    📞 {lead.phone} • {lead.source.replace('_', ' ').toUpperCase()}
                  </p>

                  {/* Debt Portfolio Pill */}
                  <div
                    style={{
                      background: 'rgba(0, 0, 0, 0.3)',
                      borderRadius: '12px',
                      padding: '12px',
                      border: '1px solid rgba(255, 255, 255, 0.05)',
                      marginBottom: '16px',
                    }}
                  >
                    <span style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                      Assigned Debt Portfolio
                    </span>
                    <div style={{ fontSize: '20px', fontWeight: 800, color: '#fff', fontFamily: 'var(--font-mono)', marginTop: '2px' }}>
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
                    style={{ flex: 1, justifyContent: 'center', padding: '9px 12px', fontSize: '12px', borderRadius: '10px' }}
                  >
                    <FileText size={14} />
                    <span>Open Case Details</span>
                  </button>
                </div>
              </div>
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
              maxWidth: '580px',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '28px',
              borderRadius: '24px',
              background: '#0e0f17',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              position: 'relative',
              boxShadow: '0 25px 60px rgba(0, 0, 0, 0.9)',
            }}
          >
            {/* Close Button */}
            <button
              onClick={() => setSelectedLead(null)}
              style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                background: 'rgba(255, 255, 255, 0.08)',
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

            {/* Modal Header */}
            <div style={{ marginBottom: '20px' }}>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  padding: '3px 8px',
                  borderRadius: '6px',
                  background: selectedLead.status === 'settled' ? 'rgba(52, 211, 153, 0.2)' : 'rgba(99, 102, 241, 0.2)',
                  color: selectedLead.status === 'settled' ? '#34d399' : '#a5b4fc',
                }}
              >
                {selectedLead.status === 'settled' ? '🎉 Settled (Happy Customer)' : selectedLead.status.replace('_', ' ')}
              </span>
              <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#fff', marginTop: '8px' }}>
                {selectedLead.fullName}
              </h2>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                Assigned Specialist: <strong>{employee?.name || 'You'}</strong> • Phone: {selectedLead.phone}
              </p>
            </div>

            {/* CASE SETTLEMENT COMPLETION ACTION BUTTON */}
            <div
              style={{
                background: selectedLead.status === 'settled' ? 'rgba(52, 211, 153, 0.15)' : 'rgba(16, 185, 129, 0.1)',
                border: '1px solid rgba(52, 211, 153, 0.4)',
                borderRadius: '16px',
                padding: '16px',
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Sparkles size={16} color="#34d399" />
                  <span style={{ fontSize: '13px', fontWeight: 700, color: '#34d399' }}>
                    {selectedLead.status === 'settled' ? '🎉 Case Fully Settled' : 'Case Completion Control'}
                  </span>
                </div>
                <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  {selectedLead.status === 'settled'
                    ? 'Client marked as Happy Customer. Celebration WhatsApp sent!'
                    : 'Click when negotiations finish to send Celebration WhatsApp to client.'}
                </p>
              </div>

              <button
                onClick={() => handleMarkCaseFinished(selectedLead.id)}
                disabled={isSettling || selectedLead.status === 'settled'}
                className="btn-apple-primary"
                style={{
                  padding: '9px 14px',
                  fontSize: '11px',
                  background: selectedLead.status === 'settled' ? '#047857' : 'linear-gradient(135deg, #10b981, #059669)',
                  color: '#fff',
                  borderRadius: '10px',
                  whiteSpace: 'nowrap',
                }}
              >
                {isSettling ? <RefreshCw size={13} className="spin" /> : <CheckCircle2 size={14} />}
                <span>{selectedLead.status === 'settled' ? 'Settled' : 'Client Case Finished'}</span>
              </button>
            </div>

            {settlementSuccessMsg && (
              <div style={{ padding: '10px 14px', borderRadius: '10px', background: 'rgba(52, 211, 153, 0.2)', border: '1px solid rgba(52, 211, 153, 0.3)', color: '#a7f3d0', fontSize: '11px', marginBottom: '20px' }}>
                {settlementSuccessMsg}
              </div>
            )}

            {/* DEBT PORTFOLIO CARD */}
            <div className="glass-card" style={{ padding: '16px', marginBottom: '20px' }}>
              <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Debt Metrics & Lenders
              </span>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: '4px', marginBottom: '12px' }}>
                <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Total Debt Portfolio</span>
                <span style={{ fontSize: '20px', fontWeight: 800, fontFamily: 'var(--font-mono)', color: '#fff' }}>
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
                      alignItems: 'center',
                      background: 'rgba(0, 0, 0, 0.3)',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Building size={13} color="#a5b4fc" />
                      <span style={{ color: '#fff', fontWeight: 500 }}>{lender.name}</span>
                    </div>
                    <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: '#f8fafc' }}>
                      ₹{lender.amount.toLocaleString('en-IN')}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* DOCUMENT OCR UPLOAD TOOL (GEMINI 2.5 FLASH VISION) */}
            <div className="glass-card" style={{ padding: '16px', marginBottom: '20px', border: '1px solid rgba(56, 189, 248, 0.3)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Upload size={16} color="#38bdf8" />
                  <span style={{ fontSize: '12px', fontWeight: 700, color: '#38bdf8' }}>
                    Upload Bank Notice / Bill (Gemini Vision OCR)
                  </span>
                </div>
                {isUploadingOcr && <RefreshCw size={13} className="spin" color="#38bdf8" />}
              </div>
              <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '10px' }}>
                Upload photo of client's bank notice or credit statement to run <strong>Google Gemini 2.5 Flash Vision OCR</strong>.
              </p>

              <label
                className="btn-apple-secondary"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 14px',
                  fontSize: '11px',
                  cursor: 'pointer',
                  background: 'rgba(56, 189, 248, 0.15)',
                  border: '1px solid rgba(56, 189, 248, 0.3)',
                  color: '#38bdf8',
                  borderRadius: '8px',
                }}
              >
                <Upload size={13} />
                <span>Select Notice Photo...</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleDocumentOcrUpload(e, selectedLead)}
                  style={{ display: 'none' }}
                />
              </label>

              {ocrSuccessMsg && (
                <p style={{ fontSize: '11px', color: '#38bdf8', marginTop: '10px', fontWeight: 500 }}>
                  {ocrSuccessMsg}
                </p>
              )}
            </div>

            {/* RBI CEASE-AND-DESIST LEGAL NOTICE COPY */}
            {selectedLead.harassmentReported && (
              <div
                style={{
                  background: 'rgba(244, 63, 94, 0.08)',
                  border: '1px solid rgba(244, 63, 94, 0.3)',
                  borderRadius: '14px',
                  padding: '16px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <ShieldAlert size={16} color="#f43f5e" />
                    <span style={{ fontSize: '12px', fontWeight: 700, color: '#fda4af' }}>
                      RBI Anti-Harassment Representation Notice
                    </span>
                  </div>
                  <button
                    onClick={() =>
                      copyToClipboard(
                        `FORMAL LEGAL REPRESENTATION NOTICE\nClient: ${selectedLead.fullName}\nDebt: ₹${selectedLead.totalDebtAmount.toLocaleString(
                          'en-IN'
                        )}\nSpecialist: ${employee?.name || 'TRYAM Team'}`
                      )
                    }
                    className="btn-apple-secondary"
                    style={{ padding: '5px 10px', fontSize: '10px' }}
                  >
                    {copiedNotice ? <Check size={12} color="#34d399" /> : <Copy size={12} />}
                    <span>{copiedNotice ? 'Copied' : 'Copy Notice'}</span>
                  </button>
                </div>
                <p style={{ fontSize: '11px', color: '#fecdd3', lineHeight: '1.4' }}>
                  Notice prepared under RBI Fair Practices Code for Lenders (RBI/2015-16/160). Copy to send to harassing recovery personnel.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
