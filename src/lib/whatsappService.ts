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
    return `+91${cleaned}`; // Default to India country prefix if 10 digits
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
 * Generates direct native WhatsApp links (wa.me & api.whatsapp.com) using your own phone numbers
 */
export function getWhatsAppClickUrl(phone: string, text: string): string {
  const cleanPhone = formatPhoneForWhatsApp(phone).replace('+', '');
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
}

/**
 * Dispatches WhatsApp notification directly via Meta WhatsApp Cloud API (or Direct Deep-linking)
 * and logs entry in Supabase lead_logs.
 */
export async function sendNewLeadAssignmentWhatsAppToEmployee(
  payload: WhatsAppNotificationPayload
): Promise<{ success: boolean; message: string; whatsappUrl: string }> {
  const { employee, lead } = payload;
  const messageText = generateEmployeeNotificationText(employee.name, lead);
  const whatsappUrl = getWhatsAppClickUrl(employee.phone, messageText);

  console.log(`[WhatsApp Direct Dispatcher] Alert generated for ${employee.name} (${employee.phone}):\n${messageText}`);

  try {
    let externalStatus = 'Direct WhatsApp Link & Local Audit Dispatched';

    // Check if Meta WhatsApp Cloud API credentials exist (using your own Meta/WhatsApp Business number)
    const metaPhoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;
    const metaAccessToken = process.env.WHATSAPP_ACCESS_TOKEN;

    if (metaPhoneId && metaAccessToken) {
      try {
        const cleanRecipientPhone = formatPhoneForWhatsApp(employee.phone).replace('+', '');
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
              text: { body: messageText },
            }),
          }
        );

        if (res.ok) {
          externalStatus = 'Delivered via Direct Meta WhatsApp Cloud API';
        } else {
          const errData = await res.json();
          console.warn('[Meta WhatsApp API Error]', errData);
          externalStatus = `Meta Direct API error: ${errData?.error?.message || 'Failed'}`;
        }
      } catch (metaErr: any) {
        console.error('[Meta WhatsApp Exception]', metaErr);
        externalStatus = `Direct API Exception: ${metaErr.message}`;
      }
    }

    // Log entry into Supabase lead_logs for full audit trail
    if (lead.id) {
      await supabase.from('lead_logs').insert([
        {
          lead_id: lead.id,
          employee_id: employee.id || null,
          channel: 'whatsapp',
          ai_summary: `Direct WhatsApp assignment alert generated for employee ${employee.name} (${employee.phone}). Status: ${externalStatus}`,
          raw_transcript: messageText,
          sentiment: 'Assigned',
        },
      ]);
    }

    return {
      success: true,
      message: `Direct WhatsApp notification ready for ${employee.name} (${externalStatus})`,
      whatsappUrl,
    };
  } catch (err: any) {
    console.error('[WhatsApp Service Error]', err);
    return {
      success: false,
      message: err.message || 'Failed to generate direct WhatsApp alert',
      whatsappUrl,
    };
  }
}
