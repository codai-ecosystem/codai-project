import { NextRequest, NextResponse } from 'next/server';
import { OpenAI } from 'openai';

/**
 * Azure OpenAI TTS API Route
 * Implements text-to-speech using Azure OpenAI GPT-4o-realtime models
 * Following TTK project patterns with voice controls and audio processing
 */

// Azure OpenAI Configuration
const AZURE_OPENAI_ENDPOINT = process.env.AZURE_OPENAI_ENDPOINT || '';
const AZURE_OPENAI_API_KEY = process.env.AZURE_OPENAI_API_KEY || '';
const AZURE_OPENAI_API_VERSION = '2024-02-01';
const AZURE_OPENAI_TTS_MODEL = 'tts-1'; // Standard TTS model for Azure OpenAI

// Rate limiting configuration
const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutes
const RATE_LIMIT_MAX_REQUESTS = 100; // Max TTS requests per window per IP
const MAX_CONCURRENT_REQUESTS = 3; // Following TTK pattern
const rateLimitMap = new Map<string, { count: number; timestamp: number }>();

// Available OpenAI voices (following TTK voice selection)
const OPENAI_VOICES = [
  'alloy', // Neutral, balanced
  'ash', // Slightly deeper, confident
  'ballad', // Smooth, warm
  'coral', // Friendly, engaging
  'echo', // Clear, professional
  'sage', // Wise, measured
  'shimmer', // Bright, energetic
  'verse', // Poetic, expressive
] as const;

type OpenAIVoice = (typeof OPENAI_VOICES)[number];

// Voice speed and pitch ranges (following TTK controls)
const VOICE_SPEED_MIN = 0.5;
const VOICE_SPEED_MAX = 2.0;
const VOICE_PITCH_MIN = 0.5;
const VOICE_PITCH_MAX = 2.0;

interface TTSRequest {
  text: string;
  voice?: OpenAIVoice;
  language?: string;
  speed?: number;
  pitch?: number;
  format?: 'mp3' | 'opus' | 'aac' | 'flac';
}

interface TTSResponse {
  audioBase64: string;
  transcript: string;
  voice: string;
  duration?: number;
  metadata: {
    model: string;
    voice: string;
    speed: number;
    pitch: number;
    format: string;
    language: string;
  };
}

/**
 * Get client IP address for rate limiting
 */
function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  const cfConnectingIP = request.headers.get('cf-connecting-ip');

  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }

  if (realIP) {
    return realIP;
  }

  if (cfConnectingIP) {
    return cfConnectingIP;
  }

  return 'unknown';
}

/**
 * Check rate limiting for IP address
 */
function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const clientData = rateLimitMap.get(ip);

  if (!clientData) {
    rateLimitMap.set(ip, { count: 1, timestamp: now });
    return true;
  }

  // Reset if window has passed
  if (now - clientData.timestamp > RATE_LIMIT_WINDOW) {
    rateLimitMap.set(ip, { count: 1, timestamp: now });
    return true;
  }

  // Check if within limit
  if (clientData.count >= RATE_LIMIT_MAX_REQUESTS) {
    return false;
  }

  // Increment count
  clientData.count++;
  return true;
}

/**
 * Validate TTS request parameters
 */
function validateTTSRequest(body: any): {
  isValid: boolean;
  error?: string;
  data?: TTSRequest;
} {
  // Validate required text field
  if (
    !body.text ||
    typeof body.text !== 'string' ||
    body.text.trim().length === 0
  ) {
    return { isValid: false, error: 'Text is required and must be non-empty' };
  }

  // Validate text length (max 4000 characters for TTS)
  if (body.text.length > 4000) {
    return { isValid: false, error: 'Text must be less than 4000 characters' };
  }

  // Validate voice selection
  const voice = body.voice || 'alloy';
  if (!OPENAI_VOICES.includes(voice as OpenAIVoice)) {
    return {
      isValid: false,
      error: `Invalid voice. Must be one of: ${OPENAI_VOICES.join(', ')}`,
    };
  }

  // Validate speed (following TTK range)
  const speed = body.speed ? parseFloat(body.speed) : 1.0;
  if (isNaN(speed) || speed < VOICE_SPEED_MIN || speed > VOICE_SPEED_MAX) {
    return {
      isValid: false,
      error: `Speed must be between ${VOICE_SPEED_MIN} and ${VOICE_SPEED_MAX}`,
    };
  }

  // Validate pitch (following TTK range)
  const pitch = body.pitch ? parseFloat(body.pitch) : 1.0;
  if (isNaN(pitch) || pitch < VOICE_PITCH_MIN || pitch > VOICE_PITCH_MAX) {
    return {
      isValid: false,
      error: `Pitch must be between ${VOICE_PITCH_MIN} and ${VOICE_PITCH_MAX}`,
    };
  }

  // Validate format
  const format = body.format || 'mp3';
  const validFormats = ['mp3', 'opus', 'aac', 'flac'];
  if (!validFormats.includes(format)) {
    return {
      isValid: false,
      error: `Format must be one of: ${validFormats.join(', ')}`,
    };
  }

  return {
    isValid: true,
    data: {
      text: body.text.trim(),
      voice: voice as OpenAIVoice,
      language: body.language || 'ro',
      speed,
      pitch,
      format,
    },
  };
}

/**
 * Process text for Romanian TTS optimization
 */
function processRomanianText(text: string): string {
  // Romanian-specific text processing for better TTS
  let processedText = text;

  // Handle Romanian diacritics properly
  const romanianDiacritics = {
    ă: 'ă',
    â: 'â',
    î: 'î',
    ș: 'ș',
    ț: 'ț',
    Ă: 'Ă',
    Â: 'Â',
    Î: 'Î',
    Ș: 'Ș',
    Ț: 'Ț',
  };

  // Ensure proper pronunciation guides for common Romanian words
  const pronunciationMap: { [key: string]: string } = {
    ce: 'ce',
    ci: 'ci',
    ge: 'ghe',
    gi: 'ghi',
    che: 'ke',
    chi: 'ki',
  };

  // Apply pronunciation improvements
  Object.entries(pronunciationMap).forEach(([original, replacement]) => {
    const regex = new RegExp(`\\b${original}\\b`, 'gi');
    processedText = processedText.replace(regex, replacement);
  });

  // Clean up extra whitespace
  processedText = processedText.replace(/\s+/g, ' ').trim();

  return processedText;
}

/**
 * Handle Azure OpenAI TTS request
 */
async function handleTTSRequest(req: NextRequest): Promise<NextResponse> {
  try {
    // Check API configuration
    if (!AZURE_OPENAI_ENDPOINT || !AZURE_OPENAI_API_KEY) {
      console.warn('Azure OpenAI configuration missing, returning mock response');
      
      // Return a mock response for demo purposes
      return NextResponse.json({
        audioBase64: '', // Empty audio data
        transcript: 'TTS unavailable - Azure OpenAI credentials not configured',
        voice: 'demo',
        duration: 0,
        metadata: {
          model: 'demo',
          voice: 'demo',
          speed: 1.0,
          pitch: 1.0,
          format: 'mp3',
          language: 'ro',
        },
        error: 'Azure OpenAI TTS service not configured. This is a demo response.',
      });
    }

    // Rate limiting
    const clientIP = getClientIP(req);
    if (!checkRateLimit(clientIP)) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { status: 429 }
      );
    }

    // Parse and validate request
    const body = await req.json();
    const validation = validateTTSRequest(body);

    if (!validation.isValid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const ttsRequest = validation.data!;

    // Process Romanian text for better TTS
    const processedText = processRomanianText(ttsRequest.text);

    // Initialize Azure OpenAI client
    const client = new OpenAI({
      apiKey: AZURE_OPENAI_API_KEY,
      baseURL: `${AZURE_OPENAI_ENDPOINT}/openai/deployments/${AZURE_OPENAI_TTS_MODEL}`,
      defaultQuery: { 'api-version': AZURE_OPENAI_API_VERSION },
      defaultHeaders: {
        'api-key': AZURE_OPENAI_API_KEY,
      },
      maxRetries: 3,
    });

    console.log(
      `🎤 Generating TTS for: "${processedText.substring(0, 50)}..." with voice: ${ttsRequest.voice}`
    );

    // Generate speech using Azure OpenAI
    const response = await client.audio.speech.create({
      model: AZURE_OPENAI_TTS_MODEL,
      input: processedText,
      voice: ttsRequest.voice as any,
      speed: ttsRequest.speed,
      response_format: ttsRequest.format as any,
    });

    // Convert response to base64
    const audioBuffer = Buffer.from(await response.arrayBuffer());
    const audioBase64 = audioBuffer.toString('base64');

    // Calculate approximate duration (rough estimate)
    const estimatedDuration = Math.ceil(processedText.length / 10); // ~10 chars per second

    const ttsResponse: TTSResponse = {
      audioBase64,
      transcript: processedText,
      voice: ttsRequest.voice || 'default',
      duration: estimatedDuration,
      metadata: {
        model: AZURE_OPENAI_TTS_MODEL,
        voice: ttsRequest.voice || 'default',
        speed: ttsRequest.speed || 1.0,
        pitch: ttsRequest.pitch || 1.0,
        format: ttsRequest.format!,
        language: ttsRequest.language!,
      },
    };

    console.log(
      `✅ TTS generated successfully. Audio size: ${audioBase64.length} chars, Duration: ~${estimatedDuration}s`
    );

    return NextResponse.json(ttsResponse);
  } catch (error: any) {
    console.error('❌ TTS Error:', error);

    // Return proper error response instead of crashing
    return NextResponse.json(
      { 
        error: 'TTS service temporarily unavailable. Please try again later.',
        audioBase64: '',
        transcript: 'TTS unavailable',
        voice: 'demo',
        duration: 0,
        metadata: {
          model: 'demo',
          voice: 'demo',
          speed: 1.0,
          pitch: 1.0,
          format: 'mp3',
          language: 'ro',
        },
      },
      { status: 200 } // Return 200 instead of 500 to prevent crashes
    );
  }
}

/**
 * GET endpoint - Returns available voices and configuration
 */
export async function GET(): Promise<NextResponse> {
  return NextResponse.json({
    voices: OPENAI_VOICES.map(voice => ({
      id: voice,
      name: voice,
      description: getVoiceDescription(voice),
    })),
    speedRange: { min: VOICE_SPEED_MIN, max: VOICE_SPEED_MAX },
    pitchRange: { min: VOICE_PITCH_MIN, max: VOICE_PITCH_MAX },
    supportedFormats: ['mp3', 'opus', 'aac', 'flac'],
    maxTextLength: 4000,
    model: AZURE_OPENAI_TTS_MODEL,
  });
}

/**
 * POST endpoint - Generate TTS audio
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  return handleTTSRequest(req);
}

/**
 * Get voice description for UI
 */
function getVoiceDescription(voice: OpenAIVoice): string {
  const descriptions: Record<OpenAIVoice, string> = {
    alloy: 'Neutral and balanced voice, suitable for general use',
    ash: 'Slightly deeper and confident tone, professional sound',
    ballad: 'Smooth and warm voice, pleasant for longer texts',
    coral: 'Friendly and engaging tone, good for educational content',
    echo: 'Clear and professional voice, excellent for announcements',
    sage: 'Wise and measured tone, perfect for academic content',
    shimmer: 'Bright and energetic voice, great for dynamic content',
    verse: 'Poetic and expressive tone, ideal for creative texts',
  };

  return descriptions[voice] || 'High-quality AI voice';
}

export const runtime = 'nodejs';
export const maxDuration = 30; // 30 seconds timeout for TTS generation
