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
import { EmployeeDashboard } from '../components/EmployeeDashboard';

import { fetchEmployees, fetchLeads, fetchSettlements } from '../lib/dataService';
import { INITIAL_LOGS } from '../lib/store';
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
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(true); // Pop-up login screen mandatory on launch
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');

  // User session state (Defaults to unauthenticated until user logs in)
  const [session, setSession] = useState<UserSession>({
    isAuthenticated: false,
    user: null,
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
  const loggedInEmpId = (session.user as any)?.employeeId;

  const displayedLeads = leads.filter((lead) => {
    // Search query filter
    const matchesSearch =
      lead.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.phone.includes(searchQuery) ||
      (lead.email && lead.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (lead.assignedEmployeeName && lead.assignedEmployeeName.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesSearch;
  });

  // Active viewing employee ID (for Employee View or Admin Inspector)
  const activeEmployeeId = isAdmin
    ? adminInspectedEmpId !== 'master'
      ? adminInspectedEmpId
      : null
    : loggedInEmpId || (employees[0] ? employees[0].id : null);

  const activeEmployeeObj = employees.find((e) => e.id === activeEmployeeId) || null;

  // Filter leads strictly for isolated employee view
  const isolatedEmployeeLeads = activeEmployeeId
    ? leads.filter((l) => l.assignedEmployeeId === activeEmployeeId)
    : [];

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
      <main style={{ maxWidth: '1400px', margin: '28px auto 0 auto', padding: '0 28px' }}>
        {/* Admin Inspector Control Bar */}
        {isAdmin && (
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '16px',
              padding: '12px 20px',
              marginBottom: '24px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '12px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <ShieldCheck size={18} color="#818cf8" />
              <span style={{ fontSize: '13px', fontWeight: 700, color: '#fff' }}>
                Admin Master View & Employee Perspective Inspector
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Viewing Dashboard As:</span>
              <select
                value={adminInspectedEmpId}
                onChange={(e) => setAdminInspectedEmpId(e.target.value)}
                className="apple-input"
                style={{ padding: '6px 12px', fontSize: '12px', borderRadius: '10px' }}
              >
                <option value="master">👑 Full Master Agency Dashboard (All Leads & Teams)</option>
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    👤 Employee Perspective: {emp.name} ({emp.activeCases} assigned leads)
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* View Switcher: Render Employee Isolated Dashboard OR Master Admin View */}
        {activeEmployeeId ? (
          <EmployeeDashboard
            currentEmployee={activeEmployeeObj}
            assignedLeads={isolatedEmployeeLeads}
            onSelectLead={setSelectedLead}
            onRefreshData={loadDatabaseData}
          />
        ) : (
          <>
            {/* Master Admin KPI Metrics */}
            <MetricsOverview leads={leads} employees={employees} settlements={settlements} />

            {/* Master Admin View Tabs */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div className="apple-pill-nav">
                <button
                  onClick={() => setActiveTab('leads')}
                  className={`apple-pill-item ${activeTab === 'leads' ? 'active' : ''}`}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <LayoutGrid size={15} />
                  <span>All Agency Leads ({leads.length})</span>
                </button>
                <button
                  onClick={() => setActiveTab('employees')}
                  className={`apple-pill-item ${activeTab === 'employees' ? 'active' : ''}`}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <Users size={15} />
                  <span>Workload & Capacity Radar ({employees.length} Team)</span>
                </button>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '12px', color: 'var(--text-muted)' }}>
                <button
                  onClick={loadDatabaseData}
                  style={{
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: '#e2e8f0',
                    borderRadius: '8px',
                    padding: '4px 10px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <RefreshCw size={12} className={isLoadingDb ? 'spin' : ''} />
                  <span>{isLoadingDb ? 'Syncing Supabase DB...' : 'Sync DB'}</span>
                </button>
                <span>
                  Supabase Real-Time: <strong style={{ color: '#34d399' }}>CONNECTED</strong>
                </span>
              </div>
            </div>

            {/* Master Admin Content */}
            {activeTab === 'leads' ? (
              <LeadsTable leads={leads} onSelectLead={setSelectedLead} searchQuery={searchQuery} />
            ) : (
              <EmployeesView employees={employees} onToggleStatus={handleToggleEmployeeStatus} />
            )}
          </>
        )}
      </main>

      {/* Lead Detail Drawer */}
      <LeadDetailDrawer
        lead={selectedLead}
        onClose={() => setSelectedLead(null)}
        employees={employees}
        onRefreshData={loadDatabaseData}
      />

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
        onLoginSuccess={(userSession) => {
          setSession(userSession);
          setIsAuthModalOpen(false);
        }}
      />

      {/* Floating AI Admin Assistant Chatbot */}
      <AdminChatbot leads={leads} employees={employees} settlements={settlements} session={session} />
    </div>
  );
}
