import { NavLink } from "react-router-dom";

/* ─── Shared Navbar — used across all authenticated pages ─────────────── */
export default function Navbar() {
  return (
    <nav
      className="sticky top-0 z-50 bg-[#0f0f11]/85 backdrop-blur-xl border-b border-white/[0.07]"
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="relative flex items-center max-w-[1440px] mx-auto px-6 h-[60px]">

        {/* Brand */}
        <NavLink to="/home" className="flex items-center gap-2.5 flex-shrink-0 no-underline" aria-label="VideoTB Home">
          <span className="text-[1.2rem] font-bold tracking-tight bg-gradient-to-r from-violet-500 to-violet-300 bg-clip-text text-transparent">
            VideoTB
          </span>
        </NavLink>

        {/* Search — centred */}
        <div
          role="search"
          className="absolute left-1/2 -translate-x-1/2 w-full max-w-[540px] flex items-center bg-[#18181c] border border-white/[0.07] rounded-full overflow-hidden transition-all duration-200 focus-within:border-violet-500/60 focus-within:shadow-[0_0_0_3px_rgba(124,58,237,0.25)]"
        >
          <input
            id="search-input"
            type="search"
            placeholder="Search videos..."
            aria-label="Search videos"
            className="flex-1 bg-transparent border-none outline-none px-5 py-2.5 text-sm text-white placeholder-zinc-600"
          />
          <button
            type="button"
            aria-label="Submit search"
            className="flex items-center px-4 py-2.5 text-zinc-500 hover:text-violet-300 transition-colors duration-150 bg-transparent border-none cursor-pointer"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18" aria-hidden="true">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
          </button>
        </div>

        {/* Right-side actions */}
        <div className="ml-auto flex items-center gap-2.5 flex-shrink-0">
          <NavLink
            to="/profile"
            className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium text-zinc-400 border border-white/[0.07] hover:text-white hover:border-white/20 hover:bg-[#2a2a32] transition-all duration-200 no-underline"
          >
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Profile
          </NavLink>
        </div>

      </div>
    </nav>
  );
}
