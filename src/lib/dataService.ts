import { supabase } from './supabase';
import { Employee, Lead, Settlement, LeadLog } from './types';
import { INITIAL_EMPLOYEES, INITIAL_LEADS, INITIAL_SETTLEMENTS, INITIAL_LOGS } from './store';

/**
 * Fetch Employees from Supabase Database
 */
export async function fetchEmployees(): Promise<Employee[]> {
  try {
    const { data, error } = await supabase
      .from('employees')
      .select('*');

    if (error || !data || data.length === 0) {
      console.warn('Using fallback initial employees (Supabase error or empty table):', error?.message);
      return INITIAL_EMPLOYEES;
    }

    return data.map((emp: any) => ({
      id: emp.id,
      name: emp.name || 'Unknown Agent',
      email: emp.email || '',
      phone: emp.phone || '',
      role: emp.role || 'agent',
      activeCases: emp.active_caseload ?? emp.active_cases ?? 0,
      maxCapacity: 15,
      status: emp.status || 'available',
      avatarUrl: emp.avatar_url || `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80`,
      specialization: emp.specialization || 'General Loan Settlement',
      totalSettledAmount: emp.total_settled_amount || 0
    }));
  } catch (err) {
    console.error('Error fetching employees from Supabase:', err);
    return INITIAL_EMPLOYEES;
  }
}

/**
 * Fetch Leads from Supabase Database
 */
export async function fetchLeads(): Promise<Lead[]> {
  try {
    const { data, error } = await supabase
      .from('leads')
      .select('*, employees(id, name)');

    if (error || !data || data.length === 0) {
      console.warn('Using fallback initial leads (Supabase error or empty table):', error?.message);
      return INITIAL_LEADS;
    }

    return data.map((lead: any) => ({
      id: lead.id,
      fullName: lead.full_name || lead.phone || 'Inbound Lead',
      phone: lead.phone,
      email: lead.email || '',
      source: lead.source || 'inbound_call',
      status: lead.status || 'new',
      assignedEmployeeId: lead.assigned_employee_id || '',
      assignedEmployeeName: lead.employees?.name || 'Unassigned',
      totalDebtAmount: Number(lead.total_debt_amount || 0),
      lenders: lead.lenders || [],
      distressScore: (lead.distress_score ? lead.distress_score.charAt(0).toUpperCase() + lead.distress_score.slice(1) : 'Medium') as any,
      harassmentReported: !!lead.harassment_reported,
      createdAt: lead.created_at || new Date().toISOString(),
      notes: lead.notes || 'Ingested automatically via channel.'
    }));
  } catch (err) {
    console.error('Error fetching leads from Supabase:', err);
    return INITIAL_LEADS;
  }
}

/**
 * Fetch Settlements from Supabase Database
 */
export async function fetchSettlements(): Promise<Settlement[]> {
  try {
    const { data, error } = await supabase
      .from('settlements')
      .select('*, leads(full_name)');

    if (error || !data || data.length === 0) {
      return INITIAL_SETTLEMENTS;
    }

    return data.map((s: any) => ({
      id: s.id,
      leadId: s.lead_id,
      leadName: s.leads?.full_name || 'Client',
      lenderName: s.lender_name,
      originalAmount: Number(s.original_principal || 0),
      settlementTarget: Number(s.target_settlement_amount || 0),
      agreedAmount: s.agreed_settlement_amount ? Number(s.agreed_settlement_amount) : undefined,
      status: s.status || 'notice_sent',
      createdAt: s.created_at || new Date().toISOString()
    }));
  } catch (err) {
    console.error('Error fetching settlements from Supabase:', err);
    return INITIAL_SETTLEMENTS;
  }
}
