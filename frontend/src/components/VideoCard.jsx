import { useState } from "react";

/**
 * Formats a duration in seconds to MM:SS or H:MM:SS
 */
function formatDuration(seconds) {
  if (!seconds && seconds !== 0) return "";
  const s = Math.floor(seconds);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h > 0) {
    return `${h}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  }
  return `${m}:${String(sec).padStart(2, "0")}`;
}

/**
 * Formats a view count to a compact string (e.g. 1.2K, 3.4M)
 */
function formatViews(views) {
  if (!views && views !== 0) return "0 views";
  if (views >= 1_000_000) return `${(views / 1_000_000).toFixed(1)}M views`;
  if (views >= 1_000) return `${(views / 1_000).toFixed(1)}K views`;
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

  return (
    <article className="video-card" tabIndex={0} aria-label={title}>
      {/* ── Thumbnail ─────────────────────────────────────────── */}
      <a href={videoFile} target="_blank" rel="noopener noreferrer" className="thumbnail-link">
        <div className="thumbnail-wrapper">
          {thumbnail && !imgError ? (
            <img
              src={thumbnail}
              alt={title}
              className="thumbnail-img"
              onError={() => setImgError(true)}
              loading="lazy"
            />
          ) : (
            <div className="thumbnail-placeholder">
              <svg viewBox="0 0 24 24" fill="currentColor" width="40" height="40">
                <path d="M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zm6.5 4.5v7l5-3.5-5-3.5z" />
              </svg>
            </div>
          )}

          {/* Duration badge */}
          {duration !== undefined && duration !== null && (
            <span className="duration-badge">{formatDuration(duration)}</span>
          )}

          {/* Play overlay on hover */}
          <div className="play-overlay" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="currentColor" width="48" height="48">
              <circle cx="12" cy="12" r="12" fill="rgba(0,0,0,0.55)" />
              <path d="M10 8l6 4-6 4V8z" fill="white" />
            </svg>
          </div>
        </div>
      </a>

      {/* ── Meta ──────────────────────────────────────────────── */}
      <div className="video-meta">
        {/* Avatar */}
        <div className="avatar" aria-hidden="true">
          {owner?.avatar ? (
            <img src={owner.avatar} alt={owner?.username || "User"} />
          ) : (
            <span>{(owner?.username || "U")[0].toUpperCase()}</span>
          )}
        </div>

        <div className="video-info">
          <h3 className="video-title" title={title}>{title}</h3>
          <p className="video-channel">{owner?.username || "Unknown"}</p>
          <p className="video-stats">{formatViews(views)}</p>
        </div>
      </div>
    </article>
  );
}
