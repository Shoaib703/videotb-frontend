import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import VideoCard from "./components/VideoCard";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";

/* ─── Skeleton card ─────────────────────────────────────────────────── */
function SkeletonCard() {
  return (
    <div className="bg-[#18181c] border border-white/[0.07] rounded-xl overflow-hidden" aria-hidden="true">
      {/* Thumb */}
      <div className="w-full aspect-video bg-gradient-to-r from-[#222228] via-[#2a2a32] to-[#222228] bg-[length:600px_100%] animate-pulse" />
      {/* Meta */}
      <div className="flex gap-3 p-3">
        <div className="w-9 h-9 rounded-full flex-shrink-0 bg-[#2a2a32] animate-pulse" />
        <div className="flex-1 flex flex-col gap-2 pt-1">
          <div className="h-3.5 w-5/6 rounded bg-[#2a2a32] animate-pulse" />
          <div className="h-2.5 w-1/2 rounded bg-[#2a2a32] animate-pulse" />
          <div className="h-2.5 w-1/3 rounded bg-[#2a2a32] animate-pulse" />
        </div>
      </div>
    </div>
  );
}

/* ─── Home page ─────────────────────────────────────────────────────── */
export default function Home() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const controller = new AbortController();

    async function fetchVideos() {
      try {
        setLoading(true);
        setError(null);
        const stored = localStorage.getItem("videotb_user");
        const parsedUser = stored ? JSON.parse(stored) : null;
        const accessToken = parsedUser?.accessToken;
        const userId = parsedUser?._id;

        const url = new URL("http://localhost:8000/api/v1/videos/");
        if (userId) url.searchParams.set("userId", userId);

        const res = await fetch(url.toString(), {
          signal: controller.signal,
          credentials: "include",
          headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
        });

        if (res.status === 401 || res.status === 402) {
          navigate("/login");
          return;
        }
        if (!res.ok) throw new Error(`Server error: ${res.status} ${res.statusText}`);

        const data = await res.json();
        const list = Array.isArray(data)
          ? data
          : Array.isArray(data?.data)
            ? data.data
            : Array.isArray(data?.videos)
              ? data.videos
              : [];

        setVideos(list);
      } catch (err) {
        if (err.name !== "AbortError") {
          setError(err.message || "Failed to load videos");
        }
      } finally {
        setLoading(false);
      }
    }

    fetchVideos();
    return () => controller.abort();
  }, []);

  return (
    <>
      <Navbar />

      <div className="flex min-h-[calc(100vh-60px)]">
        <Sidebar />

        <main className="flex-1 min-w-0 p-7 pb-12" id="main-content">
          <h1 className="sr-only">VideoTB – Home</h1>

          {/* Error state */}
          {error && (
            <div
              role="alert"
              className="flex items-center gap-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl px-5 py-3.5 mb-7 text-sm"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20" className="flex-shrink-0" aria-hidden="true">
                <path d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2zm1 14h-2v-2h2v2zm0-4h-2V7h2v5z" />
              </svg>
              <span className="flex-1">{error}</span>
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="ml-auto bg-red-500 text-white text-xs font-semibold px-4 py-1.5 rounded-full hover:opacity-85 transition-opacity"
              >
                Retry
              </button>
            </div>
          )}

          {/* Video grid */}
          {loading ? (
            <div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              aria-busy="true"
              aria-label="Loading videos"
            >
              {Array.from({ length: 12 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : videos.length === 0 && !error ? (
            <div className="flex flex-col items-center gap-4 py-20 text-zinc-600 text-center">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="56" height="56" className="opacity-40" aria-hidden="true">
                <path d="M15 10l4.553-2.069A1 1 0 0 1 21 8.87v6.26a1 1 0 0 1-1.447.9L15 14M3 8a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8z" />
              </svg>
              <p className="text-base">No videos found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {videos.map((video, idx) => (
                <VideoCard key={video._id || video.id || idx} video={video} />
              ))}
            </div>
          )}
        </main>
      </div>
    </>
  );
}