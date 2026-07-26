import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { formatPhoneForWhatsApp, getWhatsAppClickUrl } from '@/lib/whatsappService';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { leadId, employeeId } = body;

    if (!leadId) {
      return NextResponse.json(
        { success: false, error: 'leadId is required' },
        { status: 400 }
      );
    }

    // 1. Fetch Lead & Employee Details
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

    const empIdToUse = employeeId || lead.assigned_employee_id;
    let employeeName = 'TRYAM Specialist';
    let employeePhone = '+919876543210';

    if (empIdToUse) {
      const { data: emp } = await supabase.from('employees').select('*').eq('id', empIdToUse).single();
      if (emp) {
        employeeName = emp.name;
        employeePhone = emp.phone;

        // Decrement employee caseload
        if ((emp.active_caseload || 0) > 0) {
          await supabase
            .from('employees')
            .update({ active_caseload: emp.active_caseload - 1 })
            .eq('id', empIdToUse);
        }
      }
    }

    // 2. Update Lead Status to 'settled'
    const { data: updatedLead, error: updateErr } = await supabase
      .from('leads')
      .update({
        status: 'settled',
        updated_at: new Date().toISOString(),
      })
      .eq('id', leadId)
      .select()
      .single();

    if (updateErr) {
      return NextResponse.json(
        { success: false, error: updateErr.message },
        { status: 500 }
      );
    }

    // 3. Update active settlement records in Supabase
    await supabase
      .from('settlements')
      .update({ status: 'completed' })
      .eq('lead_id', leadId);

    // 4. Format Celebration WhatsApp Message for Happy Customer
    const celebrationMessage = `🎉 *CONGRATULATIONS FROM TRYAM AUTOMATION LOAN SETTLEMENT!*

Dear ${updatedLead.full_name || 'Valued Client'},

Your debt settlement case has been officially COMPLETED & SETTLED!

We are thrilled to help you achieve full financial freedom and debt relief.

👤 *Assigned Specialist:* ${employeeName}
📌 *Case Status:* Happy Customer (Case Completed)

Thank you for trusting TRYAM Enterprise Debt Hub!`;

    const whatsappUrl = getWhatsAppClickUrl(updatedLead.phone, celebrationMessage);
    let whatsappStatus = 'Dispatched via Central Company Master WhatsApp';

    // Dispatch via Meta Cloud API if configured
    const metaPhoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;
    const metaAccessToken = process.env.WHATSAPP_ACCESS_TOKEN;

    if (metaPhoneId && metaAccessToken) {
      try {
        const cleanRecipientPhone = formatPhoneForWhatsApp(updatedLead.phone).replace('+', '');
        const res = await fetch(
          `https://graph.facebook.com/v18.0/${metaPhoneId}/messages`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${metaAccessToken}`,
            },
            body: JSON.stringify({
              messaging_product: 'whatsapp',
              recipient_type: 'individual',
              to: cleanRecipientPhone,
              type: 'text',
              text: { body: celebrationMessage },
            }),
          }
        );

        if (res.ok) {
          whatsappStatus = 'Delivered to client via Meta Cloud API';
        }
      } catch (metaErr: any) {
        console.warn('[Meta WhatsApp Exception]', metaErr.message);
      }
    }

    // 5. Audit Log in Supabase lead_logs
    await supabase.from('lead_logs').insert([
      {
        lead_id: leadId,
        employee_id: empIdToUse,
        channel: 'whatsapp',
        ai_summary: `Case marked as SETTLED (Happy Customer). Celebration WhatsApp message sent from Main Company Number to client ${updatedLead.phone}.`,
        raw_transcript: celebrationMessage,
        sentiment: 'HappyCustomer',
      },
    ]);

    return NextResponse.json({
      success: true,
      message: `Case successfully completed & settled! Celebration WhatsApp sent to client (${whatsappStatus}).`,
      data: {
        lead: updatedLead,
        whatsappUrl,
        celebrationMessage,
      },
    });
  } catch (err: any) {
    console.error('[SETTLE ROUTE ERROR]', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
