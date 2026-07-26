import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { extractFinancialMetricsWithGemini } from '@/lib/geminiService';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://asednemwscdtetqwwuts.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_abUml6si1hpQxE-H2K1NNA_TxdSXSVm';
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const callerPhone = (formData.get('caller_phone') as string) || 'Unknown Caller';
    const agentPhone = (formData.get('agent_phone') as string) || '+919876543210';
    const duration = parseInt((formData.get('duration') as string) || '0', 10);
    const audioFile = formData.get('audio') as File | null;

    console.log(`[VERCEL INGESTION] Processing call from ${callerPhone} (Duration: ${duration}s)`);

    let recordingUrl: string | null = null;
    let rawTranscript = "Audio recorded. STT pending API Key configuration.";
    let aiExtraction = {
      lenders: ["Unassigned Debt"],
      total_debt: 0,
      distress_score: "Medium",
      harassment_reported: false,
      summary_bullets: ["Inbound call ingested via Android app."]
    };

    const geminiKey = process.env.GEMINI_API_KEY;
    const sarvamKey = process.env.SARVAM_API_KEY;
    const groqKey = process.env.GROQ_API_KEY;
    const openaiKey = process.env.OPENAI_API_KEY;

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

      // 2. STT Engine (Speech-to-Text: Converts Audio Waves to Plain Raw Text Transcript)
      let sttProviderUsed = '';

      if (sarvamKey) {
        // Option 1: Sarvam AI saarika:v2.5 (Kannada, Hindi, Hinglish, Kanglish Speech STT)
        try {
          console.log('[STT] Transcribing via SARVAM AI saarika:v2.5 STT API...');
          const sarvamForm = new FormData();
          const blob = new Blob([buffer], { type: audioFile.type || 'audio/m4a' });
          sarvamForm.append('file', blob, 'recording.m4a');
          sarvamForm.append('model', 'saarika:v2.5'); // Sarvam AI flagship Kannada & Indian regional STT model
          sarvamForm.append('language_code', 'unknown'); // Auto-detect Kannada (kn-IN), Hindi, Hinglish, etc.

          const sarvamRes = await fetch('https://api.sarvam.ai/speech-to-text', {
            method: 'POST',
            headers: {
              'api-subscription-key': sarvamKey
            },
            body: sarvamForm
          });

          if (sarvamRes.ok) {
            const data = await sarvamRes.json() as { transcript: string };
            rawTranscript = data.transcript;
            sttProviderUsed = 'Sarvam AI (saarika:v2.5)';
            console.log('[SARVAM STT SUCCESS]:', rawTranscript);
          } else {
            console.error('[SARVAM STT ERROR]', sarvamRes.status, await sarvamRes.text());
          }
        } catch (sarvamErr: any) {
          console.error('[SARVAM STT EXCEPTION]', sarvamErr.message);
        }
      }

      if (!sttProviderUsed && groqKey) {
        // Option 2: Groq Free Whisper-Large-v3
        try {
          console.log('[STT] Transcribing via GROQ FREE Whisper-Large-v3 API...');
          const whisperForm = new FormData();
          const blob = new Blob([buffer], { type: audioFile.type || 'audio/m4a' });
          whisperForm.append('file', blob, 'recording.m4a');
          whisperForm.append('model', 'whisper-large-v3');

          const groqRes = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${groqKey}`
            },
            body: whisperForm
          });

          if (groqRes.ok) {
            const data = await groqRes.json() as { text: string };
            rawTranscript = data.text;
            sttProviderUsed = 'Groq Whisper-Large-v3 (FREE)';
            console.log('[GROQ STT SUCCESS]:', rawTranscript);
          } else {
            console.error('[GROQ STT ERROR]', groqRes.status, await groqRes.text());
          }
        } catch (groqErr: any) {
          console.error('[GROQ STT EXCEPTION]', groqErr.message);
        }
      }

      if (!sttProviderUsed && openaiKey) {
        // Option 3: OpenAI Fallback
        try {
          console.log('[STT] Transcribing via OpenAI Whisper API...');
          const whisperForm = new FormData();
          const blob = new Blob([buffer], { type: audioFile.type || 'audio/m4a' });
          whisperForm.append('file', blob, 'recording.m4a');
          whisperForm.append('model', 'whisper-1');

          const openaiRes = await fetch('https://api.openai.com/v1/audio/transcriptions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${openaiKey}`
            },
            body: whisperForm
          });

          if (openaiRes.ok) {
            const data = await openaiRes.json() as { text: string };
            rawTranscript = data.text;
            sttProviderUsed = 'OpenAI Whisper';
          }
        } catch (oaErr: any) {
          console.error('[OPENAI STT EXCEPTION]', oaErr.message);
        }
      }

      // 3. LLM Financial Extraction Engine (Primary: Google Gemini AI -> Fallbacks: OpenAI / Groq)
      if (rawTranscript && rawTranscript.length > 5 && !rawTranscript.includes('skipped')) {
        let extractedWithPrimary = false;

        // Primary LLM: Google Gemini AI
        if (geminiKey) {
          const geminiResult = await extractFinancialMetricsWithGemini(rawTranscript, geminiKey);
          if (geminiResult) {
            aiExtraction = { ...aiExtraction, ...geminiResult };
            extractedWithPrimary = true;
          }
        }

        // Fallback LLM: OpenAI / Groq
        if (!extractedWithPrimary) {
          try {
            const llmApiKey = openaiKey || groqKey;
            const llmEndpoint = openaiKey
              ? 'https://api.openai.com/v1/chat/completions'
              : 'https://api.groq.com/openai/v1/chat/completions';
            const llmModel = openaiKey ? 'gpt-4o-mini' : 'llama-3.3-70b-versatile';

            if (llmApiKey) {
              console.log(`[LLM FALLBACK EXTRACTION] Parsing transcript via ${llmModel}...`);
              const llmRes = await fetch(llmEndpoint, {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${llmApiKey}`,
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  model: llmModel,
                  messages: [
                    {
                      role: 'system',
                      content: `You are an expert financial auditor for a debt settlement agency.
  Analyze the call transcript (which may be in Kannada, Hindi, Hinglish, or English) and extract structured metrics strictly in valid JSON format.

  JSON Schema:
  {
    "lenders": ["string (e.g. HDFC Bank, SBI Credit, Bajaj Finance)"],
    "total_debt": number (extract numeric debt amount in INR),
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
                })
              });

              if (llmRes.ok) {
                const json = await llmRes.json() as any;
                const parsed = JSON.parse(json.choices[0]?.message?.content || '{}');
                aiExtraction = { ...aiExtraction, ...parsed };
                console.log('[LLM FALLBACK SUCCESS]:', aiExtraction);
              }
            }
          } catch (llmErr: any) {
            console.warn('[LLM FALLBACK WARN]', llmErr.message);
          }
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
