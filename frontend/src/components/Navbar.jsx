/* ─── Shared Navbar — used across all authenticated pages ─────────────── */
export default function Navbar() {
  return (
    <nav className="navbar" role="navigation" aria-label="Main navigation">
      <div className="navbar-inner">
        {/* Brand */}
        <a href="/home" className="brand" aria-label="VideoTB Home">
          <span className="brand-name">VideoTB</span>
        </a>

        {/* Search bar */}
        <div className="search-wrapper" role="search">
          <input
            id="search-input"
            className="search-input"
            type="search"
            placeholder="Search videos..."
            aria-label="Search videos"
          />
          <button className="search-btn" aria-label="Submit search" type="button">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18" aria-hidden="true">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
          </button>
        </div>
      </div>
    </nav>
  );
}
