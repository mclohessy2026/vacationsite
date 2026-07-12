import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/about")({
  component: AboutPage,
});

function AboutPage() {
  return (
    <div className="min-h-dvh bg-white pt-24">
      {/* Hero */}
      <section className="bg-gradient-to-br from-indigo-950 via-indigo-900 to-purple-900 px-4 py-20 text-center text-white">
        <div className="mx-auto max-w-3xl">
          <span className="inline-block rounded-full bg-white/10 px-4 py-1.5 text-sm font-semibold text-indigo-200 backdrop-blur-sm">
            About VoyageAI
          </span>
          <h1 className="mt-4 text-balance text-4xl font-extrabold tracking-tight sm:text-5xl">
            Planning your trip should be <span className="text-indigo-300">exciting</span>, not exhausting
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-indigo-200">
            We built VoyageAI because we love to travel — but we hate planning. The tabs, the
            spreadsheets, the "what if I pick the wrong hotel?" anxiety. So we fixed it.
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <div className="grid gap-12 md:grid-cols-2">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">
                Our Mission
              </h2>
              <p className="mt-4 leading-relaxed text-gray-600">
                We believe that technology should make life simpler, not add another layer of
                complexity. When it comes to travel, the research phase has become overwhelming —
                dozens of tabs, conflicting reviews, and fear of missing out on the "perfect" option.
              </p>
              <p className="mt-4 leading-relaxed text-gray-600">
                VoyageAI replaces all of that with a single conversation. Tell us where, when, and
                what you love — we handle the rest. Our AI crafts a complete, personalized itinerary
                that you can book in one place. No research, no coordination, no overwhelm.
              </p>
            </div>
            <div className="rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50 p-8">
              <h3 className="text-lg font-bold text-gray-900">Why travelers choose us</h3>
              <ul className="mt-6 space-y-4">
                {[
                  { icon: "⏱️", title: "Save hours of research", desc: "Average trip planned in under 5 minutes" },
                  { icon: "🎯", title: "Truly personalized", desc: "AI that learns your taste, not generic lists" },
                  { icon: "📋", title: "One complete plan", desc: "Flights, hotels, dining, activities — all in one place" },
                  { icon: "🔄", title: "Tweak anytime", desc: "Change your preferences and get a new plan instantly" },
                ].map((item) => (
                  <li key={item.title} className="flex gap-3">
                    <span className="mt-0.5 text-xl">{item.icon}</span>
                    <div>
                      <div className="font-semibold text-gray-900">{item.title}</div>
                      <div className="text-sm text-gray-500">{item.desc}</div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-gray-50 px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-center text-3xl font-bold text-gray-900 sm:text-4xl">
            How VoyageAI works
          </h2>
          <div className="mt-12 space-y-8">
            {[
              {
                step: "01",
                title: "Tell us where & when",
                desc: "Enter your destination and travel dates. Want to go to Nashville next weekend? We've got you.",
              },
              {
                step: "02",
                title: "Answer a few quick questions",
                desc: "Budget, vibe, pace, who's coming, and your interests. Takes about 60 seconds — no essay required.",
              },
              {
                step: "03",
                title: "Get your AI-crafted itinerary",
                desc: "A complete day-by-day plan with flight, hotel, restaurant, and activity recommendations tailored to you.",
              },
              {
                step: "04",
                title: "Book with confidence",
                desc: "Review your plan, tweak as needed, and book everything through our trusted partners.",
              },
            ].map((item) => (
              <div
                key={item.step}
                className="flex gap-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-lg font-bold text-indigo-600">
                  {item.step}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{item.title}</h3>
                  <p className="mt-1 text-gray-600">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team / Values */}
      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            Built for travelers, by travelers
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600">
            We're a small team passionate about making travel accessible and stress-free. Our AI
            combines local expertise with data-driven recommendations to help you discover the best
            experiences, no matter your budget or style.
          </p>
          <div className="mt-12 grid gap-6 sm:grid-cols-3">
            {[
              { icon: "🌍", title: "25+ destinations", desc: "Covering major US cities and growing" },
              { icon: "🤖", title: "Smart AI engine", desc: "Learns your preferences over time" },
              { icon: "💎", title: "Curated quality", desc: "Every recommendation is vetted" },
            ].map((v) => (
              <div key={v.title} className="rounded-xl border border-gray-100 bg-white p-6">
                <span className="text-3xl">{v.icon}</span>
                <h3 className="mt-3 font-bold text-gray-900">{v.title}</h3>
                <p className="mt-1 text-sm text-gray-500">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-br from-indigo-600 to-purple-700 px-4 py-20 text-center text-white">
        <div className="mx-auto max-w-2xl">
          <h2 className="text-3xl font-bold sm:text-4xl">
            Ready to plan your next adventure?
          </h2>
          <p className="mt-4 text-lg text-indigo-100">
            Skip the research. Let VoyageAI build your perfect trip.
          </p>
          <a
            href="/plan"
            className="mt-8 inline-block cursor-pointer rounded-full bg-white px-8 py-3.5 text-base font-bold text-indigo-700 shadow-xl transition-all hover:bg-indigo-50 hover:shadow-2xl hover:scale-105"
          >
            Plan Your Trip Free
          </a>
        </div>
      </section>
    </div>
  );
}