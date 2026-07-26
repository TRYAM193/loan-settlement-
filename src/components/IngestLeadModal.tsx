'use client';

import React, { useState, useRef } from 'react';
import { X, Sparkles, PhoneCall, MessageSquare, Mail, Globe, UserCheck, Upload, Mic, Loader2 } from 'lucide-react';
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
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState('');
  const audioInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const numDebt = parseFloat(debtAmount) || 0;
  const bestAssignment = calculateBestEmployee(employees, numDebt);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !phone) return;

    const assignedEmp = bestAssignment ? bestAssignment.employee : employees[0];
    setIsProcessing(true);

    try {
      // If audio file is attached, use the AI STT + Extraction pipeline
      if (audioFile) {
        setProcessingStatus('Uploading audio to Supabase Storage...');
        const formData = new FormData();
        formData.append('audio', audioFile);
        formData.append('caller_phone', phone);
        formData.append('agent_phone', assignedEmp?.phone || '+919876543210');
        formData.append('duration', '0');
        formData.append('full_name', fullName);

        setProcessingStatus('Transcribing call audio with TRYAM Neural STT...');
        const res = await fetch('/api/ingest/android-call', {
          method: 'POST',
          body: formData,
        });

        setProcessingStatus('Extracting financial metrics with TRYAM Financial AI Engine...');
        const json = await res.json();
        if (json.success && json.data) {
          onAddLead(
            {
              id: json.data.id,
              fullName: json.data.full_name || fullName,
              phone: json.data.phone,
              email: json.data.email || email || `${fullName.toLowerCase().replace(/\s+/g, '.')}@client.com`,
              source: 'inbound_call',
              status: json.data.status || 'assigned',
              assignedEmployeeId: json.data.assigned_employee_id,
              assignedEmployeeName: assignedEmp ? assignedEmp.name : 'Assigned Agent',
              totalDebtAmount: Number(json.data.total_debt_amount || 0),
              lenders: [{ name: 'AI-Extracted Debt', amount: Number(json.data.total_debt_amount || numDebt), type: 'Credit Debt' }],
              distressScore: json.data.distress_score || distressScore,
              harassmentReported: json.data.harassment_reported || harassment,
              createdAt: json.data.created_at || new Date().toISOString(),
              notes: `STT Engine: ${json.sttProvider || 'TRYAM Neural STT'}. ${json.transcript ? 'Transcript: ' + json.transcript.substring(0, 100) + '...' : ''}`,
            },
            json.data.assigned_employee_id || (assignedEmp ? assignedEmp.id : '')
          );
        }
        setProcessingStatus('✅ AI Pipeline Complete!');
      } else {
        // Standard lead creation without audio
        setProcessingStatus('Creating lead and assigning to agent...');
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
        if (json.success && json.data) {
          onAddLead(
            {
              id: json.data.id,
              fullName: json.data.full_name,
              phone: json.data.phone,
              email: json.data.email,
              source: json.data.source,
              status: json.data.status,
              assignedEmployeeId: json.data.assigned_employee_id,
              assignedEmployeeName: assignedEmp ? assignedEmp.name : 'Assigned Agent',
              totalDebtAmount: Number(json.data.total_debt_amount || 0),
              lenders: [{ name: 'Primary Bank Loan / Credit Card', amount: numDebt, type: 'Credit Debt' }],
              distressScore,
              harassmentReported: harassment,
              createdAt: json.data.created_at || new Date().toISOString(),
              notes: json.data.notes,
            },
            assignedEmp ? assignedEmp.id : ''
          );
        }
      }
    } catch (err) {
      console.error('Failed to post new lead:', err);
      setProcessingStatus('❌ Error occurred. Please try again.');
    } finally {
      setTimeout(() => {
        setIsProcessing(false);
        setProcessingStatus('');
        setAudioFile(null);
        onClose();
      }, 1200);
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
          maxWidth: '560px',
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

        {/* Title */}
        <div style={{ marginBottom: '22px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={20} color="var(--accent-apple-blue)" />
            <h2 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.3px' }}>
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
                      border: isSelected ? '1px solid var(--accent-apple-blue)' : '1px solid var(--border-subtle)',
                      background: isSelected ? 'rgba(0, 113, 227, 0.1)' : 'var(--bg-pill)',
                      color: isSelected ? 'var(--accent-apple-blue)' : 'var(--text-secondary)',
                      fontSize: '11px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <IconComp size={16} color={isSelected ? 'var(--accent-apple-blue)' : 'var(--text-muted)'} />
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

          {/* Email Field */}
          <div style={{ marginBottom: '14px' }}>
            <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
              Email Address
            </label>
            <input
              type="email"
              placeholder="e.g. ramesh@gmail.com (optional)"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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

          {/* Audio Call Recording Upload */}
          <div style={{ marginBottom: '14px' }}>
            <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
              📞 Call Recording Audio (triggers AI STT + Financial Extraction)
            </label>
            <input
              type="file"
              ref={audioInputRef}
              accept="audio/*,.m4a,.mp3,.wav,.aac,.ogg,.webm"
              onChange={(e) => setAudioFile(e.target.files?.[0] || null)}
              style={{ display: 'none' }}
            />
            <button
              type="button"
              onClick={() => audioInputRef.current?.click()}
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: '12px',
                border: audioFile ? '2px solid var(--accent-apple-blue)' : '2px dashed var(--border-subtle)',
                background: audioFile ? 'rgba(0, 113, 227, 0.06)' : 'var(--bg-pill)',
                color: audioFile ? 'var(--accent-apple-blue)' : 'var(--text-muted)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                fontSize: '13px',
                fontWeight: 600,
                transition: 'all 0.2s ease',
              }}
            >
              {audioFile ? (
                <>
                  <Mic size={16} />
                  <span>{audioFile.name} ({(audioFile.size / 1024).toFixed(0)} KB)</span>
                </>
              ) : (
                <>
                  <Upload size={16} />
                  <span>Drop audio file or click to upload (.m4a, .mp3, .wav)</span>
                </>
              )}
            </button>
            {audioFile && (
              <p style={{ fontSize: '11px', color: 'var(--accent-apple-blue)', marginTop: '6px', fontWeight: 500 }}>
                🧠 Will process: TRYAM Neural STT → Financial AI Extraction → Auto-Assignment
              </p>
            )}
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
                  background: 'var(--bg-pill)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '10px',
                  padding: '10px 12px',
                  color: 'var(--text-primary)',
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
                  background: 'var(--bg-pill)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '10px',
                  padding: '10px 12px',
                  color: 'var(--text-primary)',
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
              style={{ width: '16px', height: '16px' }}
            />
            <label htmlFor="harass" style={{ fontSize: '12px', color: '#ff3b30', cursor: 'pointer' }}>
              Flag Recovery Agent Workplace Harassment (Auto-Generate Legal Notice)
            </label>
          </div>

          {/* Live Smart Assignment Card */}
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
                  Smart Engine Lead Assignment Preview
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

          {/* Processing Status Indicator */}
          {isProcessing && processingStatus && (
            <div style={{
              background: 'rgba(0, 113, 227, 0.08)',
              border: '1px solid rgba(0, 113, 227, 0.2)',
              borderRadius: '12px',
              padding: '12px 16px',
              marginBottom: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
            }}>
              <Loader2 size={16} color="var(--accent-apple-blue)" className="spin" />
              <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--accent-apple-blue)' }}>
                {processingStatus}
              </span>
            </div>
          )}

          <button
            type="submit"
            className="btn-apple-primary"
            disabled={isProcessing}
            style={{
              width: '100%',
              justifyContent: 'center',
              padding: '12px',
              opacity: isProcessing ? 0.6 : 1,
              cursor: isProcessing ? 'not-allowed' : 'pointer',
            }}
          >
            {isProcessing ? (
              <span>Processing AI Pipeline...</span>
            ) : audioFile ? (
              <span>🧠 Run AI STT Pipeline & Assign</span>
            ) : (
              <span>Log Client & Trigger Workload Assignment</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
