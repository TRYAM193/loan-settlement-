import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { sendNewLeadAssignmentWhatsAppToEmployee } from '@/lib/whatsappService';

/**
 * Telephony Webhook Ingestion API
 * Called by the Android Fleet App when a call finishes.
 * Expected Payload:
 * {
 *   phone: string,            // e.g. "+919876543210"
 *   fullName?: string,        // optional caller name
 *   duration?: number,        // duration in seconds
 *   recordingUrl?: string,    // audio file URL or Supabase storage link
 *   transcript?: string,     // speech-to-text transcript
 *   aiSummary?: string,      // AI extracted summary
 *   totalDebtAmount?: number  // optional estimated debt
 * }
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      phone,
      fullName = 'Inbound Caller',
      duration = 0,
      recordingUrl = '',
      transcript = '',
      aiSummary = 'Inbound call recorded via Android Fleet Bridge.',
      totalDebtAmount = 0,
    } = body;

    if (!phone) {
      return NextResponse.json({ success: false, error: 'Phone number is required' }, { status: 400 });
    }

    // 1. Check if lead already exists by phone number
    const { data: existingLeads } = await supabase.from('leads').select('*').eq('phone', phone).limit(1);

    let leadId: string;
    let assignedEmpId: string | null = null;
    let assignedEmp: any = null;

    if (existingLeads && existingLeads.length > 0) {
      leadId = existingLeads[0].id;
      assignedEmpId = existingLeads[0].assigned_employee_id;
      if (assignedEmpId) {
        const { data: emp } = await supabase.from('employees').select('*').eq('id', assignedEmpId).single();
        assignedEmp = emp;
      }
    } else {
      // 2. Fetch available employees to pick the one with lowest active cases
      const { data: employees } = await supabase
        .from('employees')
        .select('*')
        .eq('status', 'available')
        .order('active_caseload', { ascending: true })
        .limit(1);

      if (employees && employees.length > 0) {
        assignedEmpId = employees[0].id;
        assignedEmp = employees[0];
      }

      // Upsert lead record to prevent duplicate phone key constraint crashes
      const { data: newLead, error: leadErr } = await supabase
        .from('leads')
        .upsert(
          [
            {
              full_name: fullName,
              phone: phone,
              source: 'inbound_call',
              status: 'assigned',
              assigned_employee_id: assignedEmpId,
              total_debt_amount: totalDebtAmount,
              updated_at: new Date().toISOString(),
            },
          ],
          { onConflict: 'phone' }
        )
        .select();

      if (leadErr || !newLead || newLead.length === 0) {
        return NextResponse.json({ success: false, error: leadErr?.message || 'Failed to create lead' }, { status: 500 });
      }

      leadId = newLead[0].id;

      // Increment employee active cases if assigned
      if (assignedEmpId && assignedEmp) {
        await supabase
          .from('employees')
          .update({ active_caseload: (assignedEmp.active_caseload || 0) + 1 })
          .eq('id', assignedEmpId);
      }
    }

    // 3. Dispatch WhatsApp alert to the assigned employee with client details
    let whatsappResult = null;
    if (assignedEmp) {
      whatsappResult = await sendNewLeadAssignmentWhatsAppToEmployee({
        employee: {
          id: assignedEmp.id,
          name: assignedEmp.name || 'Agent',
          phone: assignedEmp.phone || '+919876543210',
          email: assignedEmp.email || '',
        },
        lead: {
          id: leadId,
          fullName,
          phone,
          totalDebtAmount,
          source: 'inbound_call',
        },
      });
    }

    // 4. Create lead log entry for the call
    const { data: logData, error: logErr } = await supabase
      .from('lead_logs')
      .insert([
        {
          lead_id: leadId,
          employee_id: assignedEmpId,
          channel: 'inbound_call',
          recording_url: recordingUrl,
          raw_transcript: transcript,
          ai_summary: aiSummary,
          sentiment: 'Urgent',
        },
      ])
      .select();

    if (logErr) {
      return NextResponse.json({ success: false, error: logErr.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Telephony webhook ingested & WhatsApp alert dispatched to employee',
      data: {
        leadId,
        assignedEmployeeId: assignedEmpId,
        assignedEmployee: assignedEmp ? { name: assignedEmp.name, phone: assignedEmp.phone } : null,
        whatsappResult,
        log: logData && logData.length > 0 ? logData[0] : null,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
