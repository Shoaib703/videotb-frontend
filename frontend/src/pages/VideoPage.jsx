import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import Comments from "../components/Comments";

export default function VideoPage() {
  const { videoId } = useParams();
  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isLiked, setIsLiked] = useState(false);
  const [likeLoading, setLikeLoading] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    async function fetchVideo() {
      try {
        setLoading(true);
        setError(null);

        const stored = localStorage.getItem("videotb_user");
        const parsedUser = stored ? JSON.parse(stored) : null;
        const accessToken = parsedUser?.accessToken;


        const res = await fetch(`/api/v1/videos/${videoId}`, {
          signal: controller.signal,
          credentials: "include",
          headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
        });

        if (!res.ok) {
          throw new Error(`Failed to load video (${res.status}: ${res.statusText})`);
        }

        const data = await res.json();
        console.log("[VideoPage] Video fetched response:", data);


        const videoData =
          data?.data?.video ||
          (data?.data && !Array.isArray(data.data) && data.data) ||
          data?.video ||
          data;

        console.log("[VideoPage] Resolved videoData:", videoData);
        setVideo(videoData);

        if (videoData?.isLiked !== undefined) {
          setIsLiked(Boolean(videoData.isLiked));
        }
      } catch (err) {
        if (err.name !== "AbortError") {
          setError(err.message || "Failed to load video");
        }
      } finally {
        setLoading(false);
      }
    }

    if (videoId) {
      fetchVideo();
    }

    return () => controller.abort();
  }, [videoId]);


  const rawVideoSrc =
    video?.videoFile ||
    video?.videofile ||
    video?.video_file ||
    video?.videoUrl ||
    video?.url;


  const rawThumbnailSrc =
    video?.thumbnail ||
    video?.thumbnailUrl ||
    video?.thumb;


  const formatMediaUrl = (url) => {
    if (!url) return "";
    if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("blob:")) {
      return url;
    }
    const cleanPath = url.startsWith("/") ? url : `/${url}`;
    return `http://localhost:8000${cleanPath}`;
  };

  const videoSrc = formatMediaUrl(rawVideoSrc);
  const thumbnailSrc = formatMediaUrl(rawThumbnailSrc);

  const handleToggleLike = async () => {
    if (likeLoading || !videoId) return;

    const stored = localStorage.getItem("videotb_user");
    const parsedUser = stored ? JSON.parse(stored) : null;
    const accessToken = parsedUser?.accessToken;

    setLikeLoading(true);
    try {
      // Hits http://localhost:8000/api/v1/likes/toggle/v/:videoId (via Vite proxy)
      const res = await fetch(`/api/v1/likes/toggle/v/${videoId}`, {
        method: "POST",
        credentials: "include",
        headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
      });

      if (!res.ok) {
        throw new Error(`Failed to toggle like (${res.status}: ${res.statusText})`);
      }

      const data = await res.json();
      console.log("[VideoPage] Like toggled response:", data);

      // Check if backend returned explicit isLiked status or message, otherwise toggle locally
      let nextLiked;
      if (typeof data?.data?.isLiked === "boolean") {
        nextLiked = data.data.isLiked;
      } else if (typeof data?.isLiked === "boolean") {
        nextLiked = data.isLiked;
      } else if (typeof data?.message === "string") {
        nextLiked = !data.message.toLowerCase().includes("unlike");
      } else {
        nextLiked = !isLiked;
      }

      setIsLiked(nextLiked);
    } catch (err) {
      console.error("[VideoPage] Error toggling like:", err);
    } finally {
      setLikeLoading(false);
    }
  };

  return (
    <>
      <Navbar />

      <div className="flex min-h-[calc(100vh-60px)] bg-[#0f0f11]">
        <Sidebar />

        <main className="flex-1 min-w-0 p-4 md:p-8 max-w-6xl">
          {loading && (
            <div className="flex flex-col gap-4">
              <div className="w-full aspect-video bg-[#1f1f23] rounded-2xl animate-pulse" />
              <div className="h-6 w-3/4 bg-[#1f1f23] rounded animate-pulse" />
              <div className="h-4 w-1/3 bg-[#1f1f23] rounded animate-pulse" />
            </div>
          )}

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-6 rounded-2xl">
              <p className="font-semibold mb-2">Error</p>
              <p className="text-sm">{error}</p>
              <Link
                to="/home"
                className="inline-block mt-4 text-xs font-semibold px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg transition-colors"
              >
                Back to Home
              </Link>
            </div>
          )}

          {!loading && !error && video && (
            <div className="flex flex-col gap-5">

              <div className="w-full aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl border border-white/[0.08]">
                {videoSrc ? (
                  <video
                    key={videoSrc}
                    src={videoSrc}
                    poster={thumbnailSrc}
                    controls
                    autoPlay
                    playsInline
                    className="w-full h-full object-contain"
                  >
                    Your browser does not support HTML5 video.
                  </video>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-zinc-500 gap-2">
                    <svg viewBox="0 0 24 24" fill="currentColor" width="40" height="40" aria-hidden="true" className="opacity-40">
                      <path d="M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zm6.5 4.5v7l5-3.5-5-3.5z" />
                    </svg>
                    <p className="text-sm">Video file not available</p>
                  </div>
                )}
              </div>


              <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight leading-snug">
                {video.title}
              </h1>


              {video.createdAt && (
                <div className="flex items-center gap-2 text-xs text-zinc-400 pb-4 border-b border-white/[0.08]">
                  <span>{new Date(video.createdAt).toLocaleDateString()}</span>
                </div>
              )}

              {/* Like Button Row - just above the description */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleToggleLike}
                  disabled={likeLoading}
                  aria-label={isLiked ? "Unlike video" : "Like video"}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                    isLiked
                      ? "bg-red-600 text-white shadow-lg shadow-red-600/30 hover:bg-red-500"
                      : "bg-[#18181c] text-zinc-300 border border-white/[0.1] hover:bg-[#222228] hover:text-white hover:border-white/20"
                  }`}
                >
                  {isLiked ? (
                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4" aria-hidden="true">
                      <path d="M2 20h2c.55 0 1-.45 1-1v-9c0-.55-.45-1-1-1H2v11zm19.83-7.12c.11-.25.17-.52.17-.8 0-1.1-.9-2-2-2h-5.5l.92-4.65c.05-.22.02-.46-.08-.66-.23-.45-.52-.86-.88-1.22L14 3.12 7.59 9.53C7.22 9.9 7 10.42 7 10.97V19c0 1.1.9 2 2 2h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-.12z" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4" aria-hidden="true">
                      <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
                    </svg>
                  )}
                  <span>{isLiked ? "Liked" : "Like"}</span>
                </button>
              </div>

              {video.description && (
                <div className="bg-[#18181c] border border-white/[0.07] rounded-xl p-4 text-sm text-zinc-300 whitespace-pre-wrap leading-relaxed">
                  <p className="font-semibold text-white mb-1.5 text-xs uppercase tracking-wider text-zinc-400">
                    Description
                  </p>
                  {video.description}
                </div>
              )}


              <Comments videoId={videoId} />
            </div>
          )}
        </main>
      </div>
    </>
  );
}

