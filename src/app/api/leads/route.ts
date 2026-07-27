import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { sendNewLeadAssignmentWhatsAppToEmployee } from '@/lib/whatsappService';

export async function GET() {
  try {
    const { data: leads, error } = await supabase.from('leads').select('*, employees(name)').order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: leads });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    let assignedEmpId = body.assigned_employee_id || body.assignedEmployeeId;
    let assignedEmp: any = null;

    // 1. If not assigned, find available employee with lowest active caseload
    if (!assignedEmpId) {
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
    } else {
      const { data: emp } = await supabase.from('employees').select('*').eq('id', assignedEmpId).single();
      assignedEmp = emp;
    }

    const payloadToInsert = {
      full_name: body.fullName || body.full_name || 'Inbound Lead',
      phone: body.phone,
      email: body.email || '',
      source: body.source || 'web_ingest',
      status: body.status || 'new',
      assigned_employee_id: assignedEmpId || null,
      total_debt_amount: Math.max(0, Math.min(Number(body.totalDebtAmount || body.total_debt_amount || 0), 999999999)),
    };

    const { data, error } = await supabase
      .from('leads')
      .upsert([payloadToInsert], { onConflict: 'phone' })
      .select();

    if (error || !data || data.length === 0) {
      return NextResponse.json({ success: false, error: error?.message || 'Failed to insert or update lead' }, { status: 500 });
    }

    const createdLead = data[0];

    // 2. Increment assigned employee active caseload
    if (assignedEmpId && assignedEmp) {
      await supabase
        .from('employees')
        .update({ active_caseload: (assignedEmp.active_caseload || 0) + 1 })
        .eq('id', assignedEmpId);

      // 3. Trigger WhatsApp notification to the assigned employee
      await sendNewLeadAssignmentWhatsAppToEmployee({
        employee: {
          id: assignedEmp.id,
          name: assignedEmp.name || 'Agent',
          phone: assignedEmp.phone || '+919876543210',
          email: assignedEmp.email || '',
        },
        lead: {
          id: createdLead.id,
          fullName: createdLead.full_name,
          phone: createdLead.phone,
          email: createdLead.email,
          totalDebtAmount: Number(createdLead.total_debt_amount || 0),
          source: createdLead.source,
        },
      });
    }

    return NextResponse.json({ success: true, data: createdLead });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
