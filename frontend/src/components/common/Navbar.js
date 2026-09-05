"use client";

/**
 * EarthPulse AI — Modern Scientific Editorial Navigation
 * Clean white substrate, subtle slate borders, sleek navigation pills, emerald primary CTA.
 */

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { ArrowUpRight, Activity, Menu, X } from "lucide-react";
import { HealthBadge } from "./HealthBadge";

export function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const primaryLinks = [
    { href: "/explore", label: "Explore", isPrimary: true },
    { href: "/insights", label: "Insights" },
    { href: "/compare", label: "Compare" },
    { href: "/timeline", label: "Timeline" }
  ];

  const secondaryLinks = [
    { href: "/about", label: "About" },
    { href: "/settings", label: "Settings" }
  ];

  const allLinks = [...primaryLinks, ...secondaryLinks];

  const isLinkActive = (link) =>
    pathname === link.href ||
    (link.href !== "/explore" && pathname.startsWith(`${link.href}/`)) ||
    (link.href === "/explore" && pathname === "/explore");

  const pillLinkClass = (link) => {
    const isActive = isLinkActive(link);
    return clsx(
      "px-3 py-1.5 rounded-md text-xs font-medium transition-all select-none",
      link.isPrimary && !isActive
        ? "bg-emerald-600 text-white font-semibold shadow-sm hover:bg-emerald-700"
        : link.isPrimary && isActive
          ? "bg-emerald-700 text-white font-semibold shadow-sm"
          : isActive
            ? "bg-white text-slate-900 font-semibold shadow-sm border border-slate-200/60"
            : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
    );
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/80 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Mark */}
        <Link href="/" className="flex items-center gap-3 group select-none flex-shrink-0">
          <div className="w-8 h-8 bg-emerald-600 text-white font-display font-bold text-sm flex items-center justify-center rounded-lg shadow-sm group-hover:bg-emerald-700 transition-colors flex-shrink-0">
            EP
          </div>
          <div>
            <div className="flex items-center gap-1.5 whitespace-nowrap">
              <span className="font-display font-bold text-[17px] tracking-tight text-slate-900">EarthPulse</span>
              <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200/80 rounded-md">
                AI
              </span>
            </div>
            <div className="text-[10px] text-slate-500 font-medium tracking-wide whitespace-nowrap">
              Regional change intelligence
            </div>
          </div>
        </Link>

        {/* Center Primary Navigation */}
        <nav aria-label="Primary" className="hidden md:flex items-center gap-1 bg-slate-100/70 p-1 rounded-lg border border-slate-200/60">
          {primaryLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={isLinkActive(link) ? "page" : undefined}
              className={pillLinkClass(link)}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Secondary Navigation */}
        <nav aria-label="Secondary" className="hidden lg:flex items-center gap-1">
          {secondaryLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={isLinkActive(link) ? "page" : undefined}
              className={clsx(
                "px-2.5 py-1.5 rounded-md text-xs transition-colors select-none",
                isLinkActive(link)
                  ? "text-slate-900 font-semibold underline underline-offset-4 decoration-emerald-500"
                  : "text-slate-500 hover:text-slate-900"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right CTA & Health Status */}
        <div className="flex items-center gap-2 sm:gap-3">
          <HealthBadge />
          <Link
            href="/explore"
            className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-sans text-xs font-semibold tracking-wide shadow-sm hover:shadow transition-all"
          >
            <span>Explore Pilot</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
          {/* Mobile menu toggle */}
          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label={mobileOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={mobileOpen}
            aria-controls="mobile-nav"
            className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Panel */}
      {mobileOpen && (
        <nav id="mobile-nav" aria-label="Mobile" className="md:hidden border-t border-slate-200/80 bg-white px-4 py-3 space-y-4">
          <div>
            <p className="px-3 pb-1.5 text-[10px] font-mono uppercase tracking-wider text-slate-400">Workspace</p>
            <ul className="space-y-1">
              {primaryLinks.map((link) => {
                const isActive = isLinkActive(link);
                return (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      onClick={() => setMobileOpen(false)}
                      aria-current={isActive ? "page" : undefined}
                      className={clsx(
                        "flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                        isActive
                          ? "bg-emerald-50 text-emerald-900 border border-emerald-200 font-semibold"
                          : "text-slate-700 hover:bg-slate-50 border border-transparent"
                      )}
                    >
                      <span>
                        {link.label}
                        {link.isPrimary && (
                          <span className="ml-2 text-[10px] font-mono uppercase tracking-wider text-emerald-700">Primary</span>
                        )}
                      </span>
                      <ArrowUpRight className="w-4 h-4 text-slate-400" />
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
          <div>
            <p className="px-3 pb-1.5 text-[10px] font-mono uppercase tracking-wider text-slate-400">More</p>
            <ul className="space-y-1">
              {secondaryLinks.map((link) => {
                const isActive = isLinkActive(link);
                return (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      onClick={() => setMobileOpen(false)}
                      aria-current={isActive ? "page" : undefined}
                      className={clsx(
                        "flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors",
                        isActive
                          ? "bg-slate-100 text-slate-900 font-semibold"
                          : "text-slate-600 hover:bg-slate-50"
                      )}
                    >
                      <span>{link.label}</span>
                      <ArrowUpRight className="w-4 h-4 text-slate-400" />
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </nav>
      )}
    </header>
  );
}
