"use client";

import React, { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import "./ThemeToggle.css";

/**
 * Premium animated Day/Night theme toggle button.
 * Features a celestial orb that morphs between sun and moon
 * with smooth CSS transitions, crater details, and ray animations.
 */
export default function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    // Render a placeholder with same dimensions to prevent layout shift
    return (
      <button
        className="theme-toggle-btn"
        aria-label="Toggle theme"
        type="button"
        style={{ width: 40, height: 40 }}
      />
    );
  }

  const isDark = resolvedTheme === "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={`theme-toggle-btn ${isDark ? "theme-toggle--dark" : "theme-toggle--light"}`}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      <div className="theme-toggle__track">
        {/* Sky background elements */}
        <div className="theme-toggle__stars">
          <span className="theme-toggle__star" style={{ top: '20%', left: '15%', animationDelay: '0s' }} />
          <span className="theme-toggle__star" style={{ top: '55%', left: '70%', animationDelay: '0.4s' }} />
          <span className="theme-toggle__star" style={{ top: '30%', left: '80%', animationDelay: '0.8s' }} />
          <span className="theme-toggle__star" style={{ top: '70%', left: '25%', animationDelay: '1.2s' }} />
          <span className="theme-toggle__star" style={{ top: '15%', left: '55%', animationDelay: '0.6s' }} />
        </div>

        {/* Cloud elements for light mode */}
        <div className="theme-toggle__clouds">
          <span className="theme-toggle__cloud theme-toggle__cloud--1" />
          <span className="theme-toggle__cloud theme-toggle__cloud--2" />
        </div>

        {/* The celestial orb (sun/moon) */}
        <div className="theme-toggle__orb">
          {/* Sun rays (visible in light mode) */}
          <div className="theme-toggle__rays">
            {[...Array(8)].map((_, i) => (
              <span
                key={i}
                className="theme-toggle__ray"
                style={{ transform: `rotate(${i * 45}deg)` }}
              />
            ))}
          </div>

          {/* Moon craters (visible in dark mode) */}
          <div className="theme-toggle__craters">
            <span className="theme-toggle__crater" style={{ top: '25%', left: '55%', width: 4, height: 4 }} />
            <span className="theme-toggle__crater" style={{ top: '50%', left: '30%', width: 3, height: 3 }} />
            <span className="theme-toggle__crater" style={{ top: '65%', left: '60%', width: 2.5, height: 2.5 }} />
          </div>
        </div>
      </div>
    </button>
  );
}
