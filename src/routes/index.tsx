import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/")({
  component: Home,
});

const destinations = [
  { city: "Las Vegas", state: "NV", tag: "Entertainment Capital" },
  { city: "New York", state: "NY", tag: "The City That Never Sleeps" },
  { city: "Nashville", state: "TN", tag: "Music City" },
  { city: "Orlando", state: "FL", tag: "Theme Park Paradise" },
  { city: "San Francisco", state: "CA", tag: "Golden Gate City" },
  { city: "Chicago", state: "IL", tag: "The Windy City" },
];

function Home() {
  const navigate = useNavigate();
  const [destination, setDestination] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedDestination, setSelectedDestination] = useState("");

  const filteredDestinations = destinations.filter((d) =>
    d.city.toLowerCase().includes(destination.toLowerCase()),
  );

  const handlePlanTrip = () => {
    if (selectedDestination && startDate && endDate) {
      navigate({
        to: "/plan",
        search: {
          destination: selectedDestination,
          startDate,
          endDate,
        },
      });
    }
  };

  const handleSelectDestination = (city: string) => {
    setSelectedDestination(city);
    setDestination(city);
    setShowDropdown(false);
  };

  const isFormValid = selectedDestination && startDate && endDate;

  return (
    <div>
      {/* Hero Section */}
      <section className="relative min-h-[90dvh] overflow-hidden bg-gradient-to-br from-indigo-950 via-indigo-900 to-purple-900">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(99,102,241,0.3),transparent_50%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(168,85,247,0.3),transparent_50%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:64px_64px]" />
        </div>

        <div className="relative mx-auto flex min-h-[90dvh] max-w-7xl flex-col items-center justify-center px-4 pb-20 pt-24 text-center sm:px-6 lg:px-8">
          {/* Badge */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-400/30 bg-indigo-500/10 px-4 py-1.5 text-sm font-medium text-indigo-200 backdrop-blur-sm">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            AI-Powered Trip Planning — No research needed
          </div>

          {/* Headline */}
          <h1 className="text-balance max-w-4xl text-4xl font-extrabold tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl">
            Tell us{" "}
            <span className="bg-gradient-to-r from-indigo-300 to-purple-300 bg-clip-text text-transparent">
              where and when
            </span>{" "}
            you want to go
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-indigo-200 sm:text-xl">
            Answer a few quick questions about your budget, vibe, and interests.
            VoyageAI crafts a complete, bookable itinerary — flights, hotels,
            activities, and dining — all in one go.
          </p>

          {/* Search Card */}
          <div className="mt-10 w-full max-w-3xl rounded-2xl border border-white/10 bg-white/5 p-4 shadow-2xl backdrop-blur-xl sm:p-6">
            <div className="grid gap-4 sm:grid-cols-[1fr_auto_auto_auto] sm:gap-3">
              {/* Destination */}
              <div className="relative">
                <label className="mb-1.5 block text-left text-xs font-semibold uppercase tracking-wider text-indigo-300">
                  Destination
                </label>
                <input
                  type="text"
                  value={destination}
                  onChange={(e) => {
                    setDestination(e.target.value);
                    setSelectedDestination("");
                    setShowDropdown(true);
                  }}
                  onFocus={() => setShowDropdown(true)}
                  onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
                  placeholder="Where to?"
                  className="w-full rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-white placeholder-indigo-300/60 backdrop-blur-sm transition-colors focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/30"
                />
                {showDropdown && destination && filteredDestinations.length > 0 && (
                  <div className="absolute left-0 right-0 top-full z-10 mt-1 overflow-hidden rounded-xl border border-white/10 bg-gray-900 shadow-xl backdrop-blur-xl">
                    {filteredDestinations.map((d) => (
                      <button
                        key={d.city}
                        onMouseDown={() => handleSelectDestination(d.city)}
                        className="flex w-full items-center gap-3 px-4 py-3 text-left text-white transition-colors hover:bg-white/10"
                      >
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/20 text-sm font-bold text-indigo-300">
                          {d.city[0]}
                        </div>
                        <div>
                          <div className="font-medium">{d.city}</div>
                          <div className="text-xs text-indigo-300/60">
                            {d.tag}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Start Date */}
              <div>
                <label className="mb-1.5 block text-left text-xs font-semibold uppercase tracking-wider text-indigo-300">
                  Start
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                  className="w-full rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-white [color-scheme:dark] backdrop-blur-sm transition-colors focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/30"
                />
              </div>

              {/* End Date */}
              <div>
                <label className="mb-1.5 block text-left text-xs font-semibold uppercase tracking-wider text-indigo-300">
                  End
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  min={startDate || new Date().toISOString().split("T")[0]}
                  className="w-full rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-white [color-scheme:dark] backdrop-blur-sm transition-colors focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/30"
                />
              </div>

              {/* CTA */}
              <div className="flex items-end">
                <button
                  onClick={handlePlanTrip}
                  disabled={!isFormValid}
                  className={`w-full cursor-pointer rounded-xl px-6 py-3 text-sm font-bold transition-all sm:px-8 ${
                    isFormValid
                      ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40 hover:scale-[1.02] active:scale-[0.98]"
                      : "bg-white/10 text-white/40 cursor-not-allowed"
                  }`}
                >
                  Plan My Trip
                </button>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-8 text-center">
            <div>
              <div className="text-2xl font-bold text-white sm:text-3xl">
                10K+
              </div>
              <div className="text-sm text-indigo-300">Trips Planned</div>
            </div>
            <div className="hidden h-8 w-px bg-white/10 sm:block" />
            <div>
              <div className="text-2xl font-bold text-white sm:text-3xl">
                4.9★
              </div>
              <div className="text-sm text-indigo-300">User Rating</div>
            </div>
            <div className="hidden h-8 w-px bg-white/10 sm:block" />
            <div>
              <div className="text-2xl font-bold text-white sm:text-3xl">
                5 min
              </div>
              <div className="text-sm text-indigo-300">Avg. Plan Time</div>
            </div>
          </div>
        </div>

        {/* Wave Divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" className="w-full">
            <path
              d="M0 120V60C240 20 480 0 720 0C960 0 1200 20 1440 60V120H0Z"
              fill="white"
            />
          </svg>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="bg-white px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="text-center">
            <span className="inline-block rounded-full bg-indigo-100 px-4 py-1.5 text-sm font-semibold text-indigo-700">
              How It Works
            </span>
            <h2 className="mt-4 text-balance text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Three steps to your perfect trip
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600">
              No tabs. No overwhelm. Just tell us what you love.
            </p>
          </div>

          <div className="mt-16 grid gap-8 md:grid-cols-3">
            {/* Step 1 */}
            <div className="group relative rounded-2xl border border-gray-100 bg-white p-8 shadow-sm transition-all hover:shadow-md hover:-translate-y-1">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-100 text-lg font-bold text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                01
              </div>
              <h3 className="text-xl font-bold text-gray-900">
                Tell us your dream
              </h3>
              <p className="mt-2 leading-relaxed text-gray-600">
                Where are you headed? When? What's your budget and vibe? Answer
                a few simple questions and let our AI do the heavy lifting.
              </p>
            </div>

            {/* Step 2 */}
            <div className="group relative rounded-2xl border border-gray-100 bg-white p-8 shadow-sm transition-all hover:shadow-md hover:-translate-y-1">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-100 text-lg font-bold text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                02
              </div>
              <h3 className="text-xl font-bold text-gray-900">
                AI crafts your itinerary
              </h3>
              <p className="mt-2 leading-relaxed text-gray-600">
                VoyageAI generates a complete day-by-day plan — flights, hotels,
                restaurants, and activities — tailored to your preferences.
              </p>
            </div>

            {/* Step 3 */}
            <div className="group relative rounded-2xl border border-gray-100 bg-white p-8 shadow-sm transition-all hover:shadow-md hover:-translate-y-1">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-100 text-lg font-bold text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                03
              </div>
              <h3 className="text-xl font-bold text-gray-900">
                Book &amp; go
              </h3>
              <p className="mt-2 leading-relaxed text-gray-600">
                Review, tweak, and book everything in one place. Flights,
                hotels, activities — no hopping between ten different sites.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Destinations */}
      <section className="bg-gray-50 px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="text-center">
            <h2 className="text-balance text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Popular destinations
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600">
              Start with one of our favorites.
            </p>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {destinations.map((d) => (
              <button
                key={d.city}
                onClick={() =>
                  navigate({
                    to: "/plan",
                    search: {
                      destination: d.city,
                      startDate: "",
                      endDate: "",
                    },
                  })
                }
                className="group cursor-pointer rounded-2xl border border-gray-200 bg-white p-6 text-left shadow-sm transition-all hover:shadow-lg hover:-translate-y-1 hover:border-indigo-200"
              >
                <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-xl font-bold text-white shadow-lg">
                  {d.city[0]}
                </div>
                <h3 className="text-lg font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">
                  {d.city}, {d.state}
                </h3>
                <p className="mt-1 text-sm text-gray-500">{d.tag}</p>
                <div className="mt-4 flex items-center gap-1 text-sm font-medium text-indigo-600">
                  Plan a trip
                  <svg
                    className="h-4 w-4 transition-transform group-hover:translate-x-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Premium Tier Section */}
      <section className="bg-white px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <div className="text-center">
            <span className="inline-block rounded-full bg-amber-100 px-4 py-1.5 text-sm font-semibold text-amber-700">
              Premium
            </span>
            <h2 className="mt-4 text-balance text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Go premium for unlimited planning
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600">
              Unlock unlimited trip plans, priority support, group booking features, and more.
            </p>
          </div>

          <div className="mx-auto mt-10 max-w-md">
            <div className="rounded-2xl border-2 border-amber-200 bg-gradient-to-b from-amber-50 to-white p-8 shadow-lg">
              <div className="text-center">
                <span className="inline-block rounded-full bg-amber-200 px-3 py-1 text-xs font-bold uppercase tracking-wider text-amber-800">
                  Best Value
                </span>
                <h3 className="mt-4 text-2xl font-bold text-gray-900">Premium</h3>
                <div className="mt-2">
                  <span className="text-4xl font-extrabold text-gray-900">$9.99</span>
                  <span className="text-gray-500">/month</span>
                </div>
                <ul className="mt-6 space-y-3 text-left text-sm text-gray-600">
                  {[
                    "Unlimited AI trip plans",
                    "Priority customer support",
                    "Group & multi-city trips",
                    "Restaurant reservations",
                    "Exclusive hotel deals",
                  ].map((feature) => (
                    <li key={feature} className="flex items-center gap-2">
                      <svg className="h-4 w-4 shrink-0 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
                <a
                  href="https://buy.stripe.com/aFa5kC7sf5r6ej27RX4F201"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-8 inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-gradient-to-r from-amber-500 to-orange-600 px-8 py-3.5 text-base font-bold text-white shadow-xl transition-all hover:from-amber-600 hover:to-orange-700 hover:shadow-2xl hover:scale-105 active:scale-95"
                >
                  Go Premium — $9.99/mo
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-br from-indigo-600 to-purple-700 px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-balance text-3xl font-bold text-white sm:text-4xl">
            Ready to plan your next adventure?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-indigo-100">
            Stop researching. Start packing. VoyageAI handles the planning so
            you can focus on the experience.
          </p>
          <a
            href="/plan"
            className="mt-8 inline-flex cursor-pointer items-center gap-2 rounded-full bg-white px-8 py-3.5 text-base font-bold text-indigo-700 shadow-xl transition-all hover:bg-indigo-50 hover:shadow-2xl hover:scale-105 active:scale-95"
          >
            Plan Your Trip Free
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 7l5 5m0 0l-5 5m5-5H6"
              />
            </svg>
          </a>
        </div>
      </section>
    </div>
  );
}