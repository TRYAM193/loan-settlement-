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

  // Modals state
  const [isIngestModalOpen, setIsIngestModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');

  // User Session & Role View State ('admin' vs 'employee')
  const [session, setSession] = useState<UserSession>({
    isAuthenticated: true,
    user: {
      id: 'admin-001',
      name: 'Agency Admin Manager',
      email: 'admin@tryam.ai',
      role: 'admin',
    },
  });

  const [activeRoleView, setActiveRoleView] = useState<'admin' | 'employee'>('admin');
  const [activeEmployeeId, setActiveEmployeeId] = useState<string>('emp-001'); // Default employee (e.g. Rajesh Kumar)

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

  // Filtered Leads based on Role View
  const currentEmp = employees.find((e) => e.id === activeEmployeeId) || employees[0];

  const displayedLeads = leads.filter((lead) => {
    // Search query filter
    const matchesSearch =
      lead.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.phone.includes(searchQuery) ||
      (lead.email && lead.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
      lead.assignedEmployeeName.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    // Role View filter: If Employee View, show ONLY leads assigned to active employee
    if (activeRoleView === 'employee') {
      return lead.assignedEmployeeId === activeEmployeeId || lead.assignedEmployeeId === currentEmp?.id;
    }

    return true; // Admin view shows ALL leads
  });

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-dark)', color: 'var(--text-primary)' }}>
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
        {/* DUAL DASHBOARD ROLE VIEW SELECTOR BAR */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '16px',
            padding: '12px 20px',
            marginBottom: '24px',
          }}
        >
          {/* Left: Role View Toggle Tabs */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Dashboard Mode:
            </span>
            <button
              onClick={() => setActiveRoleView('admin')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                borderRadius: '10px',
                fontSize: '13px',
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                background: activeRoleView === 'admin' ? 'linear-gradient(135deg, #6366f1, #4f46e5)' : 'rgba(255, 255, 255, 0.05)',
                color: activeRoleView === 'admin' ? '#fff' : 'var(--text-secondary)',
                boxShadow: activeRoleView === 'admin' ? '0 4px 14px rgba(99, 102, 241, 0.4)' : 'none',
              }}
            >
              <ShieldCheck size={16} />
              <span>Admin Control Center</span>
            </button>

            <button
              onClick={() => setActiveRoleView('employee')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                borderRadius: '10px',
                fontSize: '13px',
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                background: activeRoleView === 'employee' ? 'linear-gradient(135deg, #10b981, #059669)' : 'rgba(255, 255, 255, 0.05)',
                color: activeRoleView === 'employee' ? '#fff' : 'var(--text-secondary)',
                boxShadow: activeRoleView === 'employee' ? '0 4px 14px rgba(16, 185, 129, 0.4)' : 'none',
              }}
            >
              <Briefcase size={16} />
              <span>Employee Personal Workspace</span>
            </button>
          </div>

          {/* Right: Employee Selector for Employee Workspace view */}
          {activeRoleView === 'employee' ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '12px', color: '#a7f3d0', fontWeight: 600 }}>
                Logged-in Employee:
              </span>
              <select
                value={activeEmployeeId}
                onChange={(e) => setActiveEmployeeId(e.target.value)}
                className="apple-input"
                style={{ padding: '6px 12px', fontSize: '13px', borderRadius: '8px', background: '#161927', color: '#fff', border: '1px solid rgba(52, 211, 153, 0.4)' }}
              >
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.name} ({emp.role.replace('_', ' ')}) - {emp.activeCases} active cases
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#a5b4fc' }}>
              <RefreshCw size={14} className={isLoadingDb ? 'spin' : ''} onClick={loadDatabaseData} style={{ cursor: 'pointer' }} />
              <span>Supabase DB Synced ({leads.length} Leads)</span>
            </div>
          )}
        </div>

        {/* Dynamic Header Banner */}
        <div style={{ marginBottom: '24px' }}>
          {activeRoleView === 'admin' ? (
            <div>
              <h1 style={{ fontSize: '26px', fontWeight: 800, color: '#fff' }}>
                👑 Admin Operational Control Center
              </h1>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                Global view of all agency debt portfolios, employee capacity radar, automated lead routing, and settlement notice approvals.
              </p>
            </div>
          ) : (
            <div>
              <h1 style={{ fontSize: '26px', fontWeight: 800, color: '#34d399', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span>💼 Specialist Workspace: {currentEmp?.name || 'Employee'}</span>
              </h1>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                Viewing your assigned active debt settlement caseload ({displayedLeads.length} active clients assigned to you).
              </p>
            </div>
          )}
        </div>

        {/* Global Key Metrics Overview */}
        <MetricsOverview
          leads={displayedLeads}
          employees={employees}
          settlements={settlements}
        />

        {/* Tab Navigation (Leads Directory vs Employee Staff Radar) */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: '1px solid var(--border-subtle)',
            marginBottom: '20px',
            paddingBottom: '4px',
          }}
        >
          <div style={{ display: 'flex', gap: '12px' }}>
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
              <span>
                {activeRoleView === 'admin' ? `All Agency Leads (${displayedLeads.length})` : `My Assigned Caseload (${displayedLeads.length})`}
              </span>
            </button>

            {activeRoleView === 'admin' && (
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
                <span>Employee Staff Capacity ({employees.length})</span>
              </button>
            )}
          </div>
        </div>

        {/* Main Tab Content */}
        {activeTab === 'leads' ? (
          <LeadsTable
            leads={displayedLeads}
            onSelectLead={(lead) => setSelectedLead(lead)}
          />
        ) : (
          <EmployeesView
            employees={employees}
            leads={leads}
          />
        )}
      </main>

      {/* Floating AI Admin Assistant Chatbot */}
      <AdminChatbot leads={leads} employees={employees} />

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
        onLoginSuccess={(user) => {
          setSession({
            isAuthenticated: true,
            user,
          });
          setIsAuthModalOpen(false);
        }}
      />
    </div>
  );
}
