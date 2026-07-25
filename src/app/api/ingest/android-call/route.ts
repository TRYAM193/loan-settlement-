import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import OpenAI, { toFile } from 'openai';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://asednemwscdtetqwwuts.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_abUml6si1hpQxE-H2K1NNA_TxdSXSVm';
const supabase = createClient(supabaseUrl, supabaseKey);

const openai = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const callerPhone = (formData.get('caller_phone') as string) || 'Unknown Caller';
    const agentPhone = (formData.get('agent_phone') as string) || '+919876543210';
    const duration = parseInt((formData.get('duration') as string) || '0', 10);
    const audioFile = formData.get('audio') as File | null;

    console.log(`[VERCEL INGESTION] Processing call from ${callerPhone} (Duration: ${duration}s)`);

    let recordingUrl: string | null = null;
    let rawTranscript = "Audio transcript processing skipped or unavailable.";
    let aiExtraction = {
      lenders: ["Unassigned Debt"],
      total_debt: 0,
      distress_score: "Medium",
      harassment_reported: false,
      summary_bullets: ["Inbound call ingested via Android app."]
    };

    // 1. Upload audio file to Supabase Storage ('call-recordings')
    if (audioFile && audioFile.size > 0) {
      const buffer = Buffer.from(await audioFile.arrayBuffer());
      const fileName = `recordings/${Date.now()}_${callerPhone.replace(/[^0-9]/g, '')}.m4a`;

      const { data: storageData, error: storageErr } = await supabase.storage
        .from('call-recordings')
        .upload(fileName, buffer, {
          contentType: audioFile.type || 'audio/m4a',
          upsert: true
        });

      if (!storageErr) {
        const { data: publicUrlData } = supabase.storage
          .from('call-recordings')
          .getPublicUrl(fileName);
        recordingUrl = publicUrlData.publicUrl;
        console.log('[STORAGE SUCCESS] Recording stored:', recordingUrl);
      } else {
        console.warn('[STORAGE WARNING]', storageErr.message);
      }

      // 2. OpenAI Whisper STT Transcription using official OpenAI `toFile` utility
      if (openai) {
        try {
          console.log('[OPENAI STT] Transcribing via toFile utility...');
          const tempFile = await toFile(buffer, 'audio.m4a', { type: 'audio/m4a' });
          const sttRes = await openai.audio.transcriptions.create({
            file: tempFile,
            model: 'whisper-1',
            language: 'en'
          });
          rawTranscript = sttRes.text;

          // 3. GPT-4o-mini Extraction Engine
          const llmRes = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
              {
                role: 'system',
                content: `You are an expert financial analyst for a debt settlement agency.
Analyze the call transcript and extract structured data strictly in valid JSON format.
JSON Schema:
{
  "lenders": ["string"],
  "total_debt": number,
  "default_duration_months": number,
  "distress_score": "Low" | "Medium" | "High" | "Critical",
  "harassment_reported": boolean,
  "summary_bullets": ["string"]
}`
              },
              {
                role: 'user',
                content: `Call Transcript:\n"${rawTranscript}"`
              }
            ],
            response_format: { type: 'json_object' }
          });

          aiExtraction = JSON.parse(llmRes.choices[0].message.content || '{}');
        } catch (openaiErr: any) {
          console.error('[OPENAI STT ERROR]', openaiErr.message);
          rawTranscript = `Audio recorded. Transcription unavailable (${openaiErr.message})`;
        }
      }
    }

    // 4. Dynamic Lead Assignment Algorithm
    let assignedEmployeeId: string | null = null;
    const { data: existingLeads } = await supabase
      .from('leads')
      .select('id, assigned_employee_id')
      .eq('phone', callerPhone)
      .limit(1);

    if (existingLeads && existingLeads.length > 0) {
      assignedEmployeeId = existingLeads[0].assigned_employee_id;
    } else {
      const { data: employees } = await supabase
        .from('employees')
        .select('id, active_caseload')
        .eq('status', 'available')
        .order('active_caseload', { ascending: true })
        .limit(1);

      if (employees && employees.length > 0) {
        assignedEmployeeId = employees[0].id;
        await supabase
          .from('employees')
          .update({ active_caseload: (employees[0].active_caseload || 0) + 1 })
          .eq('id', employees[0].id);
      }
    }

    // 5. Database Upsert
    const { data: leadRecord } = await supabase
      .from('leads')
      .upsert({
        phone: callerPhone,
        source: 'call',
        status: 'analyzed',
        assigned_employee_id: assignedEmployeeId,
        total_debt_amount: aiExtraction.total_debt || 0,
        distress_score: (aiExtraction.distress_score || 'Medium').toLowerCase(),
        updated_at: new Date().toISOString()
      }, { onConflict: 'phone' })
      .select()
      .single();

    const leadId = leadRecord ? leadRecord.id : null;

    await supabase.from('lead_logs').insert({
      lead_id: leadId,
      employee_id: assignedEmployeeId,
      channel: 'call',
      duration_seconds: duration,
      recording_url: recordingUrl,
      raw_transcript: rawTranscript,
      ai_summary: Array.isArray(aiExtraction.summary_bullets) ? aiExtraction.summary_bullets.join(' ') : 'Call processed.',
      sentiment: aiExtraction.distress_score || 'Medium',
      lenders_mentioned: aiExtraction.lenders || []
    });

    return NextResponse.json({
      success: true,
      message: 'Call audio processed and saved to Supabase database.',
      recordingUrl,
      rawTranscript,
      aiExtraction
    });
  } catch (err: any) {
    console.error('[INGESTION ROUTE ERROR]', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
