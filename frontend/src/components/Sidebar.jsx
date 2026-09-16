import { NavLink } from "react-router-dom";

/* ─── Shared Sidebar — used across all authenticated pages ────────────── */
export default function Sidebar() {
  return (
    <aside className="sidebar" aria-label="Side navigation">
      <nav className="sidebar-nav">

        {/* Home */}
        <NavLink
          to="/home"
          id="sidebar-home"
          className={({ isActive }) =>
            `sidebar-item${isActive ? " sidebar-item--active" : ""}`
          }
        >
          <svg className="sidebar-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
          </svg>
          <span className="sidebar-label">Home</span>
        </NavLink>

        {/* Future nav items go here */}

      </nav>
    </aside>
  );
}
