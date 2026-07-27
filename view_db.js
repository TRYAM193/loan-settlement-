const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

let supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
let supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://asednemwscdtetqwwuts.supabase.co';

try {
  const envContent = fs.readFileSync(path.join(__dirname, '.env.local'), 'utf8');
  envContent.split('\n').forEach(line => {
    if (line.startsWith('SUPABASE_SERVICE_ROLE_KEY=')) {
      supabaseKey = line.split('=')[1].trim();
    }
    if (line.startsWith('NEXT_PUBLIC_SUPABASE_URL=')) {
      supabaseUrl = line.split('=')[1].trim();
    }
  });
} catch (e) {}

const supabase = createClient(supabaseUrl, supabaseKey);

async function printLiveDatabase() {
  console.log('====================================================');
  console.log('📊 LIVE SUPABASE DATABASE TABLE VIEWER');
  console.log('====================================================\n');

  // 1. Fetch Employees Table
  const { data: emps, error: empErr } = await supabase.from('employees').select('*');
  if (empErr) {
    console.error('❌ Employees Fetch Error:', empErr.message);
  } else {
    console.log('👥 --- TABLE: public.employees ---');
    console.table(emps.map(e => ({
      ID: e.id,
      Name: e.name,
      Role: e.role,
      Phone: e.phone,
      Active_Cases: e.active_caseload || e.active_cases || 0,
      Status: e.status
    })));
  }

  // 2. Fetch Leads Table
  const { data: leads, error: leadErr } = await supabase.from('leads').select('*');
  if (leadErr) {
    console.error('\n❌ Leads Fetch Error:', leadErr.message);
  } else {
    console.log('\n📄 --- TABLE: public.leads ---');
    console.table(leads.map(l => ({
      ID: l.id,
      Full_Name: l.full_name,
      Phone: l.phone,
      Debt_Amount: `₹${Number(l.total_debt_amount || 0).toLocaleString('en-IN')}`,
      Status: l.status,
      Assigned_Rep_ID: l.assigned_employee_id,
      Source: l.source
    })));
  }

  console.log('\n====================================================');
  console.log('✅ DATABASE FETCH COMPLETED LIVE');
  console.log('====================================================\n');
}

printLiveDatabase();
