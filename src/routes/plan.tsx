import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import { useState } from "react";

interface PlanSearch {
  destination?: string;
  startDate?: string;
  endDate?: string;
}

export const Route = createFileRoute("/plan")({
  validateSearch: (search: Record<string, unknown>): PlanSearch => ({
    destination: typeof search.destination === "string" ? search.destination : "",
    startDate: typeof search.startDate === "string" ? search.startDate : "",
    endDate: typeof search.endDate === "string" ? search.endDate : "",
  }),
  component: PlanPage,
});

const budgets = [
  { id: "economy", label: "Economy", desc: "Budget-friendly stays and activities", icon: "💰" },
  { id: "mid-range", label: "Mid-Range", desc: "Comfortable with some splurges", icon: "💎" },
  { id: "luxury", label: "Luxury", desc: "Top-tier experiences and premium stays", icon: "👑" },
];

const vibes = [
  { id: "relaxed", label: "Relaxed", desc: "Spa days, beaches, slow mornings", icon: "🧘" },
  { id: "adventurous", label: "Adventurous", desc: "Hiking, extreme sports, exploration", icon: "🏔️" },
  { id: "cultural", label: "Cultural", desc: "Museums, history, local traditions", icon: "🏛️" },
  { id: "foodie", label: "Foodie", desc: "Culinary tours & local cuisine", icon: "🍽️" },
  { id: "mixed", label: "Mixed", desc: "A bit of everything", icon: "🎯" },
];

const paces = [
  { id: "packed", label: "Packed", desc: "Maximize every moment", icon: "⚡" },
  { id: "balanced", label: "Balanced", desc: "Sights with downtime", icon: "⚖️" },
  { id: "slow", label: "Slow & Easy", desc: "Take it at your own pace", icon: "🌿" },
];

const travelerTypes = [
  { id: "solo", label: "Solo", desc: "Just me", icon: "🧑" },
  { id: "couple", label: "Couple", desc: "Romantic getaway", icon: "💑" },
  { id: "family", label: "Family", desc: "With kids & family", icon: "👨‍👩‍👧‍👦" },
  { id: "group", label: "Group", desc: "Friends trip", icon: "👥" },
];

const interestOptions = [
  { id: "food", label: "Food & Dining", icon: "🍽️" },
  { id: "outdoors", label: "Outdoors & Nature", icon: "🌲" },
  { id: "arts", label: "Arts & Culture", icon: "🎨" },
  { id: "nightlife", label: "Nightlife", icon: "🌙" },
  { id: "shopping", label: "Shopping", icon: "🛍️" },
  { id: "history", label: "History & Museums", icon: "🏛️" },
  { id: "wellness", label: "Wellness & Spa", icon: "🧖" },
  { id: "sports", label: "Sports & Fitness", icon: "🏋️" },
  { id: "music", label: "Music & Concerts", icon: "🎵" },
  { id: "education", label: "Educational", icon: "📚" },
];

const steps = [
  { id: "budget", title: "Budget", subtitle: "How much are you looking to spend?" },
  { id: "vibe", title: "Vibe", subtitle: "What's your travel style?" },
  { id: "pace", title: "Pace", subtitle: "How do you like to travel?" },
  { id: "travelers", title: "Travelers", subtitle: "Who's coming along?" },
  { id: "interests", title: "Interests", subtitle: "What do you love doing?" },
];

function PlanPage() {
  const navigate = useNavigate();
  const search = useSearch({ from: "/plan" });
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState<"forward" | "back">("forward");

  const [budget, setBudget] = useState("");
  const [vibe, setVibe] = useState("");
  const [pace, setPace] = useState("");
  const [travelers, setTravelers] = useState("");
  const [interests, setInterests] = useState<string[]>([]);

  const totalSteps = steps.length;
  const progress = ((step + 1) / totalSteps) * 100;

  const canProceed = () => {
    switch (step) {
      case 0: return budget !== "";
      case 1: return vibe !== "";
      case 2: return pace !== "";
      case 3: return travelers !== "";
      case 4: return interests.length > 0;
      default: return false;
    }
  };

  const goNext = () => {
    if (step < totalSteps - 1) {
      setDirection("forward");
      setStep(step + 1);
    } else {
      // Submit - navigate to itinerary
      navigate({
        to: "/itinerary",
        search: {
          destination: search.destination,
          startDate: search.startDate,
          endDate: search.endDate,
          budget,
          vibe,
          pace,
          travelers,
          interests: interests.join(","),
        },
      });
    }
  };

  const goBack = () => {
    if (step > 0) {
      setDirection("back");
      setStep(step - 1);
    } else {
      navigate({ to: "/" });
    }
  };

  const toggleInterest = (id: string) => {
    setInterests((prev) =>
      prev.includes(id)
        ? prev.filter((i) => i !== id)
        : prev.length < 5
          ? [...prev, id]
          : prev,
    );
  };

  return (
    <div className="min-h-dvh bg-gradient-to-br from-indigo-50 via-white to-purple-50 pt-24">
      <div className="mx-auto max-w-3xl px-4 pb-24 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <div className="mb-8">
          <button
            onClick={goBack}
            className="mb-4 flex cursor-pointer items-center gap-1 text-sm font-medium text-gray-500 transition-colors hover:text-gray-900"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>

          {/* Trip Info */}
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-700">
              {search.destination || "Pick a destination"}
            </span>
            {search.startDate && (
              <span className="text-sm text-gray-500">
                {new Date(search.startDate).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}{" "}
                –{" "}
                {new Date(search.endDate).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              Step {step + 1} of {totalSteps}
            </span>
            <span className="text-sm text-gray-500">
              {steps[step].title}
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-gray-200">
            <div
              className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Step Card */}
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl">
          <div className="p-8 sm:p-10">
            {/* Step Label */}
            <span className="inline-block rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-700">
              {steps[step].title}
            </span>
            <h2 className="mt-3 text-2xl font-bold text-gray-900 sm:text-3xl">
              {steps[step].subtitle}
            </h2>
            <p className="mt-2 text-gray-600">
              {step === 0 && "Choose a budget range that works for you. We'll tailor recommendations accordingly."}
              {step === 1 && "Pick the travel style that matches your ideal experience."}
              {step === 2 && "Do you want to pack your schedule or keep it loose?"}
              {step === 3 && "Let us know who you're traveling with."}
              {step === 4 && "Select up to 5 interests to personalize your itinerary."}
            </p>

            {/* Content Area */}
            <div className="mt-8">
              {/* Budget */}
              {step === 0 && (
                <div className="grid gap-4 sm:grid-cols-3">
                  {budgets.map((b) => (
                    <button
                      key={b.id}
                      onClick={() => setBudget(b.id)}
                      className={`cursor-pointer rounded-xl border-2 p-5 text-left transition-all ${
                        budget === b.id
                          ? "border-indigo-500 bg-indigo-50 shadow-md"
                          : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm"
                      }`}
                    >
                      <span className="text-3xl">{b.icon}</span>
                      <h3 className={`mt-3 font-bold ${budget === b.id ? "text-indigo-700" : "text-gray-900"}`}>
                        {b.label}
                      </h3>
                      <p className="mt-1 text-sm text-gray-500">{b.desc}</p>
                    </button>
                  ))}
                </div>
              )}

              {/* Vibe */}
              {step === 1 && (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {vibes.map((v) => (
                    <button
                      key={v.id}
                      onClick={() => setVibe(v.id)}
                      className={`cursor-pointer rounded-xl border-2 p-5 text-left transition-all ${
                        vibe === v.id
                          ? "border-indigo-500 bg-indigo-50 shadow-md"
                          : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm"
                      }`}
                    >
                      <span className="text-3xl">{v.icon}</span>
                      <h3 className={`mt-3 font-bold ${vibe === v.id ? "text-indigo-700" : "text-gray-900"}`}>
                        {v.label}
                      </h3>
                      <p className="mt-1 text-sm text-gray-500">{v.desc}</p>
                    </button>
                  ))}
                </div>
              )}

              {/* Pace */}
              {step === 2 && (
                <div className="grid gap-4 sm:grid-cols-3">
                  {paces.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setPace(p.id)}
                      className={`cursor-pointer rounded-xl border-2 p-5 text-left transition-all ${
                        pace === p.id
                          ? "border-indigo-500 bg-indigo-50 shadow-md"
                          : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm"
                      }`}
                    >
                      <span className="text-3xl">{p.icon}</span>
                      <h3 className={`mt-3 font-bold ${pace === p.id ? "text-indigo-700" : "text-gray-900"}`}>
                        {p.label}
                      </h3>
                      <p className="mt-1 text-sm text-gray-500">{p.desc}</p>
                    </button>
                  ))}
                </div>
              )}

              {/* Travelers */}
              {step === 3 && (
                <div className="grid gap-4 sm:grid-cols-2">
                  {travelerTypes.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setTravelers(t.id)}
                      className={`cursor-pointer rounded-xl border-2 p-6 text-left transition-all ${
                        travelers === t.id
                          ? "border-indigo-500 bg-indigo-50 shadow-md"
                          : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm"
                      }`}
                    >
                      <span className="text-4xl">{t.icon}</span>
                      <h3 className={`mt-3 text-lg font-bold ${travelers === t.id ? "text-indigo-700" : "text-gray-900"}`}>
                        {t.label}
                      </h3>
                      <p className="mt-1 text-sm text-gray-500">{t.desc}</p>
                    </button>
                  ))}
                </div>
              )}

              {/* Interests */}
              {step === 4 && (
                <div>
                  <p className="mb-2 text-sm text-gray-500">
                    Selected {interests.length}/5
                  </p>
                  <div className="flex flex-wrap gap-3">
                    {interestOptions.map((i) => (
                      <button
                        key={i.id}
                        onClick={() => toggleInterest(i.id)}
                        className={`cursor-pointer rounded-full border-2 px-4 py-2.5 text-sm font-medium transition-all ${
                          interests.includes(i.id)
                            ? "border-indigo-500 bg-indigo-50 text-indigo-700 shadow-sm"
                            : "border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:shadow-sm"
                        } ${interests.length >= 5 && !interests.includes(i.id) ? "opacity-40 cursor-not-allowed" : ""}`}
                      >
                        <span className="mr-1.5">{i.icon}</span>
                        {i.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between border-t border-gray-100 bg-gray-50/50 px-8 py-4 sm:px-10">
            <button
              onClick={goBack}
              className="cursor-pointer rounded-lg px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
            >
              {step === 0 ? "Change Destination" : "Previous"}
            </button>
            <button
              onClick={goNext}
              disabled={!canProceed()}
              className={`cursor-pointer rounded-xl px-6 py-2.5 text-sm font-bold transition-all ${
                canProceed()
                  ? "bg-gradient-to-r from-indigo-600 to-purple-700 text-white shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/30 hover:scale-[1.02] active:scale-[0.98]"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
              }`}
            >
              {step < totalSteps - 1 ? "Continue" : "Generate My Itinerary"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}