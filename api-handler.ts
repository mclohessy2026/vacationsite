/**
 * VacationHubs API endpoint — generates trip itineraries via OpenAI.
 * Deployed as a separate serverless function alongside the main app.
 *
 * The default export is a Node.js (req, res) handler for the Vercel Build Output
 * API v3 "Nodejs" launcher. Internally it adapts to web Request/Response via the
 * same pattern used by vercel-entry.ts.
 */
import type { IncomingMessage, ServerResponse } from "node:http";
import { Readable } from "node:stream";
import type { ItineraryData } from "../src/ai-planner";

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

function getDays(start: string, end: string): number {
  if (!start || !end) return 3;
  const diff = (new Date(end).getTime() - new Date(start).getTime()) / (1000 * 60 * 60 * 24);
  return Math.max(1, Math.round(diff));
}

function buildPrompt(input: PlanInput): string {
  return `Generate a complete trip itinerary for ${input.destination}.

Details:
- Destination: ${input.destination}
- Dates: ${input.startDate} to ${input.endDate} (${getDays(input.startDate, input.endDate)} days)
- Budget: ${input.budget}
- Vibe: ${input.vibe}
- Pace: ${input.pace}
- Travelers: ${input.travelers}
- Interests: ${input.interests.join(", ")}

Return ONLY valid JSON (no markdown, no explanation):
{
  "weather": "string describing weather",
  "hotel": { "name": "string", "stars": number, "price": "string like $199/night", "description": "string" },
  "flight": { "airline": "string", "departure": "string", "arrival": "string", "duration": "string", "price": "string" },
  "dining": [{ "name": "string", "cuisine": "string", "meal": "string", "price": "string" }],
  "days": [{ "day": number, "date": "YYYY-MM-DD", "activities": [{ "time": "string like 9:00 AM", "title": "string", "description": "string", "category": "string (culture/dining/entertainment/outdoors/adventure/shopping/relaxation/nightlife/travel/wellness)" }] }],
  "totalDays": number
}

Include 4-6 activities per day. Be very specific to ${input.destination}. Tailor to ${input.vibe} vibe and ${input.pace} pace.`;
}

function buildMock(input: PlanInput): ItineraryData {
  const data: Record<string, any> = {
    "Las Vegas": { weather: "Sunny, 95°F", hotel: "The Cosmopolitan", flight: "Delta" },
    "New York": { weather: "Partly cloudy, 78°F", hotel: "Arlo NoMad", flight: "JetBlue" },
    "Nashville": { weather: "Warm, 85°F", hotel: "Noelle Nashville", flight: "Southwest" },
    "Orlando": { weather: "Sunny, 90°F", hotel: "Universal's Hard Rock Hotel", flight: "Delta" },
    "San Francisco": { weather: "Foggy morning, 68°F", hotel: "Hotel Zeppelin", flight: "United" },
    "Chicago": { weather: "Warm, 82°F", hotel: "The Hoxton Chicago", flight: "American" },
  };

  const city = data[input.destination] || data["New York"];

  return {
    destination: input.destination,
    totalDays: getDays(input.startDate, input.endDate),
    budget: input.budget,
    vibe: input.vibe,
    pace: input.pace,
    travelers: input.travelers,
    interests: input.interests,
    weather: city.weather,
    hotel: { name: city.hotel, stars: 4, price: "$249/night", description: `Popular hotel in ${input.destination}` },
    flight: { airline: city.flight, departure: "8:00 AM", arrival: "10:30 AM", duration: "2h 30m", price: "$189" },
    dining: [
      { name: "Local Favorite", cuisine: "American", meal: "Dinner", price: "$$" },
      { name: "Cafe Central", cuisine: "Cafe", meal: "Breakfast", price: "$" },
    ],
    days: Array.from({ length: getDays(input.startDate, input.endDate) }, (_, i) => ({
      day: i + 1,
      date: new Date(new Date(input.startDate).getTime() + i * 86400000).toISOString().split("T")[0],
      activities: [
        { time: "9:00 AM", title: `Explore ${input.destination}`, description: `Discover the best of ${input.destination}`, category: "culture" },
        { time: "12:00 PM", title: "Lunch Break", description: "Enjoy local cuisine", category: "dining" },
        { time: "3:00 PM", title: "Afternoon Activity", description: `Experience ${input.destination}`, category: "entertainment" },
        { time: "7:00 PM", title: "Evening Out", description: "Dinner and nightlife", category: "nightlife" },
      ],
    })),
  };
}

// ---- Web fetch handler (core logic) ----

async function webHandler(req: Request): Promise<Response> {
  const headers = { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" };

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Use POST" }), { status: 405, headers });
  }

  try {
    const body = await req.json();
    const input: PlanInput = {
      destination: body.destination || "New York",
      startDate: body.startDate || "",
      endDate: body.endDate || "",
      budget: body.budget || "mid-range",
      vibe: body.vibe || "mixed",
      pace: body.pace || "balanced",
      travelers: body.travelers || "solo",
      interests: (typeof body.interests === "string" ? body.interests.split(",") : body.interests || ["food"]).filter(Boolean),
    };

    const apiKey = process.env.OPENAI_API_KEY;

    if (apiKey) {
      try {
        const { default: OpenAI } = await import("openai");
        const openai = new OpenAI({ apiKey });

        const response = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: "You are a travel planner. Return ONLY valid JSON. No explanation, no markdown." },
            { role: "user", content: buildPrompt(input) },
          ],
          temperature: 0.7,
          max_tokens: 3000,
        });

        const content = response.choices[0]?.message?.content?.trim();
        if (content) {
          const cleaned = content.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
          const parsed = JSON.parse(cleaned);
          return new Response(JSON.stringify({
            ...parsed,
            destination: input.destination,
            budget: input.budget,
            vibe: input.vibe,
            pace: input.pace,
            travelers: input.travelers,
            interests: input.interests,
          }), { status: 200, headers });
        }
      } catch (e) {
        console.error("OpenAI error, falling back to mock:", e);
      }
    }

    return new Response(JSON.stringify(buildMock(input)), { status: 200, headers });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers });
  }
}

// ---- Node.js adapter (for Vercel "Nodejs" launcher) ----

/** Convert a Node IncomingMessage into a web Request (same pattern as vercel-entry.ts). */
function toWebRequest(req: IncomingMessage): Request {
  const host = req.headers.host ?? "localhost";
  const proto = (req.headers["x-forwarded-proto"] as string | undefined) ?? "https";
  const url = `${proto}://${host}${req.url ?? "/"}`;
  const headers = new Headers();
  for (const [key, value] of Object.entries(req.headers)) {
    if (Array.isArray(value)) for (const v of value) headers.append(key, v);
    else if (value != null) headers.set(key, value);
  }
  const method = req.method ?? "GET";
  const hasBody = method !== "GET" && method !== "HEAD";
  return new Request(url, {
    method,
    headers,
       ...(hasBody ? { body: Readable.toWeb(req) as ReadableStream, duplex: "half" } : {}),
  } as RequestInit);
}

/** Default export: Node.js (req, res) handler expected by Vercel's "Nodejs" launcher. */
export default async function nodeHandler(
  req: IncomingMessage,
  res: ServerResponse,
): Promise<void> {
  try {
    const webRes = await webHandler(toWebRequest(req));
    res.statusCode = webRes.status;
    webRes.headers.forEach((value, key) => res.setHeader(key, value));
    if (webRes.body) {
      const reader = webRes.body.getReader();
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        res.write(value);
      }
    }
    res.end();
  } catch (error) {
    console.error("[api-handler] request failed", error);
    res.statusCode = 500;
    res.setHeader("content-type", "application/json");
    res.end(JSON.stringify({ error: "Internal Server Error" }));
  }
}
