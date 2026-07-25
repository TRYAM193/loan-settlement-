export const POSTGRES_DDL_SQL = `-- PostgreSQL Database DDL Schema for TRYAM Enterprise Loan Settlement CRM
-- Created for backend/database integration

CREATE TABLE IF NOT EXISTS employees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(50),
    role VARCHAR(50) DEFAULT 'agent', -- 'admin', 'senior_specialist', 'agent'
    active_cases INT DEFAULT 0,
    max_capacity INT DEFAULT 15,
    status VARCHAR(50) DEFAULT 'available', -- 'available', 'on_call', 'away', 'offline'
    specialization VARCHAR(255),
    total_settled_amount NUMERIC(14, 2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255),
    source VARCHAR(50) NOT NULL, -- 'google_business', 'whatsapp', 'inbound_call', 'email'
    status VARCHAR(50) DEFAULT 'new', -- 'new', 'assigned', 'in_progress', 'notice_drafted', 'settled'
    assigned_employee_id UUID REFERENCES employees(id) ON DELETE SET NULL,
    total_debt_amount NUMERIC(14, 2) DEFAULT 0.00,
    distress_score VARCHAR(20) DEFAULT 'Medium', -- 'Low', 'Medium', 'High', 'Critical'
    harassment_reported BOOLEAN DEFAULT FALSE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS lead_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
    employee_id UUID REFERENCES employees(id) ON DELETE SET NULL,
    channel VARCHAR(50) NOT NULL,
    recording_url TEXT,
    transcript TEXT,
    ai_summary TEXT,
    sentiment VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS settlements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
    lender_name VARCHAR(255) NOT NULL,
    original_amount NUMERIC(14, 2) NOT NULL,
    settlement_target NUMERIC(14, 2),
    agreed_amount NUMERIC(14, 2),
    status VARCHAR(50) DEFAULT 'notice_sent', -- 'notice_sent', 'under_review', 'bank_offer_received', 'completed'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Smart Lead Assignment Stored Procedure
CREATE OR REPLACE FUNCTION assign_lead_smart(
    p_lead_id UUID,
    p_total_debt NUMERIC
) RETURNS UUID AS $$
DECLARE
    v_emp_id UUID;
BEGIN
    -- High debt (> 1,000,000) prefers available Senior Specialist
    IF p_total_debt >= 1000000 THEN
        SELECT id INTO v_emp_id
        FROM employees
        WHERE status = 'available' AND role = 'senior_specialist'
        ORDER BY active_cases ASC
        LIMIT 1;
    END IF;

    -- Standard assignment: lowest active cases among available employees
    IF v_emp_id IS NULL THEN
        SELECT id INTO v_emp_id
        FROM employees
        WHERE status = 'available'
        ORDER BY active_cases ASC
        LIMIT 1;
    END IF;

    -- Update lead and employee active count
    IF v_emp_id IS NOT NULL THEN
        UPDATE leads SET assigned_employee_id = v_emp_id, status = 'assigned' WHERE id = p_lead_id;
        UPDATE employees SET active_cases = active_cases + 1 WHERE id = v_emp_id;
    END IF;

    RETURN v_emp_id;
END;
$$ LANGUAGE plpgsql;
`;

export const PRISMA_SCHEMA = `// prisma/schema.prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

enum Role {
  admin
  senior_specialist
  agent
}

enum Status {
  available
  on_call
  away
  offline
}

enum LeadSource {
  google_business
  whatsapp
  inbound_call
  email
  manual
}

enum LeadStatus {
  new
  assigned
  in_progress
  notice_drafted
  settled
  escalated
}

model Employee {
  id                 String     @id @default(uuid())
  name               String
  email              String     @unique
  phone              String?
  role               Role       @default(agent)
  activeCases        Int        @default(0)
  maxCapacity        Int        @default(15)
  status             Status     @default(available)
  specialization     String?
  totalSettledAmount Decimal    @default(0.00)
  leads              Lead[]
  leadLogs           LeadLog[]
  createdAt          DateTime   @default(now())
}

model Lead {
  id                 String       @id @default(uuid())
  fullName           String
  phone              String       @unique
  email              String?
  source             LeadSource
  status             LeadStatus   @default(new)
  assignedEmployeeId String?
  assignedEmployee   Employee?    @relation(fields: [assignedEmployeeId], references: [id])
  totalDebtAmount    Decimal      @default(0.00)
  distressScore      String       @default("Medium")
  harassmentReported Boolean      @default(false)
  notes              String?
  logs               LeadLog[]
  settlements        Settlement[]
  createdAt          DateTime     @default(now())
}

model LeadLog {
  id          String   @id @default(uuid())
  leadId      String
  lead        Lead     @relation(fields: [leadId], references: [id], onDelete: Cascade)
  employeeId  String?
  employee    Employee? @relation(fields: [employeeId], references: [id])
  channel     LeadSource
  recordingUrl String?
  transcript  String?
  aiSummary   String?
  sentiment   String?
  createdAt   DateTime @default(now())
}

model Settlement {
  id               String   @id @default(uuid())
  leadId           String
  lead             Lead     @relation(fields: [leadId], references: [id], onDelete: Cascade)
  lenderName       String
  originalAmount   Decimal
  settlementTarget Decimal?
  agreedAmount     Decimal?
  status           String   @default("notice_sent")
  createdAt        DateTime @default(now())
}
`;
