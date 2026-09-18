import { useState } from "react";

function formatDuration(seconds) {
  if (!seconds && seconds !== 0) return "";
  const s = Math.floor(seconds);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  return `${m}:${String(sec).padStart(2, "0")}`;
}

function formatViews(views) {
  if (!views && views !== 0) return "0 views";
  if (views >= 1_000_000) return `${(views / 1_000_000).toFixed(1)}M views`;
  if (views >= 1_000)     return `${(views / 1_000).toFixed(1)}K views`;
  return `${views} views`;
}

export default function VideoCard({ video }) {
  const [imgError, setImgError] = useState(false);

  const {
    thumbnail,
    videoFile,
    duration,
    title = "Untitled Video",
    views = 0,
    owner,
  } = video || {};

  const initial = (owner?.username || "U")[0].toUpperCase();

  return (
    <article
      tabIndex={0}
      aria-label={title}
      className="group bg-[#18181c] border border-white/[0.07] rounded-xl overflow-hidden cursor-pointer outline-none transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_4px_24px_rgba(0,0,0,0.5)] hover:border-violet-500/30 focus-visible:border-violet-500/50"
    >
      {/* Thumbnail */}
      <a href={videoFile} target="_blank" rel="noopener noreferrer" className="block">
        <div className="relative w-full aspect-video overflow-hidden bg-[#222228]">
          {thumbnail && !imgError ? (
            <img
              src={thumbnail}
              alt={title}
              className="w-full h-full object-cover block transition-all duration-300 group-hover:scale-105 group-hover:brightness-75"
              onError={() => setImgError(true)}
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-zinc-600">
              <svg viewBox="0 0 24 24" fill="currentColor" width="40" height="40" aria-hidden="true">
                <path d="M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zm6.5 4.5v7l5-3.5-5-3.5z" />
              </svg>
            </div>
          )}

          {/* Duration badge */}
          {duration !== undefined && duration !== null && (
            <span className="absolute bottom-2 right-2 bg-black/80 text-white text-[11px] font-semibold px-1.5 py-0.5 rounded backdrop-blur-sm">
              {formatDuration(duration)}
            </span>
          )}

          {/* Play overlay */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="currentColor" width="48" height="48">
              <circle cx="12" cy="12" r="12" fill="rgba(0,0,0,0.55)" />
              <path d="M10 8l6 4-6 4V8z" fill="white" />
            </svg>
          </div>
        </div>
      </a>

      {/* Meta */}
      <div className="flex gap-3 p-3">
        {/* Avatar */}
        <div
          aria-hidden="true"
          className="flex-shrink-0 w-9 h-9 rounded-full bg-gradient-to-br from-violet-600 to-blue-600 flex items-center justify-center text-white text-sm font-bold overflow-hidden mt-0.5"
        >
          {owner?.avatar
            ? <img src={owner.avatar} alt={owner?.username || "User"} className="w-full h-full object-cover" />
            : <span>{initial}</span>}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h3
            title={title}
            className="text-sm font-semibold text-white leading-snug line-clamp-2 mb-1"
          >
            {title}
          </h3>
          <p className="text-xs text-zinc-400 truncate mb-0.5">{owner?.username || "Unknown"}</p>
          <p className="text-xs text-zinc-600">{formatViews(views)}</p>
        </div>
      </div>
    </article>
  );
}
