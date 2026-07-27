import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

/**
 * Email Parser Webhook Ingestion API
 * Receives incoming email payloads from SendGrid / Postmark / Zapier / IMAP bridge.
 * Payload:
 * {
 *   email: string,           // e.g. "client@domain.com"
 *   fullName: string,        // e.g. "Ramesh Kumar"
 *   phone?: string,          // e.g. "+91 98765 43210"
 *   subject?: string,        // email subject line
 *   emailBody?: string,      // raw or parsed email text
 *   totalDebtAmount?: number // extracted debt figure
 * }
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      email,
      fullName = 'Email Inquirer',
      phone = '',
      subject = 'Loan Settlement Query',
      emailBody = '',
      totalDebtAmount = 0,
    } = body;

    if (!email) {
      return NextResponse.json({ success: false, error: 'Email address is required' }, { status: 400 });
    }

    // 1. Find existing lead by email or phone
    const { data: existingLeads } = await supabase.from('leads').select('*').eq('email', email).limit(1);

    let leadId: string | null = null;
    let assignedEmpId: string | null = null;

    if (existingLeads && existingLeads.length > 0) {
      leadId = existingLeads[0].id;
      assignedEmpId = existingLeads[0].assigned_employee_id;
    } else {
      // 2. Workload balancing: find available employee with lowest active cases
      const { data: employees } = await supabase
        .from('employees')
        .select('*')
        .eq('status', 'available')
        .order('active_caseload', { ascending: true })
        .limit(1);

      if (employees && employees.length > 0) {
        assignedEmpId = employees[0].id;
      }

      // Create lead record cleanly
      const { data: newLead, error: leadErr } = await supabase
        .from('leads')
        .insert([
          {
            full_name: fullName,
            email: email,
            phone: phone || `+91900${Math.floor(1000000 + Math.random() * 9000000)}`,
            source: 'email',
            status: 'assigned',
            assigned_employee_id: assignedEmpId,
            total_debt_amount: totalDebtAmount,
          },
        ])
        .select();

      if (leadErr || !newLead || newLead.length === 0) {
        return NextResponse.json({ success: false, error: leadErr?.message || 'Failed to create lead' }, { status: 500 });
      }

      leadId = newLead[0].id;

      // Update employee workload
      if (assignedEmpId && employees && employees.length > 0) {
        const currentCaseload = employees[0].active_caseload ?? employees[0].active_cases ?? 0;
        await supabase
          .from('employees')
          .update({ active_caseload: currentCaseload + 1 })
          .eq('id', assignedEmpId);
      }
    }

    // 3. Log email in lead_logs
    const { data: logData, error: logErr } = await supabase
      .from('lead_logs')
      .insert([
        {
          lead_id: leadId,
          employee_id: assignedEmpId,
          channel: 'email',
          raw_transcript: `Subject: ${subject}\n\n${emailBody}`,
          ai_summary: `Parsed inbound email regarding: ${subject}`,
          sentiment: 'Neutral',
        },
      ])
      .select();

    if (logErr) {
      return NextResponse.json({ success: false, error: logErr.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Email inquiry ingested & lead assigned successfully',
      data: {
        leadId,
        assignedEmployeeId: assignedEmpId,
        log: logData[0],
      },
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
