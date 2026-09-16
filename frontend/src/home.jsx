import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import VideoCard from "./components/VideoCard";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";



/* ─── Skeleton card ───────────────────────────────────────────────────── */
function SkeletonCard() {
  return (
    <div className="skeleton-card" aria-hidden="true">
      <div className="skeleton-thumb" />
      <div className="skeleton-meta">
        <div className="skeleton-avatar" />
        <div className="skeleton-lines">
          <div className="skeleton-line skeleton-line--title" />
          <div className="skeleton-line skeleton-line--sub" />
          <div className="skeleton-line skeleton-line--sub2" />
        </div>
      </div>
    </div>
  );
}

/* ─── Home page ───────────────────────────────────────────────────────── */
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
          credentials: "include",
          headers: accessToken
            ? { Authorization: `Bearer ${accessToken}` }
            : {},
        });

        if (res.status === 401 || res.status === 402) {
          navigate("/login");
          return;
        }

        if (!res.ok) {
          throw new Error(`Server error: ${res.status} ${res.statusText}`);
        }

        const data = await res.json();

        // Support { data: [...] }, { videos: [...] } or bare array responses
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

      <div className="page-layout">
        <Sidebar />

        <main className="home-main" id="main-content">
        <h1 className="sr-only">VideoTB – Home</h1>

        {/* ── Error state ─────────────────────────────────────── */}
        {error && (
          <div className="error-banner" role="alert">
            <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20" aria-hidden="true">
              <path d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2zm1 14h-2v-2h2v2zm0-4h-2V7h2v5z" />
            </svg>
            <span>{error}</span>
            <button
              className="error-retry"
              onClick={() => window.location.reload()}
              type="button"
            >
              Retry
            </button>
          </div>
        )}

        {/* ── Grid ──────────────────────────────────────────────── */}
        {loading ? (
          <div className="video-grid" aria-busy="true" aria-label="Loading videos">
            {Array.from({ length: 12 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : videos.length === 0 && !error ? (
          <div className="empty-state">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="56" height="56" aria-hidden="true">
              <path d="M15 10l4.553-2.069A1 1 0 0 1 21 8.87v6.26a1 1 0 0 1-1.447.9L15 14M3 8a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8z" />
            </svg>
            <p>No videos found</p>
          </div>
        ) : (
          <div className="video-grid">
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