import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import { useState, useEffect } from "react";

interface ItinerarySearch {
  destination?: string;
  startDate?: string;
  endDate?: string;
  budget?: string;
  vibe?: string;
  pace?: string;
  travelers?: string;
  interests?: string;
}

function getNights(startDate: string, endDate: string): number {
  if (!startDate || !endDate) return 3;
  const s = new Date(startDate);
  const e = new Date(endDate);
  const diff = (e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24);
  return Math.max(1, Math.round(diff));
}

function formatDate(dateStr: string, offset: number): string {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + offset);
  return d.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

interface Activity {
  time: string;
  title: string;
  description: string;
  category: string;
}

interface DayPlan {
  day: number;
  date: string;
  activities: Activity[];
}

interface Hotel {
  name: string;
  stars: number;
  price: string;
  description: string;
}

interface Flight {
  airline: string;
  departure: string;
  arrival: string;
  duration: string;
  price: string;
}

interface Dining {
  name: string;
  cuisine: string;
  meal: string;
  price: string;
}

interface ItineraryData {
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


const defaultDays = [
  [{ time: "9:00 AM", title: "Arrival & Check-in", desc: "Arrive at your destination and check into your hotel", cat: "travel" }],
  [{ time: "12:00 PM", title: "Explore the City", desc: "Discover local attractions and landmarks", cat: "exploration" }],
  [{ time: "3:00 PM", title: "Afternoon Activity", desc: "Enjoy local culture and cuisine", cat: "culture" }],
  [{ time: "7:00 PM", title: "Evening Dinner", desc: "Dine at a recommended local restaurant", cat: "dining" }],
];

function getActivityIcon(category: string): string {
  switch (category) {
    case "dining": return "🍽️";
    case "travel": return "✈️";
    case "relaxation": return "🧘";
    case "wellness": return "🧖";
    case "exploration": return "🗺️";
    case "adventure": return "🏔️";
    case "culture": return "🏛️";
    case "history": return "📜";
    case "entertainment": return "🎭";
    case "nightlife": return "🌙";
    case "music": return "🎵";
    case "shopping": return "🛍️";
    case "attraction": return "🎡";
    case "outdoors": return "🌲";
    case "fitness": return "🏋️";
    default: return "📍";
  }
}

function getCategoryColor(category: string): string {
  switch (category) {
    case "dining": return "bg-orange-100 text-orange-700";
    case "travel": return "bg-blue-100 text-blue-700";
    case "relaxation": case "wellness": return "bg-green-100 text-green-700";
    case "exploration": return "bg-teal-100 text-teal-700";
    case "adventure": return "bg-red-100 text-red-700";
    case "culture": case "history": return "bg-purple-100 text-purple-700";
    case "entertainment": return "bg-pink-100 text-pink-700";
    case "nightlife": return "bg-violet-100 text-violet-700";
    case "music": return "bg-yellow-100 text-yellow-700";
    case "shopping": return "bg-rose-100 text-rose-700";
    case "attraction": return "bg-cyan-100 text-cyan-700";
    case "outdoors": case "fitness": return "bg-emerald-100 text-emerald-700";
    default: return "bg-gray-100 text-gray-700";
  }
}

// Generate itinerary client-side using mock data (no server function needed)
export const Route = createFileRoute("/itinerary")({
  validateSearch: (search: Record<string, unknown>): ItinerarySearch => ({
    destination: typeof search.destination === "string" ? search.destination : "",
    startDate: typeof search.startDate === "string" ? search.startDate : "",
    endDate: typeof search.endDate === "string" ? search.endDate : "",
    budget: typeof search.budget === "string" ? search.budget : "",
    vibe: typeof search.vibe === "string" ? search.vibe : "",
    pace: typeof search.pace === "string" ? search.pace : "",
    travelers: typeof search.travelers === "string" ? search.travelers : "",
    interests: typeof search.interests === "string" ? search.interests : "",
  }),
  component: ItineraryPage,
});

function ItineraryPage() {
  const navigate = useNavigate();
  const search = useSearch({ from: "/itinerary" });
  const [itinerary, setItinerary] = useState<ItineraryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeDay, setActiveDay] = useState(1);
  const [showBooking, setShowBooking] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        // Try the server API first (calls OpenAI)
        const res = await fetch("/api/plan-trip", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: AbortSignal.timeout(30000), // 5s timeout — fall back to mock quickly
          body: JSON.stringify({
            destination: search.destination || "New York",
            startDate: search.startDate || "",
            endDate: search.endDate || "",
            budget: search.budget || "mid-range",
            vibe: search.vibe || "mixed",
            pace: search.pace || "balanced",
            travelers: search.travelers || "solo",
            interests: search.interests ? search.interests.split(",").filter(Boolean) : ["food"],
          }),
        });

        if (res.ok) {
          const data = await res.json();
          setItinerary(data);
        } else {
          throw new Error("API returned " + res.status);
        }
      } catch (e) {
        console.error("API failed, using local mock:", e);
        // Fallback to local mock
        try {
          const { generateItinerary } = await import("~/ai-planner");
          const result = await generateItinerary({
            destination: search.destination || "New York",
            startDate: search.startDate || "",
            endDate: search.endDate || "",
            budget: search.budget || "mid-range",
            vibe: search.vibe || "mixed",
            pace: search.pace || "balanced",
            travelers: search.travelers || "solo",
            interests: search.interests ? search.interests.split(",").filter(Boolean) : ["food"],
          });
          setItinerary(result);
        } catch (e2) {
          console.error("Mock also failed:", e2);
        }
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [search]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-dvh bg-gradient-to-br from-indigo-50 via-white to-purple-50 pt-24">
        <div className="mx-auto flex max-w-3xl flex-col items-center justify-center px-4 py-32 text-center">
          {/* Animated Loading */}
          <div className="relative mb-8">
            <div className="h-20 w-20 animate-pulse rounded-full bg-gradient-to-r from-indigo-400 to-purple-500" />
            <div className="absolute inset-0 flex items-center justify-center">
              <svg className="h-10 w-10 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Crafting your perfect trip...</h2>
          <p className="mt-2 text-gray-600">
            VacationHubs is analyzing your preferences and building a personalized itinerary
          </p>
          <div className="mt-8 flex gap-2">
            <div className="h-2 w-2 animate-bounce rounded-full bg-indigo-500" style={{ animationDelay: "0ms" }} />
            <div className="h-2 w-2 animate-bounce rounded-full bg-indigo-500" style={{ animationDelay: "150ms" }} />
            <div className="h-2 w-2 animate-bounce rounded-full bg-indigo-500" style={{ animationDelay: "300ms" }} />
          </div>
          <div className="mt-8 max-w-md space-y-3 text-left">
            {[
              "Analyzing destinations...",
              "Matching your vibe & budget...",
              "Curating activities & dining...",
              "Optimizing your schedule...",
            ].map((msg, i) => (
              <div key={i} className="flex items-center gap-3 text-sm text-gray-500">
                <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-indigo-400" style={{ animationDelay: `${i * 200}ms` }} />
                {msg}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!itinerary) {
    return (
      <div className="min-h-dvh bg-gradient-to-br from-indigo-50 via-white to-purple-50 pt-24">
        <div className="mx-auto max-w-3xl px-4 py-24 text-center">
          <h2 className="text-2xl font-bold text-gray-900">Something went wrong</h2>
          <p className="mt-2 text-gray-600">We couldn't generate your itinerary. Please try again.</p>
          <a href="/plan" className="mt-6 inline-block rounded-full bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white">
            Start Over
          </a>
        </div>
      </div>
    );
  }

  const budgetLabel: Record<string, string> = {
    economy: "Budget-Friendly",
    "mid-range": "Mid-Range",
    luxury: "Premium",
  };

  const vibeLabel: Record<string, string> = {
    relaxed: "Relaxed", adventurous: "Adventurous",
    cultural: "Cultural", foodie: "Foodie", mixed: "Mixed",
  };

  const paceLabel: Record<string, string> = {
    packed: "Packed", balanced: "Balanced", slow: "Slow & Easy",
  };

  const travelersLabel: Record<string, string> = {
    solo: "Solo", couple: "Couple", family: "Family", group: "Group",
  };

  return (
    <div className="min-h-dvh bg-gradient-to-br from-indigo-50 via-white to-purple-50 pt-24">
      <div className="mx-auto max-w-5xl px-4 pb-24 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate({ to: "/" })}
            className="mb-4 flex cursor-pointer items-center gap-1 text-sm font-medium text-gray-500 transition-colors hover:text-gray-900"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            New Trip
          </button>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                Your {itinerary.destination} Trip
              </h1>
              <p className="mt-1 text-lg text-gray-600">
                {itinerary.totalDays} days &middot; {budgetLabel[itinerary.budget] || "Mid-Range"} &middot; {vibeLabel[itinerary.vibe] || "Mixed"} vibe
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700">
                {itinerary.weather}
              </span>
              <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-700">
                {travelersLabel[itinerary.travelers] || "Solo"}
              </span>
            </div>
          </div>
        </div>

        {/* Booking Card */}
        <div className="mb-8 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-lg">
          <div className="grid gap-4 p-6 sm:grid-cols-2 sm:p-8">
            {/* Flight */}
            <div className="rounded-xl border border-gray-100 bg-gray-50 p-5">
              <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-700">
                <span>✈️</span> Recommended Flight
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-bold text-gray-900">{itinerary.flight.airline}</div>
                  <div className="text-sm text-gray-500">
                    {itinerary.flight.departure} – {itinerary.flight.arrival}
                  </div>
                  <div className="text-sm text-gray-500">{itinerary.flight.duration}</div>
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold text-indigo-600">{itinerary.flight.price}</div>
                  <button
                    onClick={() => setShowBooking(true)}
                    className="mt-1 cursor-pointer rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-indigo-700"
                  >
                    Book Now
                  </button>
                </div>
              </div>
            </div>

            {/* Hotel */}
            <div className="rounded-xl border border-gray-100 bg-gray-50 p-5">
              <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-700">
                <span>🏨</span> Recommended Hotel
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-bold text-gray-900">{itinerary.hotel.name}</div>
                  <div className="text-sm text-gray-500">{'★'.repeat(itinerary.hotel.stars)}</div>
                  <div className="text-sm text-gray-500">{itinerary.hotel.description.slice(0, 50)}...</div>
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold text-indigo-600">{itinerary.hotel.price}</div>
                  <button
                    onClick={() => setShowBooking(true)}
                    className="mt-1 cursor-pointer rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-indigo-700"
                  >
                    Book Now
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Day Navigation */}
        <div className="mb-6 overflow-x-auto">
          <div className="flex gap-2 pb-2">
            {itinerary.days.map((day) => (
              <button
                key={day.day}
                onClick={() => setActiveDay(day.day)}
                className={`cursor-pointer whitespace-nowrap rounded-xl px-4 py-2.5 text-sm font-semibold transition-all ${
                  activeDay === day.day
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/25"
                    : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
                }`}
              >
                Day {day.day}
              </button>
            ))}
          </div>
        </div>

        {/* Day Plan */}
        {itinerary.days
          .filter((d) => d.day === activeDay)
          .map((day) => (
            <div key={day.day} className="rounded-2xl border border-gray-200 bg-white shadow-lg">
              <div className="border-b border-gray-100 bg-gradient-to-r from-indigo-50 to-purple-50 px-6 py-4 sm:px-8">
                <h2 className="text-lg font-bold text-gray-900">
                  Day {day.day} — {day.date}
                </h2>
                {itinerary.pace === "packed" && (
                  <p className="mt-1 text-sm text-gray-500">Packed day — lots to cover!</p>
                )}
                {itinerary.pace === "slow" && (
                  <p className="mt-1 text-sm text-gray-500">Easy day — take your time.</p>
                )}
              </div>
              <div className="p-6 sm:p-8">
                <div className="relative space-y-6">
                  {/* Timeline line */}
                  <div className="absolute left-[19px] top-0 bottom-0 w-0.5 bg-gray-200" />

                  {day.activities.map((activity, i) => (
                    <div key={i} className="relative flex gap-4">
                      {/* Timeline dot */}
                      <div className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white shadow-md ring-2 ring-white">
                        <span className="text-sm">{getActivityIcon(activity.category)}</span>
                      </div>

                      {/* Content */}
                      <div className="min-w-0 flex-1 rounded-xl border border-gray-100 bg-gray-50 p-4 transition-all hover:shadow-sm">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-sm font-bold text-indigo-600">{activity.time}</span>
                          <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${getCategoryColor(activity.category)}`}>
                            {activity.category.charAt(0).toUpperCase() + activity.category.slice(1)}
                          </span>
                        </div>
                        <h3 className="mt-1 font-semibold text-gray-900">{activity.title}</h3>
                        <p className="mt-1 text-sm text-gray-600">{activity.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}

        {/* Dining Recommendations */}
        <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-lg sm:p-8">
          <h2 className="text-xl font-bold text-gray-900">Top Dining Recommendations</h2>
          <p className="mt-1 text-sm text-gray-500">Curated for your trip to {itinerary.destination}</p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {itinerary.dining.map((d, i) => (
              <div
                key={i}
                className="rounded-xl border border-gray-100 bg-gray-50 p-4 transition-all hover:shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                    <span>🍽️</span> {d.name}
                  </div>
                  <span className="text-xs font-medium text-gray-500">{d.price}</span>
                </div>
                <p className="mt-1 text-sm text-gray-600">{d.cuisine}</p>
                <p className="text-xs text-gray-400">Best for {d.meal}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <button
              onClick={() => navigate({ to: "/plan" })}
              className="cursor-pointer rounded-xl border-2 border-gray-200 bg-white px-6 py-3 text-sm font-semibold text-gray-700 transition-all hover:border-gray-300 hover:bg-gray-50"
            >
              ← Adjust Preferences
            </button>
            <a
              href="https://buy.stripe.com/bJe9AS8wj3iYfn6egl4F200"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-emerald-200 bg-emerald-50 px-6 py-3 text-sm font-bold text-emerald-700 transition-all hover:bg-emerald-100 hover:border-emerald-300 hover:shadow-md"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Buy This Trip Plan — $5
            </a>
          </div>
          <button
            onClick={() => setShowBooking(!showBooking)}
            className="cursor-pointer rounded-xl bg-gradient-to-r from-indigo-600 to-purple-700 px-8 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-500/25 transition-all hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
          >
            Book Everything Now
          </button>
        </div>

        {/* Booking Modal */}
        {showBooking && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="w-full max-w-lg rounded-2xl bg-white p-8 shadow-2xl">
              <h2 className="text-2xl font-bold text-gray-900">Book Your Trip</h2>
              <p className="mt-2 text-gray-600">
                These booking links will take you to our partners. We may earn a commission.
              </p>
              <div className="mt-6 space-y-4">
                <a
                  href="#"
                  className="flex items-center justify-between rounded-xl border border-gray-200 p-4 transition-colors hover:bg-gray-50"
                >
                  <div>
                    <div className="font-semibold text-gray-900">✈️ {itinerary.flight.airline}</div>
                    <div className="text-sm text-gray-500">{itinerary.flight.price}</div>
                  </div>
                  <span className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white">
                    Book Flight
                  </span>
                </a>
                <a
                  href="#"
                  className="flex items-center justify-between rounded-xl border border-gray-200 p-4 transition-colors hover:bg-gray-50"
                >
                  <div>
                    <div className="font-semibold text-gray-900">🏨 {itinerary.hotel.name}</div>
                    <div className="text-sm text-gray-500">{itinerary.hotel.price}</div>
                  </div>
                  <span className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white">
                    Book Hotel
                  </span>
                </a>
              </div>
              <button
                onClick={() => setShowBooking(false)}
                className="mt-6 w-full cursor-pointer rounded-xl border-2 border-gray-200 px-6 py-3 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
