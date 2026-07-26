import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import {
  sendNewLeadAssignmentWhatsAppToEmployee,
  sendClientAssignmentNotification,
} from '@/lib/whatsappService';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { leadId, employeeId, adminApproved = true } = body;

    if (!leadId || !employeeId) {
      return NextResponse.json(
        { success: false, error: 'leadId and employeeId are required' },
        { status: 400 }
      );
    }

    // 1. Fetch Lead Details
    const { data: lead, error: leadErr } = await supabase
      .from('leads')
      .select('*')
      .eq('id', leadId)
      .single();

    if (leadErr || !lead) {
      return NextResponse.json(
        { success: false, error: leadErr?.message || 'Lead not found' },
        { status: 404 }
      );
    }

    // 2. Fetch Employee Details
    const { data: newEmployee, error: empErr } = await supabase
      .from('employees')
      .select('*')
      .eq('id', employeeId)
      .single();

    if (empErr || !newEmployee) {
      return NextResponse.json(
        { success: false, error: empErr?.message || 'Employee not found' },
        { status: 404 }
      );
    }

    // Check maximum caseload capacity
    const currentActive = newEmployee.active_caseload || newEmployee.active_cases || 0;
    const maxCapacity = newEmployee.max_capacity || 15;
    if (currentActive >= maxCapacity && lead.assigned_employee_id !== employeeId) {
      return NextResponse.json(
        { success: false, error: `Specialist ${newEmployee.name} has reached maximum caseload capacity (${currentActive}/${maxCapacity} cases).` },
        { status: 400 }
      );
    }

    const previousEmployeeId = lead.assigned_employee_id;

    // 3. Update Lead Assignment Status
    const newStatus = adminApproved ? 'assigned' : 'in_progress';
    const { data: updatedLead, error: updateLeadErr } = await supabase
      .from('leads')
      .update({
        assigned_employee_id: employeeId,
        status: newStatus,
        updated_at: new Date().toISOString(),
      })
      .eq('id', leadId)
      .select()
      .single();

    if (updateLeadErr) {
      return NextResponse.json(
        { success: false, error: updateLeadErr.message },
        { status: 500 }
      );
    }

    // 4. Update Caseload Counts
    if (previousEmployeeId && previousEmployeeId !== employeeId) {
      const { data: prevEmp } = await supabase
        .from('employees')
        .select('active_caseload')
        .eq('id', previousEmployeeId)
        .single();
      if (prevEmp && (prevEmp.active_caseload || 0) > 0) {
        await supabase
          .from('employees')
          .update({ active_caseload: prevEmp.active_caseload - 1 })
          .eq('id', previousEmployeeId);
      }
    }

    await supabase
      .from('employees')
      .update({ active_caseload: (newEmployee.active_caseload || 0) + 1 })
      .eq('id', employeeId);

    // 5. Dispatch WhatsApp notification to the Assigned Employee
    const employeeAlertResult = await sendNewLeadAssignmentWhatsAppToEmployee({
      employee: {
        id: newEmployee.id,
        name: newEmployee.name || 'Agent',
        phone: newEmployee.phone || '+919876543210',
        email: newEmployee.email || '',
      },
      lead: {
        id: updatedLead.id,
        fullName: updatedLead.full_name || 'Client',
        phone: updatedLead.phone,
        email: updatedLead.email || '',
        totalDebtAmount: Number(updatedLead.total_debt_amount || 0),
        source: updatedLead.source || 'inbound_call',
      },
    });

    // 6. CHANNEL-AWARE DISPATCH: Send Assigned Employee details (Name, Phone, Email) TO THE CLIENT
    const clientNotificationResult = await sendClientAssignmentNotification({
      employee: {
        id: newEmployee.id,
        name: newEmployee.name || 'Agent',
        phone: newEmployee.phone || '+919876543210',
        email: newEmployee.email || 'support@tryam.ai',
      },
      lead: {
        id: updatedLead.id,
        fullName: updatedLead.full_name || 'Client',
        phone: updatedLead.phone,
        email: updatedLead.email || '',
        totalDebtAmount: Number(updatedLead.total_debt_amount || 0),
        source: updatedLead.source || 'inbound_call',
      },
    });

    return NextResponse.json({
      success: true,
      message: `Lead assigned to ${newEmployee.name}. Employee alert & Client (${clientNotificationResult.channelUsed.toUpperCase()}) notification dispatched.`,
      data: {
        lead: updatedLead,
        employee: newEmployee,
        employeeAlertResult,
        clientNotificationResult,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
