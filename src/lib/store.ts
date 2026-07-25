import { Employee, Lead, LeadLog, Settlement, UserSession, LeadSource } from './types';

export const INITIAL_EMPLOYEES: Employee[] = [
  {
    id: 'emp-101',
    name: 'Rahul Sharma',
    email: 'rahul.s@tryam.ai',
    phone: '+91 98765 43210',
    role: 'senior_specialist',
    activeCases: 4,
    maxCapacity: 15,
    status: 'available',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    specialization: 'Credit Cards & HDFC/SBI High Debt',
    totalSettledAmount: 4250000,
  },
  {
    id: 'emp-102',
    name: 'Priya Patel',
    email: 'priya.p@tryam.ai',
    phone: '+91 98765 43211',
    role: 'agent',
    activeCases: 2, // Lowest workload!
    maxCapacity: 12,
    status: 'available',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    specialization: 'Personal Loans & Anti-Harassment Notices',
    totalSettledAmount: 2100000,
  },
  {
    id: 'emp-103',
    name: 'Amit Verma',
    email: 'amit.v@tryam.ai',
    phone: '+91 98765 43212',
    role: 'agent',
    activeCases: 6,
    maxCapacity: 12,
    status: 'on_call',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    specialization: 'Fintech App Loans (Spendwiz/InstantPay)',
    totalSettledAmount: 1800000,
  },
  {
    id: 'emp-104',
    name: 'Ananya Rao',
    email: 'ananya.r@tryam.ai',
    phone: '+91 98765 43213',
    role: 'senior_specialist',
    activeCases: 3,
    maxCapacity: 15,
    status: 'available',
    avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    specialization: 'Legal Notices & Workplace Recovery Defense',
    totalSettledAmount: 5600000,
  },
];

export const INITIAL_LEADS: Lead[] = [
  {
    id: 'lead-801',
    fullName: 'Ramesh Kumar',
    phone: '+91 99887 76655',
    email: 'ramesh.k@gmail.com',
    source: 'google_business',
    status: 'assigned',
    assignedEmployeeId: 'emp-102',
    assignedEmployeeName: 'Priya Patel',
    totalDebtAmount: 450000,
    lenders: [
      { name: 'HDFC Credit Card', amount: 280000, type: 'Credit Card' },
      { name: 'SBI Personal Loan', amount: 170000, type: 'Personal Loan' },
    ],
    distressScore: 'High',
    harassmentReported: true,
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    notes: 'Client calling after seeing Google Business Profile. Recovery agents contacted workplace twice.',
  },
  {
    id: 'lead-802',
    fullName: 'Sneha Deshmukh',
    phone: '+91 98221 12345',
    email: 'sneha.d@yahoo.com',
    source: 'whatsapp',
    status: 'notice_drafted',
    assignedEmployeeId: 'emp-104',
    assignedEmployeeName: 'Ananya Rao',
    totalDebtAmount: 1250000,
    lenders: [
      { name: 'ICICI Bank Card', amount: 650000, type: 'Credit Card' },
      { name: 'Axis Bank Loan', amount: 600000, type: 'Personal Loan' },
    ],
    distressScore: 'Critical',
    harassmentReported: true,
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    notes: 'High debt client seeking 40% waiver target. Formal RBI representation letter generated.',
  },
  {
    id: 'lead-803',
    fullName: 'Vikram Singh',
    phone: '+91 97112 33445',
    email: 'vikram.singh@outfit.io',
    source: 'inbound_call',
    status: 'in_progress',
    assignedEmployeeId: 'emp-101',
    assignedEmployeeName: 'Rahul Sharma',
    totalDebtAmount: 380000,
    lenders: [
      { name: 'Kotak Mahindra', amount: 380000, type: 'Personal Loan' },
    ],
    distressScore: 'Medium',
    harassmentReported: false,
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    notes: 'Inbound call logged via Telephony Bridge. Settlement proposal submitted to lender.',
  },
];

export const INITIAL_LOGS: LeadLog[] = [
  {
    id: 'log-501',
    leadId: 'lead-801',
    leadName: 'Ramesh Kumar',
    employeeId: 'emp-102',
    channel: 'google_business',
    recordingUrl: 'https://actions.google.com/sounds/v1/ambiences/office_space.ogg',
    transcript: 'Hello, I saw your Google listing. I have 4.5 lakhs in credit card and loan debt. Recovery agents are calling my office.',
    aiSummary: 'Client requested immediate workplace harassment protection. Target 40% settlement waiver projected.',
    sentiment: 'Distressed',
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
  },
  {
    id: 'log-502',
    leadId: 'lead-802',
    leadName: 'Sneha Deshmukh',
    employeeId: 'emp-104',
    channel: 'whatsapp',
    transcript: 'Sent bank notice photo over WhatsApp: ICICI Rs 6.5L overdue for 90 days.',
    aiSummary: 'Vision OCR extracted principal, penal fees, and 90+ days default status. Generated RBI protection notice.',
    sentiment: 'Urgent',
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
  },
];

export const INITIAL_SETTLEMENTS: Settlement[] = [
  {
    id: 'set-301',
    leadId: 'lead-801',
    leadName: 'Ramesh Kumar',
    lenderName: 'HDFC Bank',
    originalAmount: 280000,
    settlementTarget: 162400, // 42% waiver
    agreedAmount: 162400,
    status: 'under_review',
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: 'set-302',
    leadId: 'lead-802',
    leadName: 'Sneha Deshmukh',
    lenderName: 'ICICI Bank',
    originalAmount: 650000,
    settlementTarget: 357500, // 45% waiver
    status: 'notice_sent',
    createdAt: new Date(Date.now() - 3600000 * 18).toISOString(),
  },
];

/**
 * Smart Lead Assignment Engine
 * Assigns lead to employee with lowest active cases, prioritizing senior specialists for high debt
 */
export function calculateBestEmployee(
  employees: Employee[],
  debtAmount: number
): { employee: Employee; reason: string } | null {
  const availableEmployees = employees.filter((e) => e.status === 'available');

  if (availableEmployees.length === 0) {
    // Fallback: pick any active employee with capacity
    const anyEmployee = [...employees].sort((a, b) => a.activeCases - b.activeCases)[0];
    return anyEmployee
      ? { employee: anyEmployee, reason: 'All agents busy/away; assigned to lowest workload' }
      : null;
  }

  // If debt > ₹10 Lakhs (1,000,000), prefer Senior Specialists
  if (debtAmount >= 1000000) {
    const seniorReps = availableEmployees.filter((e) => e.role === 'senior_specialist');
    if (seniorReps.length > 0) {
      seniorReps.sort((a, b) => a.activeCases - b.activeCases);
      return {
        employee: seniorReps[0],
        reason: `High Debt Tier (₹${(debtAmount / 100000).toFixed(1)}L) -> Routed to Senior Specialist with lowest workload (${seniorReps[0].activeCases} active cases)`,
      };
    }
  }

  // Standard Workload Balancing: Sort by active cases ascending
  availableEmployees.sort((a, b) => a.activeCases - b.activeCases);
  const selected = availableEmployees[0];
  return {
    employee: selected,
    reason: `Workload-Aware Balancing -> Assigned to ${selected.name} (${selected.activeCases} active cases, lowest among team)`,
  };
}
