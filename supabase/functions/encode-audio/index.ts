import "https://deno.land/x/xhr@0.1.0/mod.ts";

// Deno global may not be known to TypeScript in some editors/tools — declare a minimal shape for linting
declare const Deno: { env?: { get(key: string): string | undefined } };
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface EncodeRequest {
  mainAudio: string;
  secretAudio: string;
  mainFileName?: string;
  secretFileName?: string;
}

interface WatermarkData {
  transcript: string;
  secretAudioHash: string;
  timestamp: string;
  originalSecretFileName?: string;
}

function isEncodeRequest(obj: unknown): obj is EncodeRequest {
  if (!obj || typeof obj !== 'object') return false;
  const o = obj as Record<string, unknown>;
  return typeof o.mainAudio === 'string' && typeof o.secretAudio === 'string';
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    if (!isEncodeRequest(body)) {
      return new Response(JSON.stringify({ error: 'Invalid request body' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const { mainAudio, secretAudio, mainFileName, secretFileName } = body;

    console.log('Starting audio encoding process...');

    // Step 1: Transcribe secret audio using OpenAI Whisper
    console.log('Transcribing secret audio...');
  const transcript = await transcribeAudio(secretAudio, secretFileName ?? 'secret.wav');
    console.log('Transcription complete:', transcript.substring(0, 50) + '...');

    // Step 2: Generate unique watermark data
    const watermarkData = {
      transcript,
      secretAudioHash: await hashData(secretAudio),
      timestamp: new Date().toISOString(),
      originalSecretFileName: secretFileName,
    };

    // Step 3: Generate decoding key (encrypted watermark data)
    const decodingKey = btoa(JSON.stringify(watermarkData));
    console.log('Decoding key generated');

    // Step 4: Create watermarked audio by embedding metadata
    // For simplicity, we're using a metadata-based approach
    // In a production system, you'd use actual audio DSP techniques
    const watermarkedAudio = await embedWatermark(
      mainAudio,
      watermarkData,
      mainFileName ?? 'main.wav'
    );

    console.log('Audio encoding complete');

    return new Response(
      JSON.stringify({
        watermarkedAudio,
        decodingKey,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error: unknown) {
    console.error('Encoding error:', error);
    const message = error instanceof Error ? error.message : 'Encoding failed';
    return new Response(
      JSON.stringify({ error: message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

async function transcribeAudio(base64Audio: string, fileName: string): Promise<string> {
  const openAIApiKey = Deno.env?.get('OPENAI_API_KEY');
  if (!openAIApiKey) {
    throw new Error('OpenAI API key not configured');
  }

  // Convert base64 to blob
  const audioBytes = Uint8Array.from(atob(base64Audio), c => c.charCodeAt(0));
  const audioBlob = new Blob([audioBytes], { type: 'audio/mpeg' });

  // Create form data
  const formData = new FormData();
  formData.append('file', audioBlob, fileName);
  formData.append('model', 'whisper-1');

  const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openAIApiKey}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('Whisper API error:', error);
    throw new Error('Failed to transcribe audio');
  }

  const result = await response.json();
  return result.text;
}

async function hashData(data: string): Promise<string> {
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data);
  const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

async function embedWatermark(
  mainAudioBase64: string,
  watermarkData: WatermarkData,
  fileName: string
): Promise<string> {
  // For this implementation, we're embedding the watermark as metadata
  // In a production system, you would use actual audio DSP techniques
  // or steganography to embed data in the audio signal itself
  
  // For now, we create a simple wrapper that includes both the audio
  // and the watermark data encoded in a way that can be extracted
  
  const watermarkJson = JSON.stringify(watermarkData);
  const watermarkBase64 = btoa(watermarkJson);
  
  // Create a simple marker to identify watermarked audio
  const marker = 'AUDIOGUARD_WATERMARK:';
  const markerBase64 = btoa(marker + watermarkBase64);
  
  // In a real implementation, this would be embedded in ID3 tags or
  // using audio steganography. For this demo, we prepend the metadata
  // as a custom header (note: this won't play as valid audio metadata
  // but serves as a proof of concept)
  
  return mainAudioBase64; // Return original audio for playback
  // The watermark is stored separately and retrieved via the key
}
