/**
 * TRYAM Automation — Google Gemini AI Integration Service
 * Model: gemini-2.5-flash / gemini-1.5-pro
 * Handles structured financial JSON extraction from call transcripts & Bank Notice Vision OCR.
 */

export interface FinancialExtractionResult {
  lenders: string[];
  total_debt: number;
  default_duration_months: number;
  distress_score: 'Low' | 'Medium' | 'High' | 'Critical';
  harassment_reported: boolean;
  summary_bullets: string[];
}

export interface BankNoticeOCRResult {
  lender_name: string;
  account_number: string;
  original_principal: number;
  penalties_and_interest: number;
  target_settlement_amount: number;
  summary: string;
}

/**
 * Extract structured financial JSON metrics from transcript using Google Gemini AI
 */
export async function extractFinancialMetricsWithGemini(
  rawTranscript: string,
  geminiApiKey: string
): Promise<FinancialExtractionResult | null> {
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`;

  const prompt = `You are an expert financial auditor for a debt settlement agency.
Analyze the call transcript (which may be in Kannada, Hindi, Hinglish, or English) and extract structured metrics strictly in valid JSON format matching the schema.

JSON Schema:
{
  "lenders": ["string (e.g. HDFC Bank, SBI Credit, Bajaj Finance)"],
  "total_debt": number (extract numeric total debt amount in INR),
  "default_duration_months": number,
  "distress_score": "Low" | "Medium" | "High" | "Critical",
  "harassment_reported": boolean,
  "summary_bullets": ["string"]
}

Call Transcript:
"${rawTranscript}"`;

  try {
    console.log('[GEMINI LLM] Dispatching prompt to Gemini 2.5 Flash...');
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.1,
        },
      }),
    });

    if (res.ok) {
      const data = await res.json();
      const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
      const parsed = JSON.parse(rawText) as FinancialExtractionResult;
      console.log('[GEMINI LLM SUCCESS]:', parsed);
      return parsed;
    } else {
      console.error('[GEMINI LLM ERROR]', res.status, await res.text());
    }
  } catch (err: any) {
    console.error('[GEMINI LLM EXCEPTION]', err.message);
  }
  return null;
}

/**
 * Analyze Bank Notice image using Google Gemini 2.5 Flash Vision capabilities
 */
export async function analyzeBankNoticeWithGemini(
  base64Image: string,
  mimeType: string,
  geminiApiKey: string
): Promise<BankNoticeOCRResult | null> {
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`;

  const prompt = `You are an expert OCR financial auditor.
Analyze the uploaded document image (Bank Notice, Credit Card Statement, Legal Demand Letter).
Extract structured financial details strictly in valid JSON format matching the schema.

JSON Schema:
{
  "lender_name": "string (e.g. HDFC Bank, ICICI Bank, SBI Credit)",
  "account_number": "string (e.g. XXXX-XXXX-1234)",
  "original_principal": number,
  "penalties_and_interest": number,
  "target_settlement_amount": number (calculate 35-45% of principal),
  "summary": "string (short description of notice)"
}`;

  // Strip prefix if present
  const cleanBase64 = base64Image.includes(',') ? base64Image.split(',')[1] : base64Image;

  try {
    console.log('[GEMINI VISION OCR] Dispatching bank notice image to Gemini 2.5 Flash Vision...');
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: prompt },
              {
                inline_data: {
                  mime_type: mimeType || 'image/jpeg',
                  data: cleanBase64,
                },
              },
            ],
          },
        ],
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.1,
        },
      }),
    });

    if (res.ok) {
      const data = await res.json();
      const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
      const parsed = JSON.parse(rawText) as BankNoticeOCRResult;
      console.log('[GEMINI VISION OCR SUCCESS]:', parsed);
      return parsed;
    } else {
      console.error('[GEMINI VISION ERROR]', res.status, await res.text());
    }
  } catch (err: any) {
    console.error('[GEMINI VISION EXCEPTION]', err.message);
  }
  return null;
}
