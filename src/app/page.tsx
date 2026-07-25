'use client';

import React, { useState } from 'react';
import { Navbar } from '../components/Navbar';
import { MetricsOverview } from '../components/MetricsOverview';
import { LeadsTable } from '../components/LeadsTable';
import { EmployeesView } from '../components/EmployeesView';
import { IngestLeadModal } from '../components/IngestLeadModal';
import { LeadDetailDrawer } from '../components/LeadDetailDrawer';
import { AuthModal } from '../components/AuthModal';

import {
  INITIAL_LEADS,
  INITIAL_EMPLOYEES,
  INITIAL_SETTLEMENTS,
  INITIAL_LOGS,
} from '../lib/store';
import { Lead, Employee, EmployeeStatus, UserSession } from '../lib/types';
import { Users, LayoutGrid, CheckCircle2, ShieldAlert } from 'lucide-react';

export default function Home() {
  const [leads, setLeads] = useState<Lead[]>(INITIAL_LEADS);
  const [employees, setEmployees] = useState<Employee[]>(INITIAL_EMPLOYEES);
  const [settlements] = useState(INITIAL_SETTLEMENTS);
  const [activeTab, setActiveTab] = useState<'leads' | 'employees'>('leads');

  // Modals state
  const [isIngestModalOpen, setIsIngestModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');

  // User session state
  const [session, setSession] = useState<UserSession>({
    isAuthenticated: true,
    user: {
      id: 'admin-001',
      name: 'Agency Admin Manager',
      email: 'admin@tryam.ai',
      role: 'admin',
    },
  });

  // Handle lead ingestion & auto-assignment increment
  const handleAddLead = (newLead: Lead, assignedEmpId: string) => {
    setLeads((prev) => [newLead, ...prev]);

    // Update employee active cases
    setEmployees((prev) =>
      prev.map((emp) =>
        emp.id === assignedEmpId ? { ...emp, activeCases: emp.activeCases + 1 } : emp
      )
    );
  };

  // Toggle employee status
  const handleToggleEmployeeStatus = (empId: string, newStatus: EmployeeStatus) => {
    setEmployees((prev) =>
      prev.map((e) => (e.id === empId ? { ...e, status: newStatus } : e))
    );
  };

  return (
    <div style={{ minHeight: '100vh', paddingBottom: '60px' }}>
      {/* Top Glass Navbar */}
      <Navbar
        session={session}
        onOpenIngestModal={() => setIsIngestModalOpen(true)}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onLogout={() => setSession({ isAuthenticated: false, user: null })}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      {/* Main Container */}
      <main style={{ maxWidth: '1400px', margin: '28px auto 0 auto', padding: '0 28px' }}>
        {/* KPI Metrics */}
        <MetricsOverview leads={leads} employees={employees} settlements={settlements} />

        {/* Primary View Tabs */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div className="apple-pill-nav">
            <button
              onClick={() => setActiveTab('leads')}
              className={`apple-pill-item ${activeTab === 'leads' ? 'active' : ''}`}
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <LayoutGrid size={15} />
              <span>Ingested Leads Directory ({leads.length})</span>
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

          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            Smart Auto-Assignment: <strong style={{ color: '#34d399' }}>ACTIVE</strong>
          </div>
        </div>

        {/* View Switcher */}
        {activeTab === 'leads' ? (
          <LeadsTable leads={leads} onSelectLead={setSelectedLead} searchQuery={searchQuery} />
        ) : (
          <EmployeesView employees={employees} onToggleStatus={handleToggleEmployeeStatus} />
        )}
      </main>

      {/* Modals & Drawers */}
      <IngestLeadModal
        isOpen={isIngestModalOpen}
        onClose={() => setIsIngestModalOpen(false)}
        employees={employees}
        onAddLead={handleAddLead}
      />

      <LeadDetailDrawer
        lead={selectedLead}
        onClose={() => setSelectedLead(null)}
        employees={employees}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLoginSuccess={setSession}
      />
    </div>
  );
}
