'use client';

// TRYAM Automation - Autonomous Omnichannel Loan Settlement Operating System Dashboard
// Dual-Dashboard Architecture: 1. Admin Operational Control Center | 2. Employee Personal Workspace
// STT Engine: Sarvam AI saarika:v2.5 (Kannada & Regional Indian Speech STT) + Groq Whisper
import React, { useState, useEffect } from 'react';
import { Navbar } from '../components/Navbar';
import { MetricsOverview } from '../components/MetricsOverview';
import { LeadsTable } from '../components/LeadsTable';
import { EmployeesView } from '../components/EmployeesView';
import { IngestLeadModal } from '../components/IngestLeadModal';
import { LeadDetailDrawer } from '../components/LeadDetailDrawer';
import { AuthModal } from '../components/AuthModal';
import { EmployeeClientCards } from '../components/EmployeeClientCards';

import { fetchEmployees, fetchLeads, fetchSettlements } from '../lib/dataService';
import { Lead, Employee, EmployeeStatus, UserSession, Settlement } from '../lib/types';
import { supabase } from '../lib/supabase';
import { Users, LayoutGrid, RefreshCw, ShieldCheck, UserCheck, Briefcase, Lock } from 'lucide-react';
import { AdminChatbot } from '../components/AdminChatbot';

export default function Home() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [settlements, setSettlements] = useState<Settlement[]>([]);
  const [isLoadingDb, setIsLoadingDb] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'leads' | 'employees'>('leads');

  // Admin Inspector Filter (allows Admin to inspect individual employee views)
  const [adminInspectedEmpId, setAdminInspectedEmpId] = useState<string>('master');

  // Modals state
  const [isIngestModalOpen, setIsIngestModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');

  // User Session State (Admin vs Employee Login)
  const [session, setSession] = useState<UserSession>({
    isAuthenticated: true,
    user: {
      id: 'admin-001',
      name: 'Agency Admin Manager',
      email: 'admin@tryam.ai',
      role: 'admin',
    },
  });

  // Load initial data from Supabase DB
  const loadDatabaseData = async () => {
    setIsLoadingDb(true);
    try {
      const [dbEmployees, dbLeads, dbSettlements] = await Promise.all([
        fetchEmployees(),
        fetchLeads(),
        fetchSettlements(),
      ]);
      setEmployees(dbEmployees);
      setLeads(dbLeads);
      setSettlements(dbSettlements);
    } catch (err) {
      console.error('Failed loading Supabase data:', err);
    } finally {
      setIsLoadingDb(false);
    }
  };

  useEffect(() => {
    loadDatabaseData();

    // Subscribe to Supabase Realtime changes for Live Dashboard Popups
    const channel = supabase
      .channel('tryam_db_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'leads' },
        () => loadDatabaseData()
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'employees' },
        () => loadDatabaseData()
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'settlements' },
        () => loadDatabaseData()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Handle manual lead ingestion & auto-assignment increment
  const handleAddLead = (newLead: Lead, assignedEmpId: string) => {
    setLeads((prev) => [newLead, ...prev]);

    setEmployees((prev) =>
      prev.map((emp): Employee => {
        if (emp.id === assignedEmpId) {
          const newActiveCases = emp.activeCases + 1;
          const newStatus: EmployeeStatus = newActiveCases >= emp.maxCapacity ? 'busy' : emp.status;
          return {
            ...emp,
            activeCases: newActiveCases,
            status: newStatus,
          };
        }
        return emp;
      })
    );
  };

  // Toggle employee status
  const handleToggleEmployeeStatus = (empId: string, newStatus: EmployeeStatus) => {
    setEmployees((prev) =>
      prev.map((e) => (e.id === empId ? { ...e, status: newStatus } : e))
    );
  };

  // Determine current viewing mode
  const isAdmin = session.user?.role === 'admin';
  const loggedInEmpId = (session.user as any)?.employeeId || 'emp-101';

  // Active viewing employee ID (for Employee View or Admin Inspector)
  const activeEmployeeId = isAdmin
    ? adminInspectedEmpId !== 'master'
      ? adminInspectedEmpId
      : null
    : loggedInEmpId;

  const activeEmployeeObj = employees.find((e) => e.id === activeEmployeeId) || null;

  // Filter leads strictly for isolated employee view
  const isolatedEmployeeLeads = activeEmployeeId
    ? leads.filter((l) => l.assignedEmployeeId === activeEmployeeId)
    : [];

  const displayedLeads = leads.filter((lead) => {
    const matchesSearch =
      lead.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.phone.includes(searchQuery) ||
      (lead.email && lead.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (lead.assignedEmployeeName && lead.assignedEmployeeName.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesSearch;
  });

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-dark)', color: 'var(--text-primary)', paddingBottom: '60px' }}>
      {/* Top Navbar */}
      <Navbar
        session={session}
        onOpenIngestModal={() => setIsIngestModalOpen(true)}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onLogout={() =>
          setSession({
            isAuthenticated: false,
            user: null,
          })
        }
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      {/* Main Container */}
      <main style={{ maxWidth: '1400px', margin: '0 auto', padding: '24px 28px' }}>
        {/* ROLE VIEW SELECTION BAR */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '16px',
            padding: '14px 20px',
            marginBottom: '24px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Active Login Session:
            </span>
            <span
              style={{
                fontSize: '13px',
                fontWeight: 700,
                padding: '4px 12px',
                borderRadius: '8px',
                background: isAdmin ? 'rgba(99, 102, 241, 0.2)' : 'rgba(52, 211, 153, 0.2)',
                color: isAdmin ? '#a5b4fc' : '#34d399',
                border: isAdmin ? '1px solid rgba(99, 102, 241, 0.4)' : '1px solid rgba(52, 211, 153, 0.4)',
              }}
            >
              {isAdmin ? '👑 Agency Admin Dashboard' : `💼 Specialist Workspace: ${session.user?.name}`}
            </span>
          </div>

          {/* Admin Inspector Dropdown */}
          {isAdmin ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '12px', color: '#a5b4fc', fontWeight: 600 }}>
                Inspect Employee Caseload:
              </span>
              <select
                value={adminInspectedEmpId}
                onChange={(e) => setAdminInspectedEmpId(e.target.value)}
                className="apple-input"
                style={{ padding: '6px 12px', fontSize: '12px', borderRadius: '8px', background: '#161927', color: '#fff' }}
              >
                <option value="master">All Employees (Global Agency Master)</option>
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.name} ({emp.activeCases} active cases)
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#34d399' }}>
              <RefreshCw size={14} className={isLoadingDb ? 'spin' : ''} onClick={loadDatabaseData} style={{ cursor: 'pointer' }} />
              <span>Personal Caseload Synced ({isolatedEmployeeLeads.length} Clients)</span>
            </div>
          )}
        </div>

        {/* ADMIN DASHBOARD VIEW */}
        {isAdmin ? (
          <div>
            <div style={{ marginBottom: '24px' }}>
              <h1 style={{ fontSize: '26px', fontWeight: 800, color: '#fff' }}>
                👑 Admin Operational Control Center
              </h1>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                Global overview of all incoming leads, employee capacity radar, automated lead assignment, and AI chatbot assistant.
              </p>
            </div>

            {/* Metrics Overview */}
            <MetricsOverview
              leads={displayedLeads}
              employees={employees}
              settlements={settlements}
            />

            {/* Tab Navigation */}
            <div
              style={{
                display: 'flex',
                gap: '12px',
                borderBottom: '1px solid var(--border-subtle)',
                marginBottom: '20px',
                paddingBottom: '4px',
              }}
            >
              <button
                onClick={() => setActiveTab('leads')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 16px',
                  background: 'transparent',
                  border: 'none',
                  borderBottom: activeTab === 'leads' ? '2px solid var(--accent-primary)' : '2px solid transparent',
                  color: activeTab === 'leads' ? '#fff' : 'var(--text-muted)',
                  fontWeight: activeTab === 'leads' ? 700 : 500,
                  fontSize: '14px',
                  cursor: 'pointer',
                }}
              >
                <LayoutGrid size={16} />
                <span>All Agency Leads ({displayedLeads.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('employees')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 16px',
                  background: 'transparent',
                  border: 'none',
                  borderBottom: activeTab === 'employees' ? '2px solid var(--accent-primary)' : '2px solid transparent',
                  color: activeTab === 'employees' ? '#fff' : 'var(--text-muted)',
                  fontWeight: activeTab === 'employees' ? 700 : 500,
                  fontSize: '14px',
                  cursor: 'pointer',
                }}
              >
                <Users size={16} />
                <span>Employee Staff Capacity & Status ({employees.length})</span>
              </button>
            </div>

            {/* Admin Table or Employee View */}
            {activeTab === 'leads' ? (
              <LeadsTable
                leads={displayedLeads}
                onSelectLead={(lead) => setSelectedLead(lead)}
                searchQuery={searchQuery}
              />
            ) : (
              <EmployeesView
                employees={employees}
                onToggleStatus={handleToggleEmployeeStatus}
              />
            )}

            {/* Admin AI Chatbot Assistant */}
            <AdminChatbot leads={leads} employees={employees} />

            {/* Admin Lead Drawer with Full Reassignment & Alert Controls */}
            <LeadDetailDrawer
              lead={selectedLead}
              onClose={() => setSelectedLead(null)}
              employees={employees}
              onRefreshData={loadDatabaseData}
            />
          </div>
        ) : (
          /* EMPLOYEE PERSONAL WORKSPACE VIEW */
          <div>
            <div style={{ marginBottom: '24px' }}>
              <h1 style={{ fontSize: '26px', fontWeight: 800, color: '#34d399', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span>💼 My Assigned Client Caseload: {session.user?.name}</span>
              </h1>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                Interactive cards of clients assigned specifically to you. Click any client card to open details, parse bank notices with Gemini Vision OCR, and mark cases finished!
              </p>
            </div>

            {/* Metrics Overview for Employee */}
            <MetricsOverview
              leads={isolatedEmployeeLeads}
              employees={employees}
              settlements={settlements}
            />

            {/* INTERACTIVE EMPLOYEE CLIENT CARDS & CENTER MODAL */}
            <EmployeeClientCards
              leads={isolatedEmployeeLeads}
              employee={activeEmployeeObj || (employees[0] || null)}
              onRefreshData={loadDatabaseData}
            />
          </div>
        )}
      </main>

      {/* Manual Ingest Lead Modal */}
      <IngestLeadModal
        isOpen={isIngestModalOpen}
        onClose={() => setIsIngestModalOpen(false)}
        employees={employees}
        onAddLead={handleAddLead}
      />

      {/* Authentication Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLoginSuccess={(s) => {
          setSession(s);
          setIsAuthModalOpen(false);
        }}
      />
    </div>
  );
}
