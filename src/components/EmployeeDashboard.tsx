'use client';

import React, { useState } from 'react';
import { UserCheck, Phone, Mail, FileText, Send, Building, ShieldAlert, Sparkles, Plus, Search, CheckCircle, ExternalLink, Lock } from 'lucide-react';
import { Lead, Employee } from '../lib/types';
import { getWhatsAppClickUrl } from '../lib/whatsappService';

interface EmployeeDashboardProps {
  currentEmployee: Employee | null;
  assignedLeads: Lead[];
  onSelectLead: (lead: Lead) => void;
  onRefreshData?: () => void;
}

export const EmployeeDashboard: React.FC<EmployeeDashboardProps> = ({
  currentEmployee,
  assignedLeads,
  onSelectLead,
  onRefreshData,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSimulatingDoc, setIsSimulatingDoc] = useState(false);
  const [simDocText, setSimDocText] = useState('');
  const [selectedLeadIdForDoc, setSelectedLeadIdForDoc] = useState<string>('');
  const [docAnalyzeStatus, setDocAnalyzeStatus] = useState<string | null>(null);

  const empName = currentEmployee ? currentEmployee.name : 'Specialist Agent';
  const totalAssignedDebt = assignedLeads.reduce((acc, l) => acc + (l.totalDebtAmount || 0), 0);

  const filteredLeads = assignedLeads.filter(
    (l) =>
      l.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.phone.includes(searchQuery) ||
      (l.email && l.email.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleAnalyzeDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLeadIdForDoc) {
      setDocAnalyzeStatus('Please select an assigned client lead');
      return;
    }

    setIsSimulatingDoc(true);
    setDocAnalyzeStatus('Parsing document & extracting debt metrics...');

    try {
      const res = await fetch('/api/documents/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leadId: selectedLeadIdForDoc,
          documentText: simDocText || 'HDFC Bank Account Statement. Monthly EMI ₹25,000 overdue. Principal outstanding ₹3,50,000.',
          fileName: 'Client_Bank_Statement.pdf',
        }),
      });

      const json = await res.json();
      if (json.success) {
        setDocAnalyzeStatus(`Successfully analyzed document: ${json.data.summary}`);
        setSimDocText('');
        if (onRefreshData) onRefreshData();
      } else {
        setDocAnalyzeStatus(`Error: ${json.error}`);
      }
    } catch (err: any) {
      setDocAnalyzeStatus(`Failed: ${err.message}`);
    } finally {
      setIsSimulatingDoc(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }} className="animate-fade-in">
      {/* Isolated Workspace Banner */}
      <div
        className="glass-card"
        style={{
          padding: '24px',
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(168, 85, 247, 0.1) 100%)',
          border: '1px solid rgba(99, 102, 241, 0.3)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div
            style={{
              width: '52px',
              height: '52px',
              borderRadius: '50%',
              background: 'var(--accent-primary-gradient)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '20px',
              fontWeight: 800,
              color: '#fff',
              boxShadow: '0 8px 20px rgba(99, 102, 241, 0.4)',
            }}
          >
            {empName.charAt(0)}
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#fff' }}>
                Welcome back, {empName}!
              </h2>
              <span
                style={{
                  background: 'rgba(52, 211, 153, 0.15)',
                  color: '#34d399',
                  border: '1px solid #34d399',
                  fontSize: '11px',
                  fontWeight: 700,
                  padding: '2px 8px',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <Lock size={10} />
                Isolated Workspace
              </span>
            </div>
            <p style={{ fontSize: '13px', color: '#cbd5e1', marginTop: '4px' }}>
              You are currently viewing <strong>strictly your assigned client portfolio</strong> ({assignedLeads.length} active leads).
            </p>
          </div>
        </div>

        {/* Quick KPI Stat Chips */}
        <div style={{ display: 'flex', gap: '12px' }}>
          <div
            style={{
              background: 'rgba(0, 0, 0, 0.3)',
              padding: '10px 16px',
              borderRadius: '14px',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              textAlign: 'center',
            }}
          >
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block' }}>My Active Clients</span>
            <span style={{ fontSize: '18px', fontWeight: 800, color: '#fff', fontFamily: 'var(--font-mono)' }}>
              {assignedLeads.length}
            </span>
          </div>

          <div
            style={{
              background: 'rgba(0, 0, 0, 0.3)',
              padding: '10px 16px',
              borderRadius: '14px',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              textAlign: 'center',
            }}
          >
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block' }}>Assigned Debt Volume</span>
            <span style={{ fontSize: '18px', fontWeight: 800, color: '#a5b4fc', fontFamily: 'var(--font-mono)' }}>
              ₹{totalAssignedDebt.toLocaleString('en-IN')}
            </span>
          </div>
        </div>
      </div>

      {/* Document Analyzer Simulator Widget */}
      <div className="glass-card" style={{ padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={18} color="#818cf8" />
            <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#fff' }}>
              WhatsApp Document Analyzer Engine
            </h3>
          </div>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
            Parse Bank Statements, Recovery Notices & CIBIL Reports
          </span>
        </div>

        <form onSubmit={handleAnalyzeDocument} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '10px' }}>
            <select
              value={selectedLeadIdForDoc}
              onChange={(e) => setSelectedLeadIdForDoc(e.target.value)}
              className="apple-input"
              style={{ padding: '9px 12px', fontSize: '12px', borderRadius: '10px' }}
            >
              <option value="">Select Assigned Client...</option>
              {assignedLeads.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.fullName} ({l.phone})
                </option>
              ))}
            </select>

            <input
              type="text"
              placeholder="Paste document text or excerpt (e.g. HDFC Bank Statement EMI Overdue ₹35,000)..."
              value={simDocText}
              onChange={(e) => setSimDocText(e.target.value)}
              style={{
                background: 'rgba(0, 0, 0, 0.3)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '10px',
                padding: '9px 12px',
                color: '#fff',
                fontSize: '12px',
                outline: 'none',
              }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button
              type="submit"
              disabled={isSimulatingDoc}
              className="btn-apple-primary"
              style={{ padding: '8px 16px', fontSize: '12px' }}
            >
              <FileText size={14} />
              <span>{isSimulatingDoc ? 'Parsing Document...' : 'Analyze Document & Update Vault'}</span>
            </button>

            {docAnalyzeStatus && (
              <span style={{ fontSize: '12px', color: '#34d399', fontWeight: 500 }}>
                {docAnalyzeStatus}
              </span>
            )}
          </div>
        </form>
      </div>

      {/* Search Filter for Employee's Clients */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ position: 'relative', width: '320px' }}>
          <Search size={15} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            placeholder="Search my clients by name or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '12px',
              padding: '8px 12px 8px 36px',
              color: '#fff',
              fontSize: '13px',
              outline: 'none',
            }}
          />
        </div>
      </div>

      {/* My Assigned Clients Table */}
      <div className="glass-card" style={{ padding: '20px', overflowX: 'auto' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#fff', marginBottom: '16px' }}>
          My Assigned Client Roster ({filteredLeads.length})
        </h3>

        {filteredLeads.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
            <UserCheck size={36} color="var(--text-muted)" style={{ margin: '0 auto 12px auto' }} />
            <p style={{ fontSize: '14px' }}>No clients currently assigned to your roster.</p>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}>
                <th style={{ padding: '12px' }}>Client Name</th>
                <th style={{ padding: '12px' }}>Contact Phone</th>
                <th style={{ padding: '12px' }}>Source</th>
                <th style={{ padding: '12px' }}>Total Debt</th>
                <th style={{ padding: '12px' }}>Status</th>
                <th style={{ padding: '12px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredLeads.map((lead) => {
                const waUrl = getWhatsAppClickUrl(
                  lead.phone,
                  `Hello ${lead.fullName}, I am ${empName}, your assigned Debt Settlement Manager at TRYAM. Let me know when you are available to review your portfolio.`
                );

                return (
                  <tr
                    key={lead.id}
                    style={{
                      borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                      transition: 'background 0.2s ease',
                    }}
                    className="hover:bg-white/5"
                  >
                    <td style={{ padding: '14px 12px', fontWeight: 600, color: '#fff' }}>
                      {lead.fullName}
                    </td>
                    <td style={{ padding: '14px 12px', color: 'var(--text-primary)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Phone size={13} color="#818cf8" />
                        <span>{lead.phone}</span>
                      </div>
                    </td>
                    <td style={{ padding: '14px 12px' }}>
                      <span className="badge-source">{lead.source}</span>
                    </td>
                    <td style={{ padding: '14px 12px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#fff' }}>
                      ₹{lead.totalDebtAmount.toLocaleString('en-IN')}
                    </td>
                    <td style={{ padding: '14px 12px' }}>
                      <span className={`badge-status ${lead.status}`}>{lead.status.replace('_', ' ')}</span>
                    </td>
                    <td style={{ padding: '14px 12px' }}>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          onClick={() => onSelectLead(lead)}
                          className="btn-apple-secondary"
                          style={{ padding: '5px 10px', fontSize: '11px' }}
                        >
                          <FileText size={13} />
                          <span>View Case & Vault</span>
                        </button>
                        <a
                          href={waUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="btn-apple-primary"
                          style={{
                            padding: '5px 10px',
                            fontSize: '11px',
                            textDecoration: 'none',
                            background: '#059669',
                            color: '#fff',
                          }}
                        >
                          <Send size={12} />
                          <span>WhatsApp</span>
                        </a>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
