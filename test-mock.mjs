import { generateMockItinerary } from './src/mock-planner.ts';

const input = {
  destination: "New York",
  startDate: "2026-07-15",
  endDate: "2026-07-18",
  budget: "mid-range",
  vibe: "cultural",
  pace: "balanced",
  travelers: "couple",
  interests: ["food", "museums"],
};
try {
  const result = generateMockItinerary(input);
  console.log("SUCCESS:", result.destination, result.totalDays, "days");
  console.log("Hotel:", result.hotel.name);
  console.log("Dining:", result.dining.length, "recommendations");
  console.log("Day 1 activities:", result.days[0].activities.length);
} catch (e) {
  console.error("ERROR:", e);
}
