import { useState } from "react";
import { Link } from "react-router-dom";

export default function VideoTile({ videoId, title = "Untitled", thumbnail }) {
  const [imgError, setImgError] = useState(false);

  return (
    <Link
      to={videoId ? `/video/${videoId}` : "#"}
      className="block group bg-[#18181c] border border-white/[0.07] rounded-xl overflow-hidden hover:border-red-500/40 hover:-translate-y-1 hover:shadow-[0_4px_24px_rgba(0,0,0,0.5)] transition-all duration-200 cursor-pointer no-underline"
    >
      <div className="w-full aspect-video bg-[#222228] overflow-hidden relative">
        {thumbnail && !imgError ? (
          <img
            src={thumbnail}
            alt={title}
            loading="lazy"
            onError={() => setImgError(true)}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-zinc-600">
            <svg viewBox="0 0 24 24" fill="currentColor" width="40" height="40" aria-hidden="true">
              <path d="M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zm6.5 4.5v7l5-3.5-5-3.5z" />
            </svg>
          </div>
        )}
      </div>

      <div className="px-4 py-3">
        <h3
          title={title}
          className="text-base font-semibold text-white leading-snug line-clamp-2 group-hover:text-red-400 transition-colors"
        >
          {title}
        </h3>
      </div>
    </Link>
  );
}

