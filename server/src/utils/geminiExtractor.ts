import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs';

export interface ExtractedEventData {
  title: string | null;
  short_summary: string | null;
  description: string | null;
  category: string | null;
  event_date: string | null;
  start_time: string | null;
  end_time: string | null;
  venue_name: string | null;
  expected_audience: string | null;
  max_capacity: number | null;
  registration_deadline: string | null;
  eligibility: string | null;
  organizer_club: string | null;
  ambiguous_fields: string[];
  extraction_notes: string;
}

export interface AIExtractionResponse {
  success: boolean;
  aiConfigured: boolean;
  data: ExtractedEventData | null;
  message: string;
}

export async function extractEventFromFlyer(imagePath: string, mimeType: string): Promise<AIExtractionResponse> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey.trim() === '' || apiKey.includes('YOUR_API_KEY')) {
    return {
      success: true,
      aiConfigured: false,
      data: null,
      message: 'AI Service (Gemini API) is not configured in server .env. The uploaded flyer has been saved, and manual draft mode is activated.'
    };
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const imageBytes = fs.readFileSync(imagePath);
    const imagePart = {
      inlineData: {
        data: imageBytes.toString('base64'),
        mimeType: mimeType || 'image/jpeg'
      }
    };

    const prompt = `
You are an expert college event flyer data extraction assistant for CampusPulse.
Examine this college event poster / flyer image carefully.
Extract the following event fields. 

RULES:
1. Do NOT invent or hallucinate information that is not present on the flyer.
2. If any field cannot be clearly determined or is missing from the flyer, use null.
3. If a field is ambiguous or uncertain, include its name in the "ambiguous_fields" array so organizers can confirm it manually.
4. "category" MUST be one of: "Technical", "Hackathons", "Workshops", "Cultural", "Sports", "Entrepreneurship", "Art and Design", "Clubs and Communities", or null if unclear.
5. Dates must be formatted as YYYY-MM-DD or null.
6. Times must be formatted as 24-hour HH:MM (e.g. "14:30") or null.
7. Return ONLY a valid JSON object with the following schema:

{
  "title": string | null,
  "short_summary": string | null,
  "description": string | null,
  "category": string | null,
  "event_date": string | null,
  "start_time": string | null,
  "end_time": string | null,
  "venue_name": string | null,
  "expected_audience": string | null,
  "max_capacity": number | null,
  "registration_deadline": string | null,
  "eligibility": string | null,
  "organizer_club": string | null,
  "ambiguous_fields": string[],
  "extraction_notes": string
}
`;

    const result = await model.generateContent([prompt, imagePart]);
    const responseText = result.response.text();

    // Clean JSON response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Failed to parse structured JSON from AI output');
    }

    const parsedData: ExtractedEventData = JSON.parse(jsonMatch[0]);

    return {
      success: true,
      aiConfigured: true,
      data: parsedData,
      message: 'AI successfully analyzed flyer. Review and verify the extracted suggestions.'
    };
  } catch (err: any) {
    console.error('[AI Flyer Extraction Error]:', err.message || err);
    return {
      success: false,
      aiConfigured: true,
      data: null,
      message: `AI extraction could not process this image (${err.message || 'Error'}). Please fill the event details manually.`
    };
  }
}
