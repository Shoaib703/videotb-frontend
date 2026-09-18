import { NavLink } from "react-router-dom";

/* ─── Shared Sidebar — used across all authenticated pages ────────────── */
export default function Sidebar() {
  const linkClass = ({ isActive }) =>
    `flex items-center gap-3.5 px-3.5 py-2.5 rounded-lg text-sm font-medium no-underline transition-all duration-200
    ${isActive
      ? "bg-violet-500/12 text-violet-300"
      : "text-zinc-400 hover:bg-[#2a2a32] hover:text-white"
    }`;

  return (
    <aside
      className="w-[220px] flex-shrink-0 sticky top-[60px] h-[calc(100vh-60px)] overflow-y-auto bg-[#0f0f11] border-r border-white/[0.07] py-3 px-2"
      aria-label="Side navigation"
    >
      <nav className="flex flex-col gap-0.5">

        {/* Home */}
        <NavLink to="/home" id="sidebar-home" className={linkClass}>
          <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
          </svg>
          <span className="truncate">Home</span>
        </NavLink>

        {/* Profile */}
        <NavLink to="/profile" id="sidebar-profile" className={linkClass}>
          <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <span className="truncate">My Profile</span>
        </NavLink>

      </nav>
    </aside>
  );
}
