import { supabase } from './supabase';

export interface WhatsAppNotificationPayload {
  employee: {
    id?: string;
    name: string;
    phone: string;
    email?: string;
  };
  lead: {
    id?: string;
    fullName: string;
    phone: string;
    email?: string;
    totalDebtAmount?: number;
    source?: string;
    notes?: string;
  };
}

/**
 * Clean phone number for WhatsApp URLs/APIs (removes spaces, dashes, keeps + and digits)
 */
export function formatPhoneForWhatsApp(phone: string): string {
  if (!phone) return '';
  const cleaned = phone.replace(/[^0-9+]/g, '');
  if (!cleaned.startsWith('+') && cleaned.length === 10) {
    return `+91${cleaned}`; // Default to India prefix if 10 digits
  }
  return cleaned;
}

/**
 * Format the exact WhatsApp notification text sent TO the employee
 */
export function generateEmployeeNotificationText(
  employeeName: string,
  lead: WhatsAppNotificationPayload['lead']
): string {
  const debtFormatted = (lead.totalDebtAmount || 0).toLocaleString('en-IN');
  return `🚨 *NEW CLIENT ASSIGNED TO YOU!*

Hi ${employeeName}, a new debt settlement client has been assigned to your caseload:

👤 *Client Name:* ${lead.fullName}
📞 *Client Phone:* ${lead.phone}
✉️ *Client Email:* ${lead.email || 'N/A'}
💰 *Debt Portfolio:* ₹${debtFormatted}
📌 *Source:* ${lead.source || 'Inbound Call'}

Please contact this client as soon as possible to review their settlement case.`;
}

/**
 * Generates a direct whatsapp:// or https://wa.me/ link for quick click-to-chat
 */
export function getWhatsAppClickUrl(phone: string, text: string): string {
  const cleanPhone = formatPhoneForWhatsApp(phone).replace('+', '');
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
}

/**
 * Dispatches WhatsApp notification to employee and logs entry in Supabase lead_logs
 */
export async function sendNewLeadAssignmentWhatsAppToEmployee(
  payload: WhatsAppNotificationPayload
): Promise<{ success: boolean; message: string; whatsappUrl: string }> {
  const { employee, lead } = payload;
  const messageText = generateEmployeeNotificationText(employee.name, lead);
  const whatsappUrl = getWhatsAppClickUrl(employee.phone, messageText);

  console.log(`[WhatsApp Dispatcher] Sending alert to Employee ${employee.name} (${employee.phone}):\n${messageText}`);

  try {
    // 1. Check if external Twilio / WhatsApp credentials exist
    const twilioAccountSid = process.env.TWILIO_ACCOUNT_SID;
    const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN;
    const twilioFromNumber = process.env.TWILIO_WHATSAPP_NUMBER || 'whatsapp:+14155238886';

    let externalStatus = 'Simulated Local Dispatch';

    if (twilioAccountSid && twilioAuthToken) {
      try {
        const toPhone = `whatsapp:${formatPhoneForWhatsApp(employee.phone)}`;
        const authHeader = 'Basic ' + Buffer.from(`${twilioAccountSid}:${twilioAuthToken}`).toString('base64');
        
        const bodyParams = new URLSearchParams({
          From: twilioFromNumber,
          To: toPhone,
          Body: messageText,
        });

        const res = await fetch(
          `https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Messages.json`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
              Authorization: authHeader,
            },
            body: bodyParams.toString(),
          }
        );

        if (res.ok) {
          externalStatus = 'Delivered via Twilio API';
        } else {
          const errData = await res.json();
          console.warn('[WhatsApp Twilio Error]', errData);
          externalStatus = `Twilio Failed: ${errData.message || 'API error'}`;
        }
      } catch (twErr: any) {
        console.error('[WhatsApp API Exception]', twErr);
        externalStatus = `API Exception: ${twErr.message}`;
      }
    }

    // 2. Log entry into Supabase lead_logs for full audit trail
    if (lead.id) {
      await supabase.from('lead_logs').insert([
        {
          lead_id: lead.id,
          employee_id: employee.id || null,
          channel: 'whatsapp',
          ai_summary: `WhatsApp assignment alert dispatched to employee ${employee.name} (${employee.phone}). Status: ${externalStatus}`,
          raw_transcript: messageText,
          sentiment: 'Assigned',
        },
      ]);
    }

    return {
      success: true,
      message: `WhatsApp notification ready for ${employee.name} (${externalStatus})`,
      whatsappUrl,
    };
  } catch (err: any) {
    console.error('[WhatsApp Service Error]', err);
    return {
      success: false,
      message: err.message || 'Failed to dispatch WhatsApp alert',
      whatsappUrl,
    };
  }
}
