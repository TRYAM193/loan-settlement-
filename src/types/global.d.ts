declare namespace NodeJS {
  interface ProcessEnv {
    NEXT_PUBLIC_SUPABASE_URL?: string;
    NEXT_PUBLIC_SUPABASE_ANON_KEY?: string;
    SUPABASE_SERVICE_ROLE_KEY?: string;
    SARVAM_API_KEY?: string;
    GEMINI_API_KEY?: string;
    GROQ_API_KEY?: string;
    OPENAI_API_KEY?: string;
    WHATSAPP_PHONE_NUMBER_ID?: string;
    WHATSAPP_ACCESS_TOKEN?: string;
  }
}
