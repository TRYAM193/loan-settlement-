'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, MessageSquare, X, Send, Key, Bot, User, RefreshCw } from 'lucide-react';
import { Lead, Employee, Settlement, UserSession } from '../lib/types';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  source?: string;
}

interface AdminChatbotProps {
  leads?: Lead[];
  employees?: Employee[];
  settlements?: Settlement[];
  session?: UserSession;
}

const parseBoldText = (text: string) => {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} style={{ fontWeight: 700 }}>{part.slice(2, -2)}</strong>;
    }
    return part;
  });
};

const renderFormattedMessage = (content: string) => {
  const lines = content.split('\n');
  return lines.map((line, idx) => {
    // Headers
    if (line.startsWith('### ')) {
      return (
        <h4 key={idx} style={{ fontSize: '13px', fontWeight: 700, marginTop: '8px', marginBottom: '4px' }}>
          {parseBoldText(line.slice(4))}
        </h4>
      );
    }
    if (line.startsWith('## ') || line.startsWith('# ')) {
      const cleanLine = line.startsWith('## ') ? line.slice(3) : line.slice(2);
      return (
        <h3 key={idx} style={{ fontSize: '14px', fontWeight: 700, marginTop: '10px', marginBottom: '6px' }}>
          {parseBoldText(cleanLine)}
        </h3>
      );
    }

    // Lists
    if (line.trim().startsWith('- ') || line.trim().startsWith('* ') || line.trim().startsWith('• ')) {
      const cleanLine = line.trim().slice(2);
      return (
        <li key={idx} style={{ marginLeft: '12px', listStyleType: 'disc', marginBottom: '3px' }}>
          {parseBoldText(cleanLine)}
        </li>
      );
    }

    // Normal lines
    if (line.trim() === '') {
      return <div key={idx} style={{ height: '6px' }} />;
    }

    return (
      <p key={idx} style={{ margin: '2px 0' }}>
        {parseBoldText(line)}
      </p>
    );
  });
};

export const AdminChatbot: React.FC<AdminChatbotProps> = ({
  leads = [],
  employees = [],
  settlements = [],
  session,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showKeyConfig, setShowKeyConfig] = useState(false);
  const [customApiKey, setCustomApiKey] = useState('');
  const [savedKeySuccess, setSavedKeySuccess] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: `👋 Hello ${session?.user?.name || 'Manager'}! I am your **TRYAM AI Operational Copilot**. I have real-time access to your database: **${leads.length} Active Leads**, **${employees.length} Employees**, and total debt records.\n\nAsk me anything like *"Show me Vijay's cases"*, *"Which leads are flagged for harassment?"*, or *"Calculate overall portfolio debt"*!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      source: 'Database Context Synchronized',
    },
  ]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    // Reset conversation history on user or role switch to enforce data isolation
    const isEmp = session?.user?.role === 'agent';
    const empLeadsCount = leads.filter(l => l.assignedEmployeeId === (session?.user as any)?.employeeId).length;
    setMessages([
      {
        id: '1',
        role: 'assistant',
        content: isEmp
          ? `👋 Hello ${session?.user?.name || 'Specialist'}! I am your **TRYAM Specialist Copilot**. I have access to your personal assigned client portfolio (**${empLeadsCount} clients**).\n\nAsk me about your clients, settlement options, or cease-and-desist notices!`
          : `👋 Hello ${session?.user?.name || 'Manager'}! I am your **TRYAM AI Operational Copilot**. I have real-time access to your agency database: **${leads.length} Active Leads**, **${employees.length} Staff**, and total debt records.\n\nAsk me anything like *"Show me Vijay's cases"*, *"Which leads are flagged for harassment?"*, or *"Calculate overall portfolio debt"*!`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        source: 'Database Context Synchronized',
      },
    ]);
  }, [session?.user?.id, session?.user?.role, leads.length, employees.length]);

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSaveApiKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (customApiKey.trim()) {
      localStorage.setItem('tryam_custom_api_key', customApiKey.trim());
      setSavedKeySuccess(true);
      setTimeout(() => setSavedKeySuccess(false), 2000);
      setShowKeyConfig(false);
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || inputMessage;
    if (!query.trim() || isLoading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputMessage('');
    setIsLoading(true);

    try {
      const apiKeyToUse = customApiKey || localStorage.getItem('tryam_custom_api_key') || '';

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMsg].map((m) => ({ role: m.role, content: m.content })),
          apiKey: apiKeyToUse,
          session,
          leads,
          employees,
          settlements,
        }),
      });

      const json = await res.json();

      if (json.success) {
        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: json.reply,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            source: json.source || 'Database AI Engine',
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: `⚠️ ${json.error || 'Failed to process request.'}`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
      }
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: `⚠️ Connection error: ${err.message}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const quickPrompts = [
    { label: '📊 Portfolio Breakdown', query: 'Provide a breakdown of total debt and active cases per employee.' },
    { label: '🛡️ Workplace Harassment Cases', query: 'Which clients have flagged workplace recovery agent harassment?' },
    { label: '⚖️ Lowest Workload Agent', query: 'Which employee has the lowest workload for new lead assignment?' },
  ];

  return (
    <>
      {/* Floating Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: 'fixed',
          bottom: '28px',
          right: '28px',
          zIndex: 90,
          background: 'var(--accent-apple-gradient)',
          color: '#ffffff',
          border: 'none',
          borderRadius: '999px',
          padding: '12px 20px',
          boxShadow: '0 8px 24px rgba(0, 113, 227, 0.35)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontWeight: 600,
          fontSize: '13px',
          transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        <Sparkles size={18} />
        <span>TRYAM AI Copilot</span>
      </button>

      {/* Floating Chat Drawer */}
      {isOpen && (
        <div
          className="animate-fade-in"
          style={{
            position: 'fixed',
            bottom: '84px',
            right: '28px',
            zIndex: 95,
            width: '420px',
            height: '580px',
            maxWidth: 'calc(100vw - 32px)',
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '24px',
            boxShadow: 'var(--card-shadow)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            color: 'var(--text-primary)',
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '16px 20px',
              borderBottom: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'var(--bg-pill)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '10px',
                  background: 'var(--accent-apple-blue)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                }}
              >
                <Bot size={18} />
              </div>
              <div>
                <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>
                  TRYAM AI Copilot
                </h3>
                <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                  Realtime CRM & Supabase Intelligence
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '6px' }}>
              <button
                onClick={() => setShowKeyConfig(!showKeyConfig)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-muted)',
                  padding: '6px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                }}
                title="Configure API Key"
              >
                <Key size={16} />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-muted)',
                  padding: '6px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                }}
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Messages Feed */}
          <div
            style={{
              flex: 1,
              padding: '16px',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
            }}
          >
            {messages.map((m) => (
              <div
                key={m.id}
                style={{
                  display: 'flex',
                  gap: '10px',
                  justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start',
                }}
              >
                {m.role === 'assistant' && (
                  <div
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      background: 'var(--accent-apple-blue)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#fff',
                      fontSize: '12px',
                      flexShrink: 0,
                    }}
                  >
                    <Bot size={14} />
                  </div>
                )}

                <div
                  style={{
                    maxWidth: '82%',
                    background:
                      m.role === 'user'
                        ? 'var(--accent-apple-blue)'
                        : 'var(--bg-pill)',
                    border:
                      m.role === 'user' ? 'none' : '1px solid var(--border-subtle)',
                    borderRadius: '16px',
                    borderTopRightRadius: m.role === 'user' ? '4px' : '16px',
                    borderTopLeftRadius: m.role === 'assistant' ? '4px' : '16px',
                    padding: '12px 14px',
                    color: m.role === 'user' ? '#ffffff' : 'var(--text-primary)',
                    fontSize: '13px',
                    lineHeight: '1.5',
                  }}
                >
                  <div>{renderFormattedMessage(m.content)}</div>
                  <div
                    style={{
                      fontSize: '10px',
                      color: m.role === 'user' ? 'rgba(255,255,255,0.8)' : 'var(--text-muted)',
                      marginTop: '6px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <span>{m.timestamp}</span>
                    {m.source && <span style={{ color: 'var(--accent-apple-blue)' }}>{m.source}</span>}
                  </div>
                </div>

                {m.role === 'user' && (
                  <div
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      background: 'var(--bg-pill)',
                      border: '1px solid var(--border-subtle)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--text-primary)',
                      fontSize: '12px',
                      flexShrink: 0,
                    }}
                  >
                    <User size={14} />
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <div
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    background: 'var(--accent-apple-blue)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                  }}
                >
                  <RefreshCw size={14} className="spin" />
                </div>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  Analyzing live database context...
                </span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts Chips */}
          <div
            style={{
              padding: '10px 16px',
              background: 'var(--bg-pill)',
              borderBottom: '1px solid var(--border-subtle)',
              display: 'flex',
              gap: '6px',
              overflowX: 'auto',
            }}
          >
            {quickPrompts.map((p, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(p.query)}
                style={{
                  whiteSpace: 'nowrap',
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '12px',
                  padding: '4px 10px',
                  color: 'var(--text-secondary)',
                  fontSize: '11px',
                  fontWeight: 500,
                  cursor: 'pointer',
                }}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Input Footer */}
          <div
            style={{
              padding: '12px 16px',
              background: 'var(--bg-surface)',
              borderTop: '1px solid var(--border-subtle)',
              display: 'flex',
              gap: '8px',
              alignItems: 'center',
            }}
          >
            <input
              type="text"
              placeholder="Ask AI anything about your CRM, leads, or agents..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              style={{
                flex: 1,
                background: 'var(--bg-pill)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '14px',
                padding: '10px 14px',
                color: 'var(--text-primary)',
                fontSize: '13px',
                outline: 'none',
              }}
            />
            <button
              onClick={() => handleSendMessage()}
              disabled={!inputMessage.trim() || isLoading}
              className="btn-apple-primary"
              style={{
                padding: '10px 14px',
                borderRadius: '12px',
                opacity: !inputMessage.trim() || isLoading ? 0.5 : 1,
              }}
            >
              <Send size={15} />
            </button>
          </div>
        </div>
      )}
    </>
  );
};
