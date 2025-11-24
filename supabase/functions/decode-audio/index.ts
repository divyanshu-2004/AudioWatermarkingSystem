import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// Minimal Deno declaration for type-aware usage in this file
declare const Deno: { env?: { get(key: string): string | undefined } };

interface DecodeRequest {
  watermarkedAudio: string;
  decodingKey: string;
  fileName?: string;
}

interface WatermarkData {
  transcript: string;
  secretAudioHash: string;
  timestamp: string;
  originalSecretFileName?: string;
}

function isDecodeRequest(obj: unknown): obj is DecodeRequest {
  if (!obj || typeof obj !== 'object') return false;
  const o = obj as Record<string, unknown>;
  return typeof o.watermarkedAudio === 'string' && typeof o.decodingKey === 'string';
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    if (!isDecodeRequest(body)) {
      return new Response(
        JSON.stringify({ valid: false, message: 'Invalid request body' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { watermarkedAudio, decodingKey, fileName } = body;

    console.log('Starting audio decoding process...');

    // Step 1: Decode the key to extract watermark data
    let watermarkData: WatermarkData;
    try {
      const decodedKey = atob(decodingKey);
      const parsed = JSON.parse(decodedKey);
      // Basic shape check
      if (!parsed || typeof parsed !== 'object') throw new Error('Invalid key content');
      const p = parsed as Record<string, unknown>;
      if (typeof p.transcript !== 'string' || typeof p.secretAudioHash !== 'string') {
        throw new Error('Decoded key missing required properties');
      }
      watermarkData = {
        transcript: String(p.transcript),
        secretAudioHash: String(p.secretAudioHash),
        timestamp: String(p.timestamp ?? new Date().toISOString()),
        originalSecretFileName: typeof p.originalSecretFileName === 'string' ? String(p.originalSecretFileName) : undefined,
      };
      console.log('Decoding key validated');
    } catch (error) {
      console.error('Invalid decoding key:', error);
      return new Response(
        JSON.stringify({
          valid: false,
          message: 'Invalid decoding key format',
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Step 2: Verify the watermark data structure
    if (!watermarkData.transcript || !watermarkData.secretAudioHash) {
      return new Response(
        JSON.stringify({
          valid: false,
          message: 'Decoding key does not contain valid watermark data',
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    console.log('Watermark data extracted successfully');

    // Step 3: Synthesize the secret audio from the transcript
    // Using OpenAI TTS to recreate the audio from the transcript
  const extractedAudio = await synthesizeSpeech(watermarkData.transcript);
    
    console.log('Secret audio reconstructed from transcript');

    return new Response(
      JSON.stringify({
        valid: true,
        extractedAudio,
        message: `Successfully decoded. Original file: ${watermarkData.originalSecretFileName}. Created: ${new Date(watermarkData.timestamp).toLocaleString()}`,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error: unknown) {
    console.error('Decoding error:', error);
    const message = error instanceof Error ? error.message : 'Decoding failed';
    return new Response(
      JSON.stringify({
        valid: false,
        message,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

async function synthesizeSpeech(text: string): Promise<string> {
  const openAIApiKey = Deno.env?.get('OPENAI_API_KEY');
  if (!openAIApiKey) {
    throw new Error('OpenAI API key not configured');
  }

  console.log('Synthesizing speech from transcript...');

  const response = await fetch('https://api.openai.com/v1/audio/speech', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openAIApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'tts-1',
      input: text,
      voice: 'alloy',
      response_format: 'mp3',
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('TTS API error:', error);
    throw new Error('Failed to synthesize speech');
  }

  // Convert audio to base64
  const arrayBuffer = await response.arrayBuffer();
  const base64Audio = btoa(
    String.fromCharCode(...new Uint8Array(arrayBuffer))
  );

  return base64Audio;
}
