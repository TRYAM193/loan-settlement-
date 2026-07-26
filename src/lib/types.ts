export type Role = 'admin' | 'senior_specialist' | 'agent';

export type EmployeeStatus = 'available' | 'on_call' | 'busy' | 'away' | 'offline';

export interface Employee {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: Role;
  activeCases: number;
  maxCapacity: number;
  status: EmployeeStatus;
  avatarUrl: string;
  specialization?: string;
  totalSettledAmount: number;
}

export type LeadSource = 'google_business' | 'whatsapp' | 'inbound_call' | 'email' | 'manual';

export type LeadStatus = 'new' | 'assigned' | 'in_progress' | 'notice_drafted' | 'settled' | 'escalated';

export interface Lead {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  source: LeadSource;
  status: LeadStatus;
  assignedEmployeeId: string;
  assignedEmployeeName?: string;
  totalDebtAmount: number;
  lenders: Array<{ name: string; amount: number; type: string }>;
  distressScore: 'Low' | 'Medium' | 'High' | 'Critical';
  harassmentReported: boolean;
  createdAt: string;
  notes: string;
}

export interface LeadLog {
  id: string;
  leadId: string;
  leadName: string;
  employeeId?: string;
  channel: LeadSource;
  recordingUrl?: string;
  transcript?: string;
  aiSummary: string;
  sentiment: 'Distressed' | 'Urgent' | 'Neutral' | 'Cooperative';
  createdAt: string;
}

export interface Settlement {
  id: string;
  leadId: string;
  leadName: string;
  lenderName: string;
  originalAmount: number;
  settlementTarget: number;
  agreedAmount?: number;
  status: 'notice_sent' | 'under_review' | 'bank_offer_received' | 'completed';
  createdAt: string;
}

export interface UserSession {
  isAuthenticated: boolean;
  user: {
    id: string;
    name: string;
    email: string;
    role: Role;
  } | null;
}
