import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const messagesList = Array.isArray(body.messages) ? body.messages : [];
    const lastUserMsg = messagesList.filter((m: any) => m.role === 'user').pop()?.content;
    const message = body.message || lastUserMsg || '';

    const userRole = body.session?.user?.role || body.userRole || 'admin';
    const userEmployeeId = body.session?.user?.employeeId || body.userEmployeeId || '';
    const customApiKey = body.apiKey || body.customApiKey || '';

    if (!message || !message.trim()) {
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

    const allEmployees = employees || [];
    let activeLeads = leads || [];
    const activeSettlements = settlements || [];

    // STRICT DATA ISOLATION FOR EMPLOYEE ROLE
    const isEmployee = userRole !== 'admin';
    let currentEmployeeObj: any = null;

    if (isEmployee) {
      currentEmployeeObj = allEmployees.find((e: any) => e.id === userEmployeeId) || null;
      // Filter leads to ONLY those assigned to this specific employee
      activeLeads = activeLeads.filter((l: any) => l.assigned_employee_id === userEmployeeId);
    }

    const totalDebt = activeLeads.reduce((acc: number, l: any) => acc + Number(l.total_debt_amount || 0), 0);
    const availableAgents = allEmployees.filter((e: any) => e.status === 'available');

    // 2. Build Role-Aware System Context Prompt
    const systemContext = isEmployee
      ? `
YOU ARE "TRYAM CRM AI ASSISTANT" FOR SPECIALIST AGENT "${currentEmployeeObj?.name || 'Employee'}".
STRICT DATA PRIVACY MODE IS ACTIVE: You have access ONLY to this employee's assigned clients.

EMPLOYEE PORTFOLIO METRICS:
- Employee Name: ${currentEmployeeObj?.name || 'Specialist'}
- Assigned Clients Count: ${activeLeads.length}
- Total Portfolio Debt: ₹${totalDebt.toLocaleString('en-IN')}

ASSIGNED CLIENTS:
${activeLeads
  .map(
    (l: any) =>
      `• Client: ${l.full_name || 'Caller'} (${l.phone}) | Status: ${l.status} | Debt: ₹${Number(l.total_debt_amount || 0).toLocaleString('en-IN')}`
  )
  .join('\n')}

GUIDELINES:
- Answer ONLY questions regarding this employee's assigned clients and debt settlement advice.
- DO NOT reveal data about other employees or clients not assigned to this employee.
`
      : `
YOU ARE "TRYAM CRM AI ASSISTANT", AN ENTERPRISE MASTER AI BOT FOR DEBT SETTLEMENT & AGENCY MANAGEMENT.
FULL MASTER ADMIN ACCESS IS ACTIVE.

LIVE AGENCY METRICS:
- Total Ingested Leads: ${activeLeads.length}
- Total Agency Debt Portfolio: ₹${totalDebt.toLocaleString('en-IN')}
- Active Employees: ${allEmployees.length} (${availableAgents.length} Available)
- Active Settlements: ${activeSettlements.length}

EMPLOYEE WORKLOAD BREAKDOWN:
${allEmployees
  .map(
    (e: any) =>
      `• ${e.name} (${e.role}): ${e.active_caseload || 0} active cases | Status: ${e.status || 'available'}`
  )
  .join('\n')}

RECENT CLIENT LEADS:
${activeLeads
  .slice(0, 5)
  .map(
    (l: any) =>
      `• Lead: ${l.full_name || 'Inbound Caller'} (${l.phone}) | Status: ${l.status} | Debt: ₹${Number(l.total_debt_amount || 0).toLocaleString('en-IN')}`
  )
  .join('\n')}

GUIDELINES:
- Provide concise, data-driven responses based on the live agency metrics above.
`;

    const apiKey = customApiKey || process.env.GEMINI_API_KEY;

    // 3. Call Google Gemini REST API if Key is present
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
                    ...messagesList.map((h: any) => ({ text: `${(h.role || 'user').toUpperCase()}: ${h.content || ''}` })),
                    { text: `USER QUESTION: ${message}` },
                  ],
                },
              ],
            }),
          }
        );

        if (geminiRes.status === 429) {
          return NextResponse.json({
            success: true,
            reply: '⏳ **The AI API Key is currently busy due to high traffic / rate limits (Too Many Requests). Please try again after 1-2 minutes!**',
            source: 'Rate Limit Warning',
          });
        }

        if (geminiRes.status === 403 || geminiRes.status === 401) {
          console.warn(`[Gemini API Warning] Key error HTTP ${geminiRes.status}. Falling back to local CRM engine.`);
        } else if (geminiRes.ok) {
          const geminiData = await geminiRes.json();
          const replyText =
            geminiData?.candidates?.[0]?.content?.parts?.[0]?.text ||
            'I have processed your query based on your authorized CRM metrics.';
          return NextResponse.json({ success: true, reply: replyText, source: 'TRYAM Intelligence Engine' });
        }
      } catch (geminiErr: any) {
        console.error('Gemini API fetch error:', geminiErr);
      }
    }

    // 4. Role-Aware Local CRM Fallback Intelligence Engine (Guaranteed zero-downtime fallback!)
    const query = message.toLowerCase();
    let reply = '';

    if (isEmployee) {
      if (query.includes('client') || query.includes('lead') || query.includes('my') || query.includes('portfolio') || query.includes('debt')) {
        reply = `### 👤 Your Assigned Client Roster (${currentEmployeeObj?.name || 'Employee'})\n\n` +
          `You currently manage **${activeLeads.length} active client cases** with a total debt portfolio of **₹${totalDebt.toLocaleString('en-IN')}**:\n\n` +
          (activeLeads.length === 0
            ? '_No clients currently assigned to your roster._'
            : activeLeads.map((l: any) => `- **${l.full_name}** (${l.phone}): ₹${Number(l.total_debt_amount || 0).toLocaleString('en-IN')} [Status: ${l.status}]`).join('\n'));
      } else if (query.includes('rbi') || query.includes('notice') || query.includes('harassment')) {
        reply = `### 🛡️ RBI Anti-Harassment Guidelines\n\nUnder RBI Guidelines (RBI/2015-16/160):\n1. Recovery agents are strictly prohibited from contacting your clients at their workplace or outside 8 AM – 7 PM.\n2. All legal notices generated in your workspace enforce cease-and-desist representation to protect your clients.`;
      } else {
        reply = `### 🤖 TRYAM AI Assistant (Employee Mode)\n\nWelcome ${currentEmployeeObj?.name || 'Specialist'}! I am restricted to your **${activeLeads.length} assigned clients** (Total Debt: ₹${totalDebt.toLocaleString('en-IN')}).\n\nAsk me any question about your assigned clients, debt settlement tactics, or RBI rules!`;
      }
    } else {
      if (query.includes('employee') || query.includes('agent') || query.includes('team') || query.includes('workload')) {
        reply = `### 👥 Master Employee Workload & Capacity Radar\n\nWe currently have **${allEmployees.length} team members** on record:\n\n` +
          allEmployees.map((e: any) => `- **${e.name}**: ${e.active_caseload || 0} active cases (${e.status || 'available'})`).join('\n');
      } else if (query.includes('lead') || query.includes('client') || query.includes('portfolio') || query.includes('debt')) {
        reply = `### 📊 Agency Debt Portfolio & Ingested Leads Summary\n\n` +
          `- **Total Agency Leads:** ${activeLeads.length}\n` +
          `- **Total Agency Debt Volume:** ₹${totalDebt.toLocaleString('en-IN')}\n` +
          `- **Active Settlements:** ${activeSettlements.length}`;
      } else {
        reply = `### 🤖 TRYAM Master Admin AI Assistant\n\nFull Master Admin Access Active.\n\n**Snapshot:** ${activeLeads.length} total leads across ${allEmployees.length} agents (Total Debt: ₹${totalDebt.toLocaleString('en-IN')}).`;
      }
    }

    return NextResponse.json({ success: true, reply, source: 'TRYAM Local DB Intelligence' });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
