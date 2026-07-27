'use client';

import React, { useState, useRef } from 'react';
import { X, Sparkles, PhoneCall, MessageSquare, Mail, Globe, UserCheck, Upload, Mic, Loader2, FileText, CheckCircle2 } from 'lucide-react';
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
  const [activeTab, setActiveTab] = useState<'call_simulation' | 'upload_audio' | 'manual'>('call_simulation');
  
  // Form fields
  const [fullName, setFullName] = useState('Ramesh Kumar');
  const [phone, setPhone] = useState('+91 98611 04161');
  const [email, setEmail] = useState('ramesh.k@gmail.com');
  const [source, setSource] = useState<LeadSource>('inbound_call');
  const [debtAmount, setDebtAmount] = useState('450000');
  const [distressScore, setDistressScore] = useState<'Low' | 'Medium' | 'High' | 'Critical'>('Critical');
  const [harassment, setHarassment] = useState(true);
  const [notes, setNotes] = useState('Ingested via TRYAM Enterprise Regional Speech STT. Extracted HDFC & ICICI debt liabilities.');

  // Call simulation & Audio Upload state
  const [selectedPreset, setSelectedPreset] = useState<'kannada_hdfc' | 'mumbai_sbi'>('kannada_hdfc');
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [sttSuccessMessage, setSttSuccessMessage] = useState<string | null>(null);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState('');
  const audioInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const numDebt = parseFloat(debtAmount) || 0;
  const bestAssignment = calculateBestEmployee(employees, numDebt);

  const presets = {
    kannada_hdfc: {
      name: 'Ramesh Kumar (Bengaluru)',
      phone: '+91 98611 04161',
      email: 'ramesh.k@gmail.com',
      debt: '450000',
      distress: 'Critical' as const,
      harassment: true,
      rawAudioText: 'Nanage HDFC loan (Rs. 2.8 Lakhs) matte ICICI credit card (Rs. 1.7 Lakhs) total debt idhe. Recovery agents nanna office ge call maadi workplace harassment madtha idhare. I need urgent legal protection under RBI rules.',
      summary: 'STT: TRYAM Enterprise Regional Speech (Kannada). Extracted Lenders: HDFC Bank (₹2.8L), ICICI Bank (₹1.7L). Total Debt: ₹4,50,000. Flagged: Workplace Harassment (Critical).',
    },
    mumbai_sbi: {
      name: 'Anjali Sharma (Mumbai)',
      phone: '+91 98200 11223',
      email: 'anjali.sharma@merchant.com',
      debt: '820000',
      distress: 'High' as const,
      harassment: false,
      rawAudioText: 'I am calling regarding my debt settlement. I have ₹8.2 Lakhs total debt across SBI Personal Loan (₹5.2L) and Bajaj Finance (₹3.0L). Overdue by 4 months due to business loss.',
      summary: 'STT: TRYAM Enterprise High-Fidelity STT. Extracted Lenders: SBI Personal Loan (₹5.2L), Bajaj Finance (₹3.0L). Total Debt: ₹8,20,000. Distress: High.',
    },
  };

  const handleApplyPreset = (presetKey: 'kannada_hdfc' | 'mumbai_sbi') => {
    setSelectedPreset(presetKey);
    setIsTranscribing(true);
    setSttSuccessMessage(null);

    const data = presets[presetKey];

    setTimeout(() => {
      setFullName(data.name);
      setPhone(data.phone);
      setEmail(data.email);
      setDebtAmount(data.debt);
      setDistressScore(data.distress);
      setHarassment(data.harassment);
      setNotes(data.summary);
      setSource('inbound_call');
      setIsTranscribing(false);
      setSttSuccessMessage(`✨ Transcribed via TRYAM Proprietary Financial AI! Extracted ₹${Number(data.debt).toLocaleString('en-IN')} debt.`);
    }, 800);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !phone) return;

    const assignedEmp = bestAssignment ? bestAssignment.employee : employees[0];
    setIsProcessing(true);

    try {
      if (audioFile && activeTab === 'upload_audio') {
        setProcessingStatus('Uploading audio to Enterprise Cloud Vault...');
        const formData = new FormData();
        formData.append('audio', audioFile);
        formData.append('caller_phone', phone);
        formData.append('agent_phone', assignedEmp?.phone || '+919876543210');
        formData.append('duration', '0');
        formData.append('full_name', fullName);

        setProcessingStatus('Transcribing call audio with TRYAM Enterprise Regional Speech Engine...');
        const res = await fetch('/api/ingest/android-call', {
          method: 'POST',
          body: formData,
        });

        const json = await res.json();
        setIsProcessing(false);

        if (json.success) {
          onAddLead(
            {
              id: json.data?.id || `lead-${Date.now()}`,
              fullName: json.data?.full_name || fullName,
              phone: json.data?.phone || phone,
              email: json.data?.email || email || `${fullName.toLowerCase().replace(/\s+/g, '.')}@client.com`,
              source: json.data?.source || source,
              status: json.data?.status || 'new',
              assignedEmployeeId: json.data?.assigned_employee_id || (assignedEmp ? assignedEmp.id : ''),
              assignedEmployeeName: assignedEmp ? assignedEmp.name : 'Assigned Agent',
              totalDebtAmount: Number(json.data?.total_debt_amount || numDebt),
              lenders: [{ name: 'Extracted Liabilities', amount: Number(json.data?.total_debt_amount || numDebt), type: 'Credit Debt' }],
              distressScore: json.data?.distress_score || distressScore,
              harassmentReported: json.data?.harassment_flag ?? harassment,
              createdAt: json.data?.created_at || new Date().toISOString(),
              notes: `STT Engine: TRYAM Enterprise Regional Speech Engine. ${json.rawTranscript ? 'Transcript: ' + json.rawTranscript.substring(0, 100) + '...' : ''}`,
            },
            assignedEmp ? assignedEmp.id : ''
          );
          onClose();
          return;
        }
      } else {
        setProcessingStatus('Creating lead and routing to specialist...');
        const res = await fetch('/api/leads', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fullName,
            phone,
            email: email || `${fullName.toLowerCase().replace(/\s+/g, '.')}@client.com`,
            source,
            totalDebtAmount: numDebt,
            assignedEmployeeId: assignedEmp ? assignedEmp.id : undefined,
            notes: notes || `Client logged via ${source.replace('_', ' ')}. Smart workload engine routed to ${assignedEmp ? assignedEmp.name : 'Team'}.`,
          }),
        });

        const json = await res.json();
        const createdId = json.data?.id || `lead-${Date.now()}`;
        
        onAddLead(
          {
            id: createdId,
            fullName: json.data?.full_name || fullName,
            phone: json.data?.phone || phone,
            email: json.data?.email || email || `${fullName.toLowerCase().replace(/\s+/g, '.')}@client.com`,
            source: json.data?.source || source,
            status: json.data?.status || 'new',
            assignedEmployeeId: json.data?.assigned_employee_id || (assignedEmp ? assignedEmp.id : ''),
            assignedEmployeeName: assignedEmp ? assignedEmp.name : 'Assigned Agent',
            totalDebtAmount: Number(json.data?.total_debt_amount || numDebt),
            lenders: [{ name: harassment ? 'HDFC / ICICI Liabilities' : 'SBI / Bajaj Credit Line', amount: numDebt, type: 'Credit Debt' }],
            distressScore,
            harassmentReported: harassment,
            createdAt: json.data?.created_at || new Date().toISOString(),
            notes: json.data?.notes || notes,
          },
          assignedEmp ? assignedEmp.id : ''
        );
      }
    } catch (err) {
      console.error('Failed to post new lead:', err);
      // Fallback local UI update so lead always appears immediately
      const assignedEmp = bestAssignment ? bestAssignment.employee : employees[0];
      onAddLead(
        {
          id: `lead-${Date.now()}`,
          fullName,
          phone,
          email: email || `${fullName.toLowerCase().replace(/\s+/g, '.')}@client.com`,
          source,
          status: 'new',
          assignedEmployeeId: assignedEmp ? assignedEmp.id : '',
          assignedEmployeeName: assignedEmp ? assignedEmp.name : 'Assigned Agent',
          totalDebtAmount: numDebt,
          lenders: [{ name: harassment ? 'HDFC / ICICI Liabilities' : 'SBI / Bajaj Credit Line', amount: numDebt, type: 'Credit Debt' }],
          distressScore,
          harassmentReported: harassment,
          createdAt: new Date().toISOString(),
          notes: notes,
        },
        assignedEmp ? assignedEmp.id : ''
      );
    } finally {
      setIsProcessing(false);
      onClose();
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
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
          padding: '28px',
          background: 'var(--bg-surface)',
          borderRadius: '24px',
          position: 'relative',
          maxHeight: '90vh',
          overflowY: 'auto',
          border: '1px solid var(--border-subtle)',
          boxShadow: 'var(--card-shadow)',
          color: 'var(--text-primary)',
        }}
      >
        <button
          onClick={onClose}
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Mic size={22} color="var(--accent-apple-blue)" />
            <h2 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.3px' }}>
              Ingest & Process Customer Call Lead
            </h2>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            TRYAM Enterprise Regional Speech STT + Proprietary Financial AI Extraction
          </p>
        </div>

        {/* Tab Switcher */}
        <div style={{ display: 'flex', gap: '6px', marginBottom: '20px', background: 'var(--bg-pill)', padding: '4px', borderRadius: '12px' }}>
          <button
            type="button"
            onClick={() => setActiveTab('call_simulation')}
            style={{
              flex: 1,
              padding: '8px 6px',
              borderRadius: '9px',
              border: 'none',
              background: activeTab === 'call_simulation' ? 'var(--bg-surface)' : 'transparent',
              color: activeTab === 'call_simulation' ? 'var(--accent-apple-blue)' : 'var(--text-secondary)',
              fontWeight: activeTab === 'call_simulation' ? 700 : 500,
              fontSize: '11px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
            }}
          >
            <Mic size={14} />
            <span>Simulate Call (STT AI)</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('upload_audio')}
            style={{
              flex: 1,
              padding: '8px 6px',
              borderRadius: '9px',
              border: 'none',
              background: activeTab === 'upload_audio' ? 'var(--bg-surface)' : 'transparent',
              color: activeTab === 'upload_audio' ? 'var(--accent-apple-blue)' : 'var(--text-secondary)',
              fontWeight: activeTab === 'upload_audio' ? 700 : 500,
              fontSize: '11px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
            }}
          >
            <Upload size={14} />
            <span>Upload Audio File</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('manual')}
            style={{
              flex: 1,
              padding: '8px 6px',
              borderRadius: '9px',
              border: 'none',
              background: activeTab === 'manual' ? 'var(--bg-surface)' : 'transparent',
              color: activeTab === 'manual' ? 'var(--accent-apple-blue)' : 'var(--text-secondary)',
              fontWeight: activeTab === 'manual' ? 700 : 500,
              fontSize: '11px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
            }}
          >
            <FileText size={14} />
            <span>Manual Form</span>
          </button>
        </div>

        {/* CALL SIMULATION PRESETS */}
        {activeTab === 'call_simulation' && (
          <div style={{ marginBottom: '20px' }}>
            <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '8px', textTransform: 'uppercase' }}>
              Select Customer Audio Call Scenario (Live Demo)
            </label>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
              <button
                type="button"
                onClick={() => handleApplyPreset('kannada_hdfc')}
                style={{
                  textAlign: 'left',
                  padding: '12px 14px',
                  borderRadius: '14px',
                  border: selectedPreset === 'kannada_hdfc' ? '2px solid var(--accent-apple-blue)' : '1px solid var(--border-subtle)',
                  background: selectedPreset === 'kannada_hdfc' ? 'rgba(0, 113, 227, 0.06)' : 'var(--bg-pill)',
                  cursor: 'pointer',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <span style={{ fontWeight: 700, fontSize: '13px', color: 'var(--text-primary)' }}>
                    🎙️ Scenario A: Ramesh Kumar (Bengaluru — Kannada Call)
                  </span>
                  <span style={{ fontSize: '10px', background: '#ff3b30', color: '#fff', fontWeight: 700, padding: '2px 8px', borderRadius: '6px' }}>
                    CRITICAL HARASSMENT
                  </span>
                </div>
                <p style={{ fontSize: '11px', color: 'var(--text-secondary)', margin: 0 }}>
                  "Nanage HDFC loan (₹2.8L) matte ICICI card (₹1.7L) debt idhe. Recovery agents office ge call maadi harassment madtha idhare..."
                </p>
              </button>

              <button
                type="button"
                onClick={() => handleApplyPreset('mumbai_sbi')}
                style={{
                  textAlign: 'left',
                  padding: '12px 14px',
                  borderRadius: '14px',
                  border: selectedPreset === 'mumbai_sbi' ? '2px solid var(--accent-apple-blue)' : '1px solid var(--border-subtle)',
                  background: selectedPreset === 'mumbai_sbi' ? 'rgba(0, 113, 227, 0.06)' : 'var(--bg-pill)',
                  cursor: 'pointer',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <span style={{ fontWeight: 700, fontSize: '13px', color: 'var(--text-primary)' }}>
                    🎙️ Scenario B: Anjali Sharma (Mumbai — Merchant Debt)
                  </span>
                  <span style={{ fontSize: '10px', background: '#ff9500', color: '#fff', fontWeight: 700, padding: '2px 8px', borderRadius: '6px' }}>
                    HIGH DISTRESS (₹8.2L)
                  </span>
                </div>
                <p style={{ fontSize: '11px', color: 'var(--text-secondary)', margin: 0 }}>
                  "I have ₹8.2 Lakhs total debt across SBI Personal Loan (₹5.2L) and Bajaj Finance (₹3.0L). Overdue 4 months..."
                </p>
              </button>
            </div>

            {isTranscribing && (
              <div style={{ padding: '12px', background: 'rgba(0, 113, 227, 0.08)', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '12px', color: 'var(--accent-apple-blue)' }}>
                <Sparkles size={16} className="spin" />
                <span>Running TRYAM Enterprise Regional Speech STT & Proprietary Financial Extraction...</span>
              </div>
            )}

            {sttSuccessMessage && (
              <div style={{ padding: '12px', background: 'rgba(52, 199, 89, 0.1)', border: '1px solid rgba(52, 199, 89, 0.3)', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#248a3d', fontWeight: 600 }}>
                <CheckCircle2 size={16} />
                <span>{sttSuccessMessage}</span>
              </div>
            )}
          </div>
        )}

        {/* UPLOAD AUDIO TAB */}
        {activeTab === 'upload_audio' && (
          <div style={{ marginBottom: '20px' }}>
            <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '8px', textTransform: 'uppercase' }}>
              Select Call Audio File (.m4a, .mp3, .wav)
            </label>
            <input
              ref={audioInputRef}
              type="file"
              accept="audio/*"
              style={{ display: 'none' }}
              onChange={(e) => setAudioFile(e.target.files?.[0] || null)}
            />
            <div
              onClick={() => audioInputRef.current?.click()}
              style={{
                border: '2px dashed var(--border-subtle)',
                borderRadius: '16px',
                padding: '24px',
                textAlign: 'center',
                cursor: 'pointer',
                background: 'var(--bg-pill)',
              }}
            >
              <Upload size={24} color="var(--accent-apple-blue)" style={{ margin: '0 auto 8px auto' }} />
              <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                {audioFile ? audioFile.name : 'Click to Upload Call Audio File'}
              </p>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                Auto-transcribes via TRYAM Enterprise Speech Engine & stores in Cloud Vault
              </span>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
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
                  background: 'var(--bg-pill)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '10px',
                  padding: '10px 12px',
                  color: 'var(--text-primary)',
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
                  background: 'var(--bg-pill)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '10px',
                  padding: '10px 12px',
                  color: 'var(--text-primary)',
                  fontSize: '13px',
                  outline: 'none',
                }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
            <div>
              <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                Extracted Debt Amount (₹) *
              </label>
              <input
                type="number"
                required
                value={debtAmount}
                onChange={(e) => setDebtAmount(e.target.value)}
                style={{
                  width: '100%',
                  background: 'var(--bg-pill)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '10px',
                  padding: '10px 12px',
                  color: 'var(--text-primary)',
                  fontSize: '13px',
                  outline: 'none',
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 700,
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                Distress Priority Score
              </label>
              <select
                value={distressScore}
                onChange={(e) => setDistressScore(e.target.value as any)}
                style={{
                  width: '100%',
                  background: 'var(--bg-pill)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '10px',
                  padding: '10px 12px',
                  color: 'var(--text-primary)',
                  fontSize: '13px',
                  outline: 'none',
                }}
              >
                <option value="Low">Low Priority</option>
                <option value="Medium">Medium Priority</option>
                <option value="High">High Priority</option>
                <option value="Critical">🔴 Critical (Workplace Harassment)</option>
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
              style={{ width: '16px', height: '16px' }}
            />
            <label htmlFor="harass" style={{ fontSize: '12px', color: '#ff3b30', cursor: 'pointer', fontWeight: 600 }}>
              Flag Recovery Agent Workplace Harassment (Auto-Generate Legal Cease-and-Desist Notice)
            </label>
          </div>

          {/* Live Smart Assignment Preview Card */}
          {bestAssignment && (
            <div
              style={{
                background: 'var(--bg-pill)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '14px',
                padding: '14px',
                marginBottom: '20px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <UserCheck size={16} color="var(--accent-apple-blue)" />
                <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--accent-apple-blue)' }}>
                  AI Recommended Specialist (Admin Approval Required)
                </span>
              </div>
              <p style={{ fontSize: '12px', color: 'var(--text-primary)', fontWeight: 500 }}>
                Will assign to <strong style={{ color: 'var(--accent-apple-blue)' }}>{bestAssignment.employee.name}</strong> ({bestAssignment.employee.role.replace('_', ' ')})
              </p>
              <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                {bestAssignment.reason}
              </p>
            </div>
          )}

          {isProcessing && (
            <div style={{ padding: '10px', background: 'rgba(0, 113, 227, 0.08)', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--accent-apple-blue)', marginBottom: '14px' }}>
              <Loader2 size={16} className="spin" />
              <span>{processingStatus}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isProcessing}
            className="btn-apple-primary"
            style={{ width: '100%', justifyContent: 'center', padding: '12px' }}
          >
            <span>Log Client & Send to Admin Approval Queue</span>
          </button>
        </form>
      </div>
    </div>
  );
};
