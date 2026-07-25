import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { message, history = [], customApiKey = '' } = body;

    if (!message) {
      return NextResponse.json({ success: false, error: 'Message is required' }, { status: 400 });
    }

    // 1. Fetch Live Supabase Context
    const [
      { data: employees },
      { data: leads },
      { data: settlements },
    ] = await Promise.all([
      supabase.from('employees').select('*'),
      supabase.from('leads').select('*'),
      supabase.from('settlements').select('*'),
    ]);

    const activeEmployees = employees || [];
    const activeLeads = leads || [];
    const activeSettlements = settlements || [];

    const totalDebt = activeLeads.reduce((acc: number, l: any) => acc + Number(l.total_debt_amount || 0), 0);
    const availableAgents = activeEmployees.filter((e: any) => e.status === 'available');

    // 2. Build Intelligent System Context Prompt
    const systemContext = `
YOU ARE "TRYAM CRM AI ASSISTANT", AN ENTERPRISE AI BOT FOR DEBT SETTLEMENT & LEAD MANAGEMENT.

LIVE SUPABASE DATABASE METRICS:
- Total Ingested Leads: ${activeLeads.length}
- Total Debt Portfolio: ₹${totalDebt.toLocaleString('en-IN')}
- Active Employees/Agents: ${activeEmployees.length} (${availableAgents.length} Available)
- Active Settlement Proposals: ${activeSettlements.length}

EMPLOYEE WORKLOAD BREAKDOWN:
${activeEmployees
  .map(
    (e: any) =>
      `• ${e.name} (${e.role}): ${e.active_caseload || 0} active cases | Status: ${e.status || 'available'} | Email: ${e.email || 'N/A'}`
  )
  .join('\n')}

RECENT CLIENT LEADS:
${activeLeads
  .slice(0, 5)
  .map(
    (l: any) =>
      `• Lead: ${l.full_name || 'Inbound Caller'} (${l.phone}) | Status: ${l.status} | Debt: ₹${Number(l.total_debt_amount || 0).toLocaleString('en-IN')} | Source: ${l.source}`
  )
  .join('\n')}

GUIDELINES:
- Provide concise, professional, data-driven responses based strictly on the live metrics above.
- Be helpful for debt settlement negotiation strategies, RBI compliance guidelines, and agent workload distribution.
`;

    const apiKey = customApiKey || process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;

    // 3. If Gemini API Key is provided, call Google Gemini REST API
    if (apiKey) {
      try {
        const geminiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [
                {
                  role: 'user',
                  parts: [
                    { text: systemContext },
                    ...history.map((h: any) => ({ text: `${h.role.toUpperCase()}: ${h.content}` })),
                    { text: `USER QUESTION: ${message}` },
                  ],
                },
              ],
            }),
          }
        );

        if (geminiRes.ok) {
          const geminiData = await geminiRes.json();
          const replyText =
            geminiData?.candidates?.[0]?.content?.parts?.[0]?.text ||
            'I have processed your query based on our CRM metrics.';
          return NextResponse.json({ success: true, reply: replyText, source: 'Gemini AI' });
        } else {
          console.warn('Gemini API returned error, falling back to local CRM AI engine');
        }
      } catch (geminiErr) {
        console.error('Gemini API fetch error:', geminiErr);
      }
    }

    // 4. Intelligent Context-Aware Fallback AI Engine (Works locally without API keys)
    const query = message.toLowerCase();
    let reply = '';

    if (query.includes('employee') || query.includes('agent') || query.includes('team') || query.includes('workload') || query.includes('capacity')) {
      reply = `### 👥 Employee Workload & Capacity Radar\n\nWe currently have **${activeEmployees.length} team members** on record (${availableAgents.length} currently available):\n\n` +
        activeEmployees.map((e: any) => `- **${e.name}**: ${e.active_caseload || 0} active cases (${e.status || 'available'})`).join('\n') +
        `\n\n💡 *Workload Engine Tip:* Incoming telephony leads are automatically assigned to the agent with the lowest active caseload.`;
    } else if (query.includes('lead') || query.includes('client') || query.includes('portfolio') || query.includes('debt')) {
      reply = `### 📊 Debt Portfolio & Ingested Leads Summary\n\n` +
        `- **Total Active Leads:** ${activeLeads.length}\n` +
        `- **Total Debt Portfolio:** ₹${totalDebt.toLocaleString('en-IN')}\n` +
        `- **Active Settlements:** ${activeSettlements.length}\n\n` +
        `The highest active caseloads are automatically balanced across your ${activeEmployees.length} agents.`;
    } else if (query.includes('whatsapp') || query.includes('msg') || query.includes('message') || query.includes('notify')) {
      reply = `### 💬 WhatsApp Dispatch Engine\n\nWhenever a lead is ingested or assigned to an agent, a WhatsApp notification is automatically dispatched **to the assigned employee** with the client's details (Name, Phone, Email, and Debt Portfolio).\n\nYou can also click **"Open WhatsApp"** directly inside any client's drawer to trigger manual dispatches.`;
    } else if (query.includes('rbi') || query.includes('harassment') || query.includes('legal') || query.includes('notice')) {
      reply = `### 🛡️ RBI Fair Practice & Anti-Harassment Guidelines\n\nUnder RBI Guidelines (RBI/2015-16/160):\n1. Recovery agents are strictly prohibited from contacting clients at their workplace or outside 8 AM – 7 PM.\n2. All legal notices automatically generated in our CRM enforce cease-and-desist representation.\n3. Direct all communications to the assigned TRYAM settlement specialist.`;
    } else {
      reply = `### 🤖 TRYAM CRM AI Assistant\n\nI am connected directly to your live Supabase database.\n\n**Current Live Snapshot:**\n- **Leads:** ${activeLeads.length} clients ingested\n- **Team:** ${activeEmployees.length} employees (${availableAgents.length} available)\n- **Debt Volume:** ₹${totalDebt.toLocaleString('en-IN')}\n\nHow can I assist you with lead distribution, settlement strategies, or team analytics?`;
    }

    return NextResponse.json({ success: true, reply, source: 'TRYAM Local DB Intelligence' });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
