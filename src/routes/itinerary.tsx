import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { generateItinerary } from "~/ai-planner";

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

const mocks: Record<string, {
  hotels: Hotel[];
  flights: Flight[];
  dining: Dining[];
  days: Record<string, { time: string; title: string; desc: string; cat: string }[][]>;
  weather: string;
}> = {
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
      "relaxed": [
        [{ time: "10:00 AM", title: "Arrival & Hotel Check-in", desc: "Arrive at McCarran Airport and take a taxi to your hotel on the Strip", cat: "travel" }],
        [{ time: "12:00 PM", title: "Poolside Relaxation", desc: "Unwind at the hotel pool with a refreshing cocktail", cat: "relaxation" }],
        [{ time: "3:00 PM", title: "Explore the Strip", desc: "Stroll along the famous Las Vegas Strip and see the sights", cat: "exploration" }],
        [{ time: "7:00 PM", title: "Dinner Show Experience", desc: "Enjoy dinner followed by a world-class show", cat: "entertainment" }],
      ],
      "adventurous": [
        [{ time: "7:00 AM", title: "Red Rock Canyon Hike", desc: "Morning hike through stunning red rock formations", cat: "outdoors" }],
        [{ time: "12:00 PM", title: "Off-Road ATV Adventure", desc: "Thrilling ATV tour through the Nevada desert", cat: "adventure" }],
        [{ time: "4:00 PM", title: "Helicopter Tour", desc: "Breathtaking helicopter ride over the Strip and Grand Canyon", cat: "adventure" }],
        [{ time: "8:00 PM", title: "Nightclub Experience", desc: "VIP access to top-rated nightclub on the Strip", cat: "nightlife" }],
      ],
      "cultural": [
        [{ time: "9:00 AM", title: "The Neon Museum", desc: "Explore the history of Las Vegas through vintage signs", cat: "culture" }],
        [{ time: "12:00 PM", title: "Bellagio Gallery of Fine Art", desc: "World-class art exhibitions at the Bellagio", cat: "culture" }],
        [{ time: "3:00 PM", title: "Mob Museum", desc: "Fascinating look at organized crime history in America", cat: "history" }],
        [{ time: "7:00 PM", title: "Cirque du Soleil", desc: "Spectacular acrobatic performance", cat: "entertainment" }],
      ],
      "foodie": [
        [{ time: "8:00 AM", title: "Brunch at Eggslut", desc: "Famous breakfast spot in The Cosmopolitan", cat: "dining" }],
        [{ time: "12:00 PM", title: "Food Tour on the Strip", desc: "Guided culinary tour featuring 5 different restaurants", cat: "dining" }],
        [{ time: "3:00 PM", title: "Wine Tasting", desc: "Exclusive wine tasting at a premium vineyard lounge", cat: "dining" }],
        [{ time: "7:00 PM", title: "Dinner at Bacchanal Buffet", desc: "Award-winning buffet with over 200 dishes", cat: "dining" }],
      ],
      "mixed": [
        [{ time: "9:00 AM", title: "The High Roller", desc: "Ride the world's tallest observation wheel", cat: "attraction" }],
        [{ time: "12:00 PM", title: "Lunch & Shopping", desc: "Explore the Grand Canal Shoppes at The Venetian", cat: "shopping" }],
        [{ time: "4:00 PM", title: "Spa Treatment", desc: "Relaxing massage and spa session", cat: "wellness" }],
        [{ time: "8:00 PM", title: "Fountain Show & Dinner", desc: "Watch the Bellagio fountains followed by fine dining", cat: "entertainment" }],
      ],
    },
  },
  "New York": {
    weather: "Partly cloudy, 78°F (26°C)",
    hotels: [
      { name: "The Ritz-Carlton Central Park", stars: 5, price: "$599/night", description: "Luxury hotel overlooking Central Park" },
      { name: "Arlo NoMad", stars: 4, price: "$249/night", description: "Stylish boutique hotel in the heart of Manhattan" },
      { name: "The Jane Hotel", stars: 3, price: "$149/night", description: "Historic West Village hotel with cozy cabins" },
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
      "relaxed": [
        [{ time: "10:00 AM", title: "Central Park Stroll", desc: "Leisurely walk through Central Park with a stop at Bethesda Fountain", cat: "relaxation" }],
        [{ time: "1:00 PM", title: "Metropolitan Museum of Art", desc: "Explore world-famous art collections at your own pace", cat: "culture" }],
        [{ time: "4:00 PM", title: "Afternoon Tea", desc: "Classic afternoon tea at The Plaza Hotel", cat: "dining" }],
        [{ time: "7:00 PM", title: "Broadway Show", desc: "Evening performance of a hit Broadway musical", cat: "entertainment" }],
      ],
      "adventurous": [
        [{ time: "6:00 AM", title: "Run the High Line", desc: "Early morning run on the elevated park", cat: "fitness" }],
        [{ time: "9:00 AM", title: "Bike Across Brooklyn Bridge", desc: "Scenic bike ride with skyline views", cat: "outdoors" }],
        [{ time: "1:00 PM", title: "Kayaking on Hudson", desc: "Free kayaking at Pier 40", cat: "adventure" }],
        [{ time: "7:00 PM", title: "Rooftop Bar Hopping", desc: "Explore Manhattan's best rooftop bars", cat: "nightlife" }],
      ],
      "cultural": [
        [{ time: "9:00 AM", title: "MoMA", desc: "Museum of Modern Art — Van Gogh, Warhol, and more", cat: "culture" }],
        [{ time: "12:30 PM", title: "9/11 Memorial & Museum", desc: "Powerful tribute and historical exhibition", cat: "history" }],
        [{ time: "3:00 PM", title: "Statue of Liberty & Ellis Island", desc: "Ferry tour to Lady Liberty", cat: "culture" }],
        [{ time: "7:00 PM", title: "Jazz at Blue Note", desc: "Legendary jazz club in Greenwich Village", cat: "culture" }],
      ],
      "foodie": [
        [{ time: "8:00 AM", title: "Bagel Tour", desc: "Taste NYC's best bagels from three iconic shops", cat: "dining" }],
        [{ time: "12:00 PM", title: "Chelsea Market Food Crawl", desc: "Explore artisanal food halls and market vendors", cat: "dining" }],
        [{ time: "3:00 PM", title: "Little Italy Walking Tour", desc: "Cannoli, espresso, and Italian specialties", cat: "dining" }],
        [{ time: "8:00 PM", title: "Dinner at Carbone", desc: "Iconic Italian-American fine dining experience", cat: "dining" }],
      ],
      "mixed": [
        [{ time: "9:00 AM", title: "Empire State Building", desc: "Panoramic views from the iconic skyscraper", cat: "attraction" }],
        [{ time: "11:30 AM", title: "Times Square & 5th Ave", desc: "Shopping and sightseeing in Midtown", cat: "shopping" }],
        [{ time: "3:00 PM", title: "Greenwich Village Walk", desc: "Explore charming streets and independent shops", cat: "exploration" }],
        [{ time: "7:00 PM", title: "Dinner & Comedy Club", desc: "Night out at a famous NYC comedy club", cat: "entertainment" }],
      ],
    },
  },
  "Nashville": {
    weather: "Warm, 85°F (29°C), light breeze",
    hotels: [
      { name: "The Hermitage Hotel", stars: 5, price: "$399/night", description: "Historic luxury hotel in downtown Nashville" },
      { name: "Noelle Nashville", stars: 4, price: "$229/night", description: "Boutique hotel with rooftop bar" },
      { name: "Moxy Nashville", stars: 3, price: "$179/night", description: "Fun, modern hotel in Germantown" },
    ],
    flights: [
      { airline: "Southwest Airlines", departure: "07:30 AM", arrival: "09:45 AM", duration: "2h 15m", price: "$159" },
      { airline: "American Airlines", departure: "10:00 AM", arrival: "12:15 PM", duration: "2h 15m", price: "$189" },
    ],
    dining: [
      { name: "Hattie B's Hot Chicken", cuisine: "Southern Fried Chicken", meal: "Lunch", price: "$$" },
      { name: "The Catbird Seat", cuisine: "New American Tasting Menu", meal: "Dinner", price: "$$$$" },
      { name: "Puckett's Grocery", cuisine: "Southern Comfort", meal: "Breakfast", price: "$" },
      { name: "Rolf and Daughters", cuisine: "Italian-inspired", meal: "Dinner", price: "$$$" },
      { name: "Prince's Hot Chicken Shack", cuisine: "Hot Chicken", meal: "Lunch", price: "$" },
    ],
    days: {
      "relaxed": [
        [{ time: "10:00 AM", title: "Brunch & Broadway", desc: "Late breakfast on Broadway, listen to live music", cat: "dining" }],
        [{ time: "1:00 PM", title: "Centennial Park", desc: "Relax in the park and see the Parthenon replica", cat: "relaxation" }],
        [{ time: "4:00 PM", title: "Ryman Auditorium Tour", desc: "Self-guided tour of the Mother Church of Country Music", cat: "culture" }],
        [{ time: "7:00 PM", title: "Lower Broadway Honky Tonks", desc: "Bar-hop along the famous strip of live music venues", cat: "entertainment" }],
      ],
      "adventurous": [
        [{ time: "7:00 AM", title: "Radnor Lake Hike", desc: "Morning hike with wildlife viewing at this urban preserve", cat: "outdoors" }],
        [{ time: "11:00 AM", title: "Kayaking on the Cumberland", desc: "Paddle along the Cumberland River", cat: "adventure" }],
        [{ time: "2:00 PM", title: "Zipline Adventure Park", desc: "Canopy tour and zipline course", cat: "adventure" }],
        [{ time: "8:00 PM", title: "Live Music Rooftop", desc: "Catch a rising star at a rooftop venue", cat: "music" }],
      ],
      "cultural": [
        [{ time: "9:00 AM", title: "Country Music Hall of Fame", desc: "Deep dive into country music history", cat: "culture" }],
        [{ time: "12:30 PM", title: "Music Row Walking Tour", desc: "See legendary recording studios", cat: "culture" }],
        [{ time: "3:00 PM", title: "Frist Art Museum", desc: "Contemporary art exhibitions", cat: "culture" }],
        [{ time: "7:00 PM", title: "Grand Ole Opry", desc: "Iconic live radio show at the Opry House", cat: "music" }],
      ],
      "foodie": [
        [{ time: "9:00 AM", title: "Southern Breakfast", desc: "Biscuits and gravy at a local favorite", cat: "dining" }],
        [{ time: "12:00 PM", title: "Hot Chicken Lunch", desc: "Nashville's famous hot chicken at Hattie B's", cat: "dining" }],
        [{ time: "3:00 PM", title: "Biscuit Love Food Tour", desc: "Taste Nashville's best biscuits and Southern fare", cat: "dining" }],
        [{ time: "7:00 PM", title: "Farm-to-Table Dinner", desc: "Seasonal Southern cuisine at a top restaurant", cat: "dining" }],
      ],
      "mixed": [
        [{ time: "9:00 AM", title: "Broadway Morning", desc: "Explore souvenir shops and cafes on Broadway", cat: "exploration" }],
        [{ time: "12:00 PM", title: "The Gulch Shopping", desc: "Trendy boutiques and street art in The Gulch", cat: "shopping" }],
        [{ time: "3:00 PM", title: "Brewery Tour", desc: "Sample local craft beers", cat: "entertainment" }],
        [{ time: "7:00 PM", title: "Bluebird Cafe", desc: "Intimate songwriter showcase at a legendary venue", cat: "music" }],
      ],
    },
  },
  "Orlando": {
    weather: "Sunny, 90°F (32°C), humid",
    hotels: [
      { name: "Disney's Grand Floridian", stars: 5, price: "$499/night", description: "Victorian luxury resort at Disney World" },
      { name: "Universal's Hard Rock Hotel", stars: 4, price: "$289/night", description: "Rock-themed hotel with Universal Express passes" },
      { name: "Holiday Inn Resort", stars: 3, price: "$159/night", description: "Family-friendly resort near all parks" },
    ],
    flights: [
      { airline: "Delta Air Lines", departure: "06:45 AM", arrival: "09:00 AM", duration: "2h 15m", price: "$169" },
      { airline: "Spirit Airlines", departure: "08:00 AM", arrival: "10:15 AM", duration: "2h 15m", price: "$99" },
      { airline: "Southwest Airlines", departure: "11:00 AM", arrival: "1:15 PM", duration: "2h 15m", price: "$149" },
    ],
    dining: [
      { name: "Victoria & Albert's", cuisine: "Fine Dining", meal: "Dinner", price: "$$$$" },
      { name: "The Boathouse", cuisine: "Seafood", meal: "Dinner", price: "$$$" },
      { name: "Sanaa", cuisine: "African-Indian Fusion", meal: "Lunch", price: "$$" },
      { name: "Be Our Guest Restaurant", cuisine: "French-Themed", meal: "Lunch", price: "$$$" },
      { name: "Gideon's Bakehouse", cuisine: "Cookies & Desserts", meal: "Snack", price: "$" },
    ],
    days: {
      "relaxed": [
        [{ time: "9:00 AM", title: "Late Start & Pool Time", desc: "Sleep in and enjoy the hotel pool and amenities", cat: "relaxation" }],
        [{ time: "1:00 PM", title: "Disney Springs", desc: "Shopping, dining, and entertainment district", cat: "shopping" }],
        [{ time: "5:00 PM", title: "Spa & Wellness", desc: "Afternoon spa treatment at the resort", cat: "wellness" }],
        [{ time: "7:00 PM", title: "Fireworks Dinner", desc: "Dinner with views of the Magic Kingdom fireworks", cat: "entertainment" }],
      ],
      "adventurous": [
        [{ time: "8:00 AM", title: "Universal Islands of Adventure", desc: "Thrilling rides including Hagrid's Motorbike", cat: "adventure" }],
        [{ time: "1:00 PM", title: "Volcano Bay Water Park", desc: "Warm-water water park with thrilling slides", cat: "adventure" }],
        [{ time: "5:00 PM", title: "CityWalk Exploration", desc: "Dining and entertainment at Universal CityWalk", cat: "entertainment" }],
        [{ time: "8:00 PM", title: "Horror Nights (seasonal)", desc: "If visiting during Halloween, experience HHN", cat: "adventure" }],
      ],
      "cultural": [
        [{ time: "9:00 AM", title: "Epcot World Showcase", desc: "Explore 11 world pavilions in one day", cat: "culture" }],
        [{ time: "1:00 PM", title: "The Wizarding World of Harry Potter", desc: "Explore Hogsmeade and Diagon Alley", cat: "culture" }],
        [{ time: "4:00 PM", title: "Kennedy Space Center", desc: "Visit NASA's launch headquarters (drive 45 min)", cat: "culture" }],
        [{ time: "7:00 PM", title: "Epcot Forever Fireworks", desc: "Nightly spectacular over the World Showcase Lagoon", cat: "entertainment" }],
      ],
      "foodie": [
        [{ time: "8:00 AM", title: "Breakfast with Characters", desc: "Character dining experience at Magic Kingdom", cat: "dining" }],
        [{ time: "12:00 PM", title: "Epcot Food & Wine Tour", desc: "Taste around the world at Epcot's festivals", cat: "dining" }],
        [{ time: "4:00 PM", title: "Disney Springs Dessert Tour", desc: "Sample Gideon's Bakehouse and other sweets", cat: "dining" }],
        [{ time: "7:00 PM", title: "Victoria & Albert's Dinner", desc: "AAA Five Diamond award-winning dining", cat: "dining" }],
      ],
      "mixed": [
        [{ time: "8:00 AM", title: "Magic Kingdom Opening", desc: "Rope drop at Magic Kingdom for headliner rides", cat: "attraction" }],
        [{ time: "1:00 PM", title: "Break & Pool Time", desc: "Midday break at the hotel pool", cat: "relaxation" }],
        [{ time: "4:00 PM", title: "Disney's Animal Kingdom", desc: "Explore Pandora and Kilimanjaro Safaris", cat: "exploration" }],
        [{ time: "8:00 PM", title: "Disney Boardwalk", desc: "Evening stroll and entertainment at Boardwalk", cat: "entertainment" }],
      ],
    },
  },
  "San Francisco": {
    weather: "Foggy morning, 68°F (20°C), clearing by noon",
    hotels: [
      { name: "Fairmont San Francisco", stars: 5, price: "$399/night", description: "Historic luxury hotel atop Nob Hill" },
      { name: "Hotel Zeppelin", stars: 4, price: "$219/night", description: "Boutique hotel in Union Square" },
      { name: "HI San Francisco HI Hostel", stars: 2, price: "$59/night", description: "Budget-friendly hostel near Fisherman's Wharf" },
    ],
    flights: [
      { airline: "United Airlines", departure: "07:00 AM", arrival: "09:45 AM", duration: "2h 45m", price: "$209" },
      { airline: "Alaska Airlines", departure: "08:30 AM", arrival: "11:15 AM", duration: "2h 45m", price: "$189" },
    ],
    dining: [
      { name: "State Bird Provisions", cuisine: "New American", meal: "Dinner", price: "$$$$" },
      { name: "Swan Oyster Depot", cuisine: "Seafood", meal: "Lunch", price: "$$" },
      { name: "Tartine Bakery", cuisine: "Bakery & Cafe", meal: "Breakfast", price: "$" },
      { name: "Zuni Café", cuisine: "California Italian", meal: "Dinner", price: "$$$" },
      { name: "Mister Jiu's", cuisine: "Chinese American", meal: "Dinner", price: "$$$" },
    ],
    days: {
      "relaxed": [
        [{ time: "10:00 AM", title: "Alcatraz Tour", desc: "Self-guided audio tour of the infamous island prison", cat: "culture" }],
        [{ time: "1:00 PM", title: "Fisherman's Wharf", desc: "Sea lions, clam chowder, and waterfront views", cat: "exploration" }],
        [{ time: "3:00 PM", title: "Cable Car Ride", desc: "Iconic ride through the hills of San Francisco", cat: "attraction" }],
        [{ time: "7:00 PM", title: "Dinner in North Beach", desc: "Italian dining in the historic Little Italy", cat: "dining" }],
      ],
      "adventurous": [
        [{ time: "6:00 AM", title: "Golden Gate Bridge Walk", desc: "Walk across the iconic bridge at sunrise", cat: "outdoors" }],
        [{ time: "9:00 AM", title: "Alcatraz Night Tour", desc: "Haunted evening tour of Alcatraz Island", cat: "adventure" }],
        [{ time: "1:00 PM", title: "Hike to Lands End", desc: "Scenic coastal trail with Golden Gate views", cat: "outdoors" }],
        [{ time: "7:00 PM", title: "Mission District Nightlife", desc: "Explore bars and clubs in the Mission", cat: "nightlife" }],
      ],
      "cultural": [
        [{ time: "9:00 AM", title: "SFMOMA", desc: "San Francisco Museum of Modern Art", cat: "culture" }],
        [{ time: "12:00 PM", title: "Chinatown Walking Tour", desc: "Explore the oldest Chinatown in North America", cat: "culture" }],
        [{ time: "3:00 PM", title: "Asian Art Museum", desc: "One of the most comprehensive Asian art collections", cat: "culture" }],
        [{ time: "7:00 PM", title: "Symphony or Opera", desc: "Performance at the War Memorial Opera House", cat: "culture" }],
      ],
      "foodie": [
        [{ time: "8:00 AM", title: "Tartine Bakery Breakfast", desc: "World-famous pastries and bread", cat: "dining" }],
        [{ time: "12:00 PM", title: "Ferry Building Marketplace", desc: "Gourmet food hall with local vendors", cat: "dining" }],
        [{ time: "3:00 PM", title: "Mission Burrito Tour", desc: "Taste the best burritos in the Mission District", cat: "dining" }],
        [{ time: "7:30 PM", title: "State Bird Provisions", desc: "Award-winning New American dining", cat: "dining" }],
      ],
      "mixed": [
        [{ time: "9:00 AM", title: "Golden Gate Park", desc: "Visit the Japanese Tea Garden and Conservatory of Flowers", cat: "exploration" }],
        [{ time: "12:00 PM", title: "Haight-Ashbury", desc: "Explore the historic hippie district's shops", cat: "shopping" }],
        [{ time: "3:00 PM", title: "Presidio Walk", desc: "Historic military base turned national park", cat: "exploration" }],
        [{ time: "7:00 PM", title: "Dinner & Views", desc: "Dinner with a view of the Bay Bridge", cat: "dining" }],
      ],
    },
  },
  "Chicago": {
    weather: "Warm, 82°F (28°C), lake breeze",
    hotels: [
      { name: "The Langham Chicago", stars: 5, price: "$449/night", description: "Luxury hotel with river views" },
      { name: "The Hoxton Chicago", stars: 4, price: "$219/night", description: "Trendy hotel in the Fulton Market district" },
      { name: "Freehand Chicago", stars: 3, price: "$129/night", description: "Boutique hostel-hotel hybrid in River North" },
    ],
    flights: [
      { airline: "American Airlines", departure: "06:30 AM", arrival: "08:45 AM", duration: "2h 15m", price: "$179" },
      { airline: "United Airlines", departure: "09:00 AM", arrival: "11:15 AM", duration: "2h 15m", price: "$199" },
      { airline: "Southwest Airlines", departure: "07:45 AM", arrival: "10:00 AM", duration: "2h 15m", price: "$149" },
    ],
    dining: [
      { name: "Alinea", cuisine: "Molecular Gastronomy", meal: "Dinner", price: "$$$$" },
      { name: "Portillo's", cuisine: "Chicago Fast Food", meal: "Lunch", price: "$" },
      { name: "Girl & the Goat", cuisine: "New American", meal: "Dinner", price: "$$$" },
      { name: "Lou Malnati's Pizzeria", cuisine: "Deep Dish Pizza", meal: "Dinner", price: "$$" },
      { name: "The Publican", cuisine: "Beer & Pork", meal: "Dinner", price: "$$$" },
    ],
    days: {
      "relaxed": [
        [{ time: "10:00 AM", title: "Architecture River Cruise", desc: "Narrated boat tour of Chicago's iconic architecture", cat: "culture" }],
        [{ time: "12:30 PM", title: "Millennium Park", desc: "See the Bean and relax in the park", cat: "relaxation" }],
        [{ time: "3:00 PM", title: "Art Institute of Chicago", desc: "World-class art museum", cat: "culture" }],
        [{ time: "7:00 PM", title: "Deep Dish Dinner", desc: "Iconic Chicago deep dish pizza at Lou Malnati's", cat: "dining" }],
      ],
      "adventurous": [
        [{ time: "7:00 AM", title: "Lakefront Trail Run", desc: "Scenic 18-mile path along Lake Michigan", cat: "fitness" }],
        [{ time: "10:00 AM", title: "Skydeck Chicago", desc: "Step out onto the Ledge at Willis Tower", cat: "adventure" }],
        [{ time: "1:00 PM", title: "Brewery Tour", desc: "Explore Chicago's craft beer scene", cat: "exploration" }],
        [{ time: "8:00 PM", title: "Blues Club Night", desc: "Live blues music at legendary Kingston Mines", cat: "music" }],
      ],
      "cultural": [
        [{ time: "9:00 AM", title: "Field Museum", desc: "Natural history museum with Sue the T-Rex", cat: "culture" }],
        [{ time: "12:00 PM", title: "Museum of Science & Industry", desc: "Interactive science museum", cat: "culture" }],
        [{ time: "3:00 PM", title: "Wrigley Field Tour", desc: "Historic ballpark tour in Wrigleyville", cat: "culture" }],
        [{ time: "7:30 PM", title: "Chicago Theatre", desc: "Performance at the historic venue", cat: "culture" }],
      ],
      "foodie": [
        [{ time: "8:00 AM", title: "Breakfast at Wildberry", desc: "Famous pancakes and brunch dishes", cat: "dining" }],
        [{ time: "12:00 PM", title: "Italian Beef Sandwich", desc: "Classic Chicago Italian beef at Portillo's", cat: "dining" }],
        [{ time: "3:00 PM", title: "Garrett Popcorn Shop", desc: "Famous Chicago-style caramel and cheese popcorn", cat: "dining" }],
        [{ time: "7:30 PM", title: "Alinea Experience", desc: "Multi-sensory tasting menu experience", cat: "dining" }],
      ],
      "mixed": [
        [{ time: "9:00 AM", title: "Navy Pier", desc: "Explore the pier with rides and attractions", cat: "attraction" }],
        [{ time: "12:00 PM", title: "Magnificent Mile", desc: "Shopping on Michigan Avenue", cat: "shopping" }],
        [{ time: "3:00 PM", title: "Lincoln Park Zoo", desc: "Free zoo with beautiful grounds", cat: "exploration" }],
        [{ time: "7:00 PM", title: "River North Gallery Walk", desc: "Art galleries and dinner in River North", cat: "entertainment" }],
      ],
    },
  },
};

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
      } catch (e) {
        console.error("Failed to generate itinerary", e);
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