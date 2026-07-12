/**
 * VoyageAI — Mock itinerary generator (fallback when no AI is available).
 * Extracted from the original itinerary.tsx mock data.
 */

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
  days: { day: number; date: string; activities: { time: string; title: string; description: string; category: string }[] }[];
}

function formatDate(dateStr: string, offset: number): string {
  if (!dateStr) {
    const d = new Date();
    d.setDate(d.getDate() + offset);
    return d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
  }
  const d = new Date(dateStr);
  d.setDate(d.getDate() + offset);
  return d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
}

function getNights(startDate: string, endDate: string): number {
  if (!startDate || !endDate) return 3;
  const s = new Date(startDate);
  const e = new Date(endDate);
  const diff = (e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24);
  return Math.max(1, Math.round(diff));
}

// Full mock data for 6 destinations
const mockDB: Record<string, any> = {
  "Las Vegas": {
    weather: "Sunny, 95°F (35°C)",
    hotels: [
      { name: "The Wynn Las Vegas", stars: 5, price: "$299/night", description: "Luxury resort on the Strip with world-class casino and spa" },
      { name: "The Cosmopolitan", stars: 4, price: "$189/night", description: "Modern high-rise hotel with stunning fountain views" },
      { name: "MGM Grand", stars: 4, price: "$129/night", description: "Iconic mega-resort with endless entertainment options" },
    ],
    flights: [
      { airline: "Delta Air Lines", departure: "06:30 AM", arrival: "08:45 AM", duration: "2h 15m", price: "$189" },
      { airline: "Southwest Airlines", departure: "08:15 AM", arrival: "10:30 AM", duration: "2h 15m", price: "$149" },
      { airline: "United Airlines", departure: "10:00 AM", arrival: "12:20 PM", duration: "2h 20m", price: "$209" },
    ],
    dining: [
      { name: "Bacchanal Buffet", cuisine: "International Buffet", meal: "Dinner", price: "$$$" },
      { name: "Joe's Seafood", cuisine: "Seafood", meal: "Dinner", price: "$$$" },
      { name: "Eggslut", cuisine: "Breakfast", meal: "Breakfast", price: "$" },
      { name: "Lago by Julian Serrano", cuisine: "Italian", meal: "Dinner", price: "$$$" },
      { name: "Holsteins Shakes & Buns", cuisine: "Burgers", meal: "Lunch", price: "$$" },
    ],
    days: {
      relaxed: [
        [{ time: "10:00 AM", title: "Arrival & Hotel Check-in", desc: "Arrive and check into your hotel on the Strip", cat: "travel" }],
        [{ time: "12:00 PM", title: "Poolside Relaxation", desc: "Unwind at the hotel pool", cat: "relaxation" }],
        [{ time: "3:00 PM", title: "Explore the Strip", desc: "Stroll along the famous Las Vegas Strip", cat: "exploration" }],
        [{ time: "7:00 PM", title: "Dinner Show Experience", desc: "Enjoy dinner followed by a world-class show", cat: "entertainment" }],
      ],
      adventurous: [
        [{ time: "7:00 AM", title: "Red Rock Canyon Hike", desc: "Morning hike through stunning red rock formations", cat: "outdoors" }],
        [{ time: "12:00 PM", title: "Off-Road ATV Adventure", desc: "Thrilling ATV tour through the Nevada desert", cat: "adventure" }],
        [{ time: "4:00 PM", title: "Helicopter Tour", desc: "Breathtaking helicopter ride over the Strip", cat: "adventure" }],
        [{ time: "8:00 PM", title: "Nightclub Experience", desc: "VIP access to top-rated nightclub", cat: "nightlife" }],
      ],
      cultural: [
        [{ time: "9:00 AM", title: "The Neon Museum", desc: "Explore Vegas history through vintage signs", cat: "culture" }],
        [{ time: "12:00 PM", title: "Bellagio Gallery of Fine Art", desc: "World-class art exhibitions", cat: "culture" }],
        [{ time: "3:00 PM", title: "Mob Museum", desc: "Fascinating look at organized crime history", cat: "history" }],
        [{ time: "7:00 PM", title: "Cirque du Soleil", desc: "Spectacular acrobatic performance", cat: "entertainment" }],
      ],
      foodie: [
        [{ time: "8:00 AM", title: "Brunch at Eggslut", desc: "Famous breakfast spot", cat: "dining" }],
        [{ time: "12:00 PM", title: "Food Tour on the Strip", desc: "Guided culinary tour", cat: "dining" }],
        [{ time: "3:00 PM", title: "Wine Tasting", desc: "Premium wine tasting", cat: "dining" }],
        [{ time: "7:00 PM", title: "Dinner at Bacchanal Buffet", desc: "Award-winning buffet", cat: "dining" }],
      ],
      mixed: [
        [{ time: "9:00 AM", title: "The High Roller", desc: "World's tallest observation wheel", cat: "attraction" }],
        [{ time: "12:00 PM", title: "Lunch & Shopping", desc: "Explore Grand Canal Shoppes", cat: "shopping" }],
        [{ time: "4:00 PM", title: "Spa Treatment", desc: "Relaxing massage and spa session", cat: "wellness" }],
        [{ time: "8:00 PM", title: "Fountain Show & Dinner", desc: "Bellagio fountains followed by fine dining", cat: "entertainment" }],
      ],
    },
  },
  "New York": {
    weather: "Partly cloudy, 78°F (26°C)",
    hotels: [
      { name: "The Ritz-Carlton Central Park", stars: 5, price: "$599/night", description: "Luxury hotel overlooking Central Park" },
      { name: "Arlo NoMad", stars: 4, price: "$249/night", description: "Stylish boutique hotel in Manhattan" },
      { name: "The Jane Hotel", stars: 3, price: "$149/night", description: "Historic West Village hotel" },
    ],
    flights: [
      { airline: "JetBlue Airways", departure: "07:00 AM", arrival: "09:30 AM", duration: "2h 30m", price: "$179" },
      { airline: "Delta Air Lines", departure: "09:00 AM", arrival: "11:35 AM", duration: "2h 35m", price: "$219" },
      { airline: "American Airlines", departure: "06:30 AM", arrival: "09:00 AM", duration: "2h 30m", price: "$199" },
    ],
    dining: [
      { name: "Katz's Delicatessen", cuisine: "Jewish Deli", meal: "Lunch", price: "$$" },
      { name: "Carbone", cuisine: "Italian-American", meal: "Dinner", price: "$$$$" },
      { name: "Russ & Daughters", cuisine: "Jewish Appetizing", meal: "Breakfast", price: "$$" },
      { name: "Le Bernardin", cuisine: "French Seafood", meal: "Dinner", price: "$$$$" },
      { name: "Joe's Pizza", cuisine: "Pizza", meal: "Lunch", price: "$" },
    ],
    days: {
      relaxed: [
        [{ time: "10:00 AM", title: "Central Park Stroll", desc: "Leisurely walk through Central Park", cat: "relaxation" }],
        [{ time: "1:00 PM", title: "Metropolitan Museum of Art", desc: "Explore world-famous art collections", cat: "culture" }],
        [{ time: "4:00 PM", title: "Afternoon Tea", desc: "Classic afternoon tea at The Plaza Hotel", cat: "dining" }],
        [{ time: "7:00 PM", title: "Broadway Show", desc: "Evening performance of a hit Broadway musical", cat: "entertainment" }],
      ],
      adventurous: [
        [{ time: "6:00 AM", title: "Run the High Line", desc: "Early morning run on the elevated park", cat: "fitness" }],
        [{ time: "9:00 AM", title: "Bike Across Brooklyn Bridge", desc: "Scenic bike ride with skyline views", cat: "outdoors" }],
        [{ time: "1:00 PM", title: "Kayaking on Hudson", desc: "Free kayaking at Pier 40", cat: "adventure" }],
        [{ time: "7:00 PM", title: "Rooftop Bar Hopping", desc: "Explore Manhattan's best rooftop bars", cat: "nightlife" }],
      ],
      cultural: [
        [{ time: "9:00 AM", title: "MoMA", desc: "Museum of Modern Art", cat: "culture" }],
        [{ time: "12:30 PM", title: "9/11 Memorial & Museum", desc: "Powerful tribute", cat: "history" }],
        [{ time: "3:00 PM", title: "Statue of Liberty & Ellis Island", desc: "Ferry tour to Lady Liberty", cat: "culture" }],
        [{ time: "7:00 PM", title: "Jazz at Blue Note", desc: "Legendary jazz club", cat: "culture" }],
      ],
      foodie: [
        [{ time: "8:00 AM", title: "Bagel Tour", desc: "Taste NYC's best bagels", cat: "dining" }],
        [{ time: "12:00 PM", title: "Chelsea Market Food Crawl", desc: "Explore artisanal food halls", cat: "dining" }],
        [{ time: "3:00 PM", title: "Little Italy Walking Tour", desc: "Cannoli, espresso, Italian specialties", cat: "dining" }],
        [{ time: "8:00 PM", title: "Dinner at Carbone", desc: "Iconic Italian-American fine dining", cat: "dining" }],
      ],
      mixed: [
        [{ time: "9:00 AM", title: "Empire State Building", desc: "Panoramic views", cat: "attraction" }],
        [{ time: "11:30 AM", title: "Times Square & 5th Ave", desc: "Shopping and sightseeing", cat: "shopping" }],
        [{ time: "3:00 PM", title: "Greenwich Village Walk", desc: "Charming streets and shops", cat: "exploration" }],
        [{ time: "7:00 PM", title: "Dinner & Comedy Club", desc: "Night out at NYC comedy club", cat: "entertainment" }],
      ],
    },
  },
};

// Also add Nashville, Orlando, San Francisco, Chicago with simpler data
const extraDestinations = ["Nashville", "Orlando", "San Francisco", "Chicago"];
for (const dest of extraDestinations) {
  if (!mockDB[dest]) {
    mockDB[dest] = {
      weather: "Mild, pleasant weather",
      hotels: [
        { name: `${dest} Grand Hotel`, stars: 4, price: "$199/night", description: "Premier downtown hotel" },
        { name: `${dest} Boutique Inn`, stars: 3, price: "$149/night", description: "Charming local hotel" },
      ],
      flights: [
        { airline: "Major Airlines", departure: "07:30 AM", arrival: "09:45 AM", duration: "2h 15m", price: "$179" },
      ],
      dining: [
        { name: `${dest} Bistro`, cuisine: "American", meal: "Dinner", price: "$$" },
        { name: `${dest} Cafe`, cuisine: "Cafe", meal: "Breakfast", price: "$" },
      ],
      days: {
        relaxed: [
          [{ time: "10:00 AM", title: "Arrival & Check-in", desc: `Arrive at ${dest} and get settled`, cat: "travel" }],
          [{ time: "1:00 PM", title: "Explore Downtown", desc: `Walk through ${dest}'s main streets`, cat: "exploration" }],
          [{ time: "7:00 PM", title: "Local Dinner", desc: "Try the local cuisine", cat: "dining" }],
        ],
        mixed: [
          [{ time: "9:00 AM", title: "City Tour", desc: "Guided tour of major sights", cat: "culture" }],
          [{ time: "1:00 PM", title: "Lunch & Shopping", desc: "Explore local shops", cat: "shopping" }],
          [{ time: "7:00 PM", title: "Night Out", desc: "Experience local nightlife", cat: "entertainment" }],
        ],
      },
    };
  }
}

export function generateMockItinerary(input: {
  destination: string;
  startDate: string;
  endDate: string;
  budget: string;
  vibe: string;
  pace: string;
  travelers: string;
  interests: string[];
}): ItineraryData {
  const dest = input.destination;
  const data = mockDB[dest] || mockDB["Las Vegas"];
  const vibeKey = (input.vibe || "mixed") as keyof typeof data.days;
  const safeVibe = data.days[vibeKey] ? vibeKey : "mixed";
  const nights = getNights(input.startDate, input.endDate);

  // Pick hotel based on budget
  const hotelMap: Record<string, number> = { economy: 2, "mid-range": 1, luxury: 0 };
  const hotelIdx = hotelMap[input.budget] ?? 1;
  const hotel = data.hotels[Math.min(hotelIdx, data.hotels.length - 1)];

  const flight = data.flights[0];

  // Build days
  const rawActivities = data.days[safeVibe];
  const days: { day: number; date: string; activities: any[] }[] = [];

  for (let d = 0; d < nights; d++) {
    const dayActivities = rawActivities[d % rawActivities.length] || rawActivities[0];
    days.push({
      day: d + 1,
      date: formatDate(input.startDate, d),
      activities: dayActivities.map((a: any) => ({
        time: a.time,
        title: a.title,
        description: a.desc,
        category: a.cat,
      })),
    });
  }

  return {
    destination: dest,
    totalDays: nights,
    budget: input.budget,
    vibe: input.vibe,
    pace: input.pace,
    travelers: input.travelers,
    interests: input.interests,
    weather: data.weather,
    hotel,
    flight,
    dining: data.dining,
    days,
  };
}
