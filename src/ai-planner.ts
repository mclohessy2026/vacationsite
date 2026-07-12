/**
 * VoyageAI — Real AI trip planner using OpenAI.
 *
 * Server-only module. Falls back to mock data when OPENAI_API_KEY is not set.
 */
import OpenAI from "openai";

// ---- Types (mirror the existing mock types) ----

interface Flight {
  airline: string;
  departure: string;
  arrival: string;
  duration: string;
  price: string;
}

interface Hotel {
  name: string;
  stars: number;
  price: string;
  description: string;
}

interface Activity {
  time: string;
  title: string;
  description: string;
  category: string;
}

interface Dining {
  name: string;
  cuisine: string;
  meal: string;
  price: string;
}

interface DayPlan {
  day: number;
  date: string;
  activities: Activity[];
}

export interface ItineraryData {
  destination: string;
  totalDays: number;
  budget: string;
  vibe: string;
  pace: string;
  travelers: string;
  interests: string[];
  weather: string;
  hotel: Hotel;
  flight: Flight;
  dining: Dining[];
  days: DayPlan[];
}

interface PlanInput {
  destination: string;
  startDate: string;
  endDate: string;
  budget: string;
  vibe: string;
  pace: string;
  travelers: string;
  interests: string[];
}

// ---- Mock fallback data ----
import { generateMockItinerary } from "./mock-planner";

// ---- AI Planner ----

export async function generateItinerary(input: PlanInput): Promise<ItineraryData> {
  const apiKey = process.env.OPENAI_API_KEY;

  // Fall back to mock data if no API key
  if (!apiKey || apiKey.startsWith("sk-proj-") === false) {
    console.log("No OPENAI_API_KEY set — using mock data");
    return generateMockItinerary(input);
  }

  try {
    const openai = new OpenAI({ apiKey });

    const prompt = buildPrompt(input);

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are VoyageAI, a travel planning assistant. Generate a detailed day-by-day trip itinerary as valid JSON. " +
            "Output ONLY the JSON object with no markdown, no explanation, no code fences.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 3000,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) throw new Error("No content in OpenAI response");

    // Parse the JSON response
    const cleaned = content
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();

    const parsed = JSON.parse(cleaned);

    return {
      destination: input.destination,
      totalDays: parsed.totalDays ?? getDays(input.startDate, input.endDate),
      budget: input.budget,
      vibe: input.vibe,
      pace: input.pace,
      travelers: input.travelers,
      interests: input.interests,
      weather: parsed.weather ?? "Pleasant weather expected",
      hotel: parsed.hotel ?? { name: "TBD", stars: 3, price: "TBD", description: "Check back for details" },
      flight: parsed.flight ?? { airline: "TBD", departure: "TBD", arrival: "TBD", duration: "TBD", price: "TBD" },
      dining: parsed.dining ?? [],
      days: parsed.days ?? [],
    };
  } catch (err) {
    console.error("AI planner error, falling back to mock:", err);
    return generateMockItinerary(input);
  }
}

function getDays(start: string, end: string): number {
  if (!start || !end) return 3;
  const diff = (new Date(end).getTime() - new Date(start).getTime()) / (1000 * 60 * 60 * 24);
  return Math.max(1, Math.round(diff));
}

function buildPrompt(input: PlanInput): string {
  return `Generate a complete trip itinerary for a trip to ${input.destination}.

Trip details:
- Destination: ${input.destination}
- Dates: ${input.startDate} to ${input.endDate} (${getDays(input.startDate, input.endDate)} days)
- Budget: ${input.budget}
- Vibe: ${input.vibe}
- Pace: ${input.pace}
- Travelers: ${input.travelers}
- Interests: ${input.interests.join(", ")}

Return a JSON object with this exact structure:
{
  "weather": "string (typical weather for the destination and dates)",
  "hotel": { "name": "string", "stars": number, "price": "string (e.g. $199/night)", "description": "string" },
  "flight": { "airline": "string", "departure": "string (time)", "arrival": "string (time)", "duration": "string", "price": "string" },
  "dining": [{ "name": "string", "cuisine": "string", "meal": "string (Breakfast/Lunch/Dinner)", "price": "string ($/$$/$$$/$$$$)" }],
  "days": [{ "day": number, "date": "string (YYYY-MM-DD)", "activities": [{ "time": "string", "title": "string", "description": "string", "category": "string (travel/outdoors/culture/dining/entertainment/relaxation/shopping/nightlife/adventure/wellness)" }] }],
  "totalDays": number
}

Make it realistic and specific to ${input.destination}. Include 3-5 activities per day. Tailor everything to the ${input.vibe} vibe and ${input.pace} pace.`;
}
