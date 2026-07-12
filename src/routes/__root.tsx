import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRoute,
} from "@tanstack/react-router";
import type { ReactNode } from "react";

import appCss from "~/styles/app.css?url";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "VoyageAI — AI-Powered Trip Planning" },
      {
        name: "description",
        content:
          "Tell VoyageAI where and when you want to go, and it plans the entire trip for you. No research, no coordination, no overwhelm.",
      },
    ],
    links: [{ rel: "stylesheet", href: appCss }],
  }),
  notFoundComponent: () => (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 className="text-6xl font-bold text-indigo-600">404</h1>
      <p className="text-lg text-gray-600">Page not found</p>
      <a
        href="/"
        className="rounded-full bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-700"
      >
        Go home
      </a>
    </div>
  ),
  component: RootComponent,
});

function RootComponent() {
  return (
    <RootDocument>
      <Outlet />
    </RootDocument>
  );
}

function RootDocument({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        <Nav />
        <main>{children}</main>
        <Footer />
        <Scripts />
      </body>
    </html>
  );
}

function Nav() {
  return (
    <header className="fixed top-0 z-50 w-full border-b border-gray-100/80 bg-white/80 backdrop-blur-lg">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <a
          href="/"
          className="flex items-center gap-2 text-xl font-bold tracking-tight text-gray-900"
        >
          <svg
            viewBox="0 0 32 32"
            className="h-7 w-7 text-indigo-600"
            fill="currentColor"
          >
            <path d="M16 2C8.268 2 2 8.268 2 16s6.268 14 14 14 14-6.268 14-14S23.732 2 16 2zm6.75 11.5c0 3.452-2.798 6.25-6.25 6.25s-6.25-2.798-6.25-6.25S13.048 9.25 16 9.25s6.25 2.798 6.25 6.25zM16 24c-2.28 0-4.38-.76-6.05-2.03l1.42-1.42A6.95 6.95 0 0016 22a6.95 6.95 0 004.63-1.45l1.42 1.42A9.93 9.93 0 0116 24z" />
          </svg>
          VoyageAI
        </a>
        <nav className="hidden items-center gap-8 sm:flex">
          <a
            href="/"
            className="text-sm font-medium text-gray-600 transition-colors hover:text-gray-900"
          >
            Home
          </a>
          <a
            href="/plan"
            className="text-sm font-medium text-gray-600 transition-colors hover:text-gray-900"
          >
            Plan a Trip
          </a>
          <a
            href="/about"
            className="text-sm font-medium text-gray-600 transition-colors hover:text-gray-900"
          >
            About
          </a>
        </nav>
        <a
          href="/plan"
          className="rounded-full bg-indigo-600 px-5 py-2 text-sm font-semibold text-white transition-all hover:bg-indigo-700 hover:shadow-lg"
        >
          Get Started
        </a>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="border-t border-gray-100 bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
          <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
            <svg
              viewBox="0 0 32 32"
              className="h-5 w-5 text-indigo-600"
              fill="currentColor"
            >
              <path d="M16 2C8.268 2 2 8.268 2 16s6.268 14 14 14 14-6.268 14-14S23.732 2 16 2zm6.75 11.5c0 3.452-2.798 6.25-6.25 6.25s-6.25-2.798-6.25-6.25S13.048 9.25 16 9.25s6.25 2.798 6.25 6.25zM16 24c-2.28 0-4.38-.76-6.05-2.03l1.42-1.42A6.95 6.95 0 0016 22a6.95 6.95 0 004.63-1.45l1.42 1.42A9.93 9.93 0 0116 24z" />
            </svg>
            VoyageAI
          </div>
          <p className="text-sm text-gray-500">
            &copy; {new Date().getFullYear()} VoyageAI. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}