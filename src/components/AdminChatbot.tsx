'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, MessageSquare, X, Send, Key, Bot, User, RefreshCw, ChevronDown, Check, Shield } from 'lucide-react';
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

export const AdminChatbot: React.FC<AdminChatbotProps> = ({
  leads = [],
  employees = [],
  settlements = [],
  session,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [customApiKey, setCustomApiKey] = useState('');
  const [showKeyConfig, setShowKeyConfig] = useState(false);
  const [savedKeySuccess, setSavedKeySuccess] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'init-1',
      role: 'assistant',
      content: `### 🤖 Hello Admin! I'm your TRYAM AI CRM Assistant.\n\nI have direct access to your live Supabase database. You can ask me anything about:\n- 📊 **Team Workload & Active Caseloads**\n- 💰 **Total Debt Portfolio & Settlement Stats**\n- 📲 **WhatsApp Dispatch Statuses**\n- 🛡️ **RBI Anti-Harassment Compliance**\n\nHow can I help you today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || inputMessage;
    if (!query.trim() || isLoading) return;

    const userMsg: Message = {
      id: `usr-${Date.now()}`,
      role: 'user',
      content: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputMessage('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          history: messages.map((m) => ({ role: m.role, content: m.content })),
          customApiKey: customApiKey.trim(),
          userRole: session?.user?.role || 'admin',
          userEmployeeId: session?.user?.employeeId || '',
        }),
      });

      const json = await res.json();

      const aiMsg: Message = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: json.success ? json.reply : `Sorry, I encountered an issue: ${json.error}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        source: json.source || 'TRYAM AI Engine',
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: 'assistant',
          content: `Unable to connect to AI engine: ${err.message}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveApiKey = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedKeySuccess(true);
    setTimeout(() => {
      setSavedKeySuccess(false);
      setShowKeyConfig(false);
    }, 1500);
  };

  const quickPrompts = [
    { label: '👥 Team Workload', query: 'Show me full employee workload and active caseload breakdown.' },
    { label: '💰 Debt Metrics', query: 'Summarize total debt portfolio and settlement metrics.' },
    { label: '📲 WhatsApp Status', query: 'How are WhatsApp notifications sent to employees?' },
    { label: '🛡️ RBI Rules', query: 'What are the RBI compliance guidelines for debt collection?' },
  ];

  return (
    <>
      {/* Floating Widget Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: 'fixed',
          bottom: '28px',
          right: '28px',
          zIndex: 99,
          background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
          color: '#fff',
          border: '1px solid rgba(255, 255, 255, 0.25)',
          borderRadius: '50px',
          padding: '14px 22px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          cursor: 'pointer',
          boxShadow: '0 12px 30px rgba(99, 102, 241, 0.5)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
        className="hover:scale-105"
      >
        <Sparkles size={20} className="animate-spin-slow" />
        <span style={{ fontSize: '14px', fontWeight: 700, letterSpacing: '-0.2px' }}>
          TRYAM AI Assistant
        </span>
        <span
          style={{
            background: '#34d399',
            color: '#0f172a',
            fontSize: '10px',
            fontWeight: 800,
            padding: '2px 7px',
            borderRadius: '10px',
            textTransform: 'uppercase',
          }}
        >
          Live DB
        </span>
      </button>

      {/* Chatbot Floating Dialog Window */}
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            bottom: '96px',
            right: '28px',
            zIndex: 100,
            width: '420px',
            maxWidth: 'calc(100vw - 40px)',
            height: '600px',
            maxHeight: 'calc(100vh - 120px)',
            background: 'rgba(14, 15, 23, 0.95)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            borderRadius: '24px',
            boxShadow: '0 25px 60px rgba(0, 0, 0, 0.8)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
          className="animate-fade-in"
        >
          {/* Header */}
          <div
            style={{
              padding: '16px 20px',
              background: 'linear-gradient(180deg, rgba(30, 31, 48, 0.8) 0%, rgba(14, 15, 23, 0.8) 100%)',
              borderBottom: '1px solid var(--border-subtle)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                }}
              >
                <Bot size={18} />
              </div>
              <div>
                <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#fff' }}>TRYAM CRM AI Assistant</h3>
                <p style={{ fontSize: '11px', color: '#a5b4fc' }}>
                  Connected to Supabase • Context-Aware
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <button
                onClick={() => setShowKeyConfig(!showKeyConfig)}
                title="Configure Custom AI API Key"
                style={{
                  background: customApiKey ? 'rgba(52, 211, 153, 0.15)' : 'rgba(255, 255, 255, 0.06)',
                  border: customApiKey ? '1px solid #34d399' : 'none',
                  color: customApiKey ? '#34d399' : 'var(--text-muted)',
                  padding: '6px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <Key size={15} />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                style={{
                  background: 'rgba(255, 255, 255, 0.06)',
                  border: 'none',
                  color: 'var(--text-muted)',
                  padding: '6px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Optional API Key Configuration Popover */}
          {showKeyConfig && (
            <div
              style={{
                padding: '14px 20px',
                background: 'rgba(30, 41, 59, 0.95)',
                borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
              }}
            >
              <form onSubmit={handleSaveApiKey}>
                <label style={{ fontSize: '11px', fontWeight: 600, color: '#94a3b8', display: 'block', marginBottom: '6px' }}>
                  Custom Gemini / OpenAI API Key (Optional)
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="password"
                    placeholder="Paste your API key here..."
                    value={customApiKey}
                    onChange={(e) => setCustomApiKey(e.target.value)}
                    style={{
                      flex: 1,
                      background: 'rgba(0, 0, 0, 0.4)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      borderRadius: '8px',
                      padding: '6px 10px',
                      color: '#fff',
                      fontSize: '12px',
                    }}
                  />
                  <button type="submit" className="btn-apple-primary" style={{ padding: '6px 12px', fontSize: '11px' }}>
                    {savedKeySuccess ? <Check size={14} color="#34d399" /> : 'Save'}
                  </button>
                </div>
                <p style={{ fontSize: '10px', color: '#64748b', marginTop: '4px' }}>
                  Leave empty to use built-in Supabase intelligence engine.
                </p>
              </form>
            </div>
          )}

          {/* Quick Prompts Chips */}
          <div
            style={{
              padding: '10px 16px',
              background: 'rgba(0, 0, 0, 0.2)',
              borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
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
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '12px',
                  padding: '4px 10px',
                  color: '#cbd5e1',
                  fontSize: '11px',
                  fontWeight: 500,
                  cursor: 'pointer',
                }}
              >
                {p.label}
              </button>
            ))}
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
                      background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
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
                        ? 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)'
                        : 'rgba(255, 255, 255, 0.05)',
                    border:
                      m.role === 'user' ? 'none' : '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '16px',
                    borderTopRightRadius: m.role === 'user' ? '4px' : '16px',
                    borderTopLeftRadius: m.role === 'assistant' ? '4px' : '16px',
                    padding: '12px 14px',
                    color: '#fff',
                    fontSize: '13px',
                    lineHeight: '1.5',
                  }}
                >
                  <div style={{ whiteSpace: 'pre-wrap' }}>{m.content}</div>
                  <div
                    style={{
                      fontSize: '10px',
                      color: m.role === 'user' ? 'rgba(255,255,255,0.7)' : 'var(--text-muted)',
                      marginTop: '6px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <span>{m.timestamp}</span>
                    {m.source && <span style={{ color: '#818cf8' }}>{m.source}</span>}
                  </div>
                </div>

                {m.role === 'user' && (
                  <div
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      background: 'rgba(255, 255, 255, 0.15)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#fff',
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
                    background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
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

          {/* Input Footer */}
          <div
            style={{
              padding: '12px 16px',
              background: 'rgba(0, 0, 0, 0.4)',
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
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '14px',
                padding: '10px 14px',
                color: '#fff',
                fontSize: '13px',
                outline: 'none',
              }}
            />
            <button
              onClick={() => handleSendMessage()}
              disabled={!inputMessage.trim() || isLoading}
              style={{
                background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                border: 'none',
                color: '#fff',
                width: '38px',
                height: '38px',
                borderRadius: '12px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                opacity: !inputMessage.trim() || isLoading ? 0.5 : 1,
              }}
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      )}
    </>
  );
};
