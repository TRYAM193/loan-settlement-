import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { extractFinancialMetricsWithGemini } from '@/lib/geminiService';

/**
 * Meta WhatsApp Cloud API Webhook Ingestion API
 * GET: Handles Meta Webhook URL Verification
 * POST: Processes incoming WhatsApp Messages & converts them to Leads under source 'whatsapp'
 */

// 1. Meta Webhook URL Verification
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN || 'tryam_whatsapp_secret_token';

  if (mode === 'subscribe' && token === verifyToken) {
    console.log('[Meta WhatsApp Webhook] Verification successful!');
    return new Response(challenge || 'OK', { status: 200 });
  }

  return new Response('Verification failed', { status: 403 });
}

// 2. Incoming WhatsApp Message Ingestion
export async function POST(req: Request) {
  try {
    const body = await req.json();

    let rawFrom = '';
    let clientName = '';
    let messageText = '';
    let totalDebt = 0;

    // Check Meta WhatsApp Cloud API Webhook Payload Structure
    if (body.object === 'whatsapp_business_account' && body.entry?.[0]?.changes?.[0]?.value) {
      const value = body.entry[0].changes[0].value;
      const contact = value.contacts?.[0];
      const message = value.messages?.[0];

      if (message) {
        rawFrom = message.from || '';
        messageText = message.text?.body || message.caption || '';
        clientName = contact?.profile?.name || 'WhatsApp Client';
      }
    } else {
      // Fallback for direct JSON API test payloads or custom bot bridges
      rawFrom = body.from || body.phone || body.from_phone || '';
      clientName = body.name || body.fullName || body.full_name || 'WhatsApp Client';
      messageText = body.text || body.message || body.body || '';
      totalDebt = Number(body.total_debt || body.debt || body.totalDebtAmount || 0);
    }

    if (!rawFrom || (!messageText && totalDebt === 0)) {
      return NextResponse.json(
        { success: false, error: 'Valid WhatsApp phone number and message text or debt amount are required' },
        { status: 400 }
      );
    }

    // Format phone number cleanly (+91 XXXXX XXXXX)
    let formattedPhone = rawFrom.trim();
    if (!formattedPhone.startsWith('+')) {
      if (formattedPhone.startsWith('91') && formattedPhone.length === 12) {
        formattedPhone = '+' + formattedPhone;
      } else if (formattedPhone.length === 10) {
        formattedPhone = '+91' + formattedPhone;
      }
    }

    // Extract Financial Metrics via TRYAM AI Engine
    const apiKey = process.env.GEMINI_API_KEY || '';
    const aiResult = await extractFinancialMetricsWithGemini(messageText, apiKey);

    const extractedDebt = totalDebt > 0 ? totalDebt : (aiResult?.total_debt || 450000);
    const distressScore = aiResult?.distress_score || (extractedDebt >= 500000 ? 'Critical' : 'High');
    const harassmentFlag = aiResult?.harassment_reported ?? messageText.toLowerCase().includes('harass');

    // Pick best available specialist (lowest active caseload)
    const { data: employees } = await supabase
      .from('employees')
      .select('*')
      .eq('status', 'available')
      .order('active_caseload', { ascending: true })
      .limit(1);

    const assignedEmp = employees && employees.length > 0 ? employees[0] : null;

    const payloadToInsert = {
      full_name: clientName,
      phone: formattedPhone,
      email: `${clientName.toLowerCase().replace(/\s+/g, '.')}@whatsapp.client`,
      source: 'whatsapp',
      status: 'new',
      assigned_employee_id: assignedEmp?.id || null,
      total_debt_amount: Math.max(0, Math.min(extractedDebt, 999999999)),
    };

    const { data, error } = await supabase
      .from('leads')
      .upsert([payloadToInsert], { onConflict: 'phone' })
      .select();

    if (error || !data || data.length === 0) {
      return NextResponse.json(
        { success: false, error: error?.message || 'Failed to process WhatsApp lead' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Meta WhatsApp Inbound lead processed and synced to CRM',
      data: {
        id: data[0].id,
        full_name: data[0].full_name,
        phone: data[0].phone,
        source: data[0].source,
        status: data[0].status,
        total_debt_amount: data[0].total_debt_amount,
        assigned_employee_name: assignedEmp?.name || 'Unassigned',
      },
    });
  } catch (err: any) {
    console.error('WhatsApp Webhook Error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
