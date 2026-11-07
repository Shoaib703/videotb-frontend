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

  useEffect(() => {
    const controller = new AbortController();

    async function fetchVideo() {
      try {
        setLoading(true);
        setError(null);

        const stored = localStorage.getItem("videotb_user");
        const parsedUser = stored ? JSON.parse(stored) : null;
        const accessToken = parsedUser?.accessToken;

        // Uses relative path through Vite proxy to http://localhost:8000/api/v1/videos/:videoId
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

        // Extract video data from possible response shapes:
        // shape 1: { data: { video: { ... } } }
        // shape 2: { data: { ...videoFields } }
        // shape 3: { video: { ... } }
        // shape 4: { ...videoFields }
        const videoData =
          data?.data?.video ||
          (data?.data && !Array.isArray(data.data) && data.data) ||
          data?.video ||
          data;

        console.log("[VideoPage] Resolved videoData:", videoData);
        setVideo(videoData);
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

  // Resolve video file URL regardless of backend property casing (videoFile vs videofile vs url)
  const rawVideoSrc =
    video?.videoFile ||
    video?.videofile ||
    video?.video_file ||
    video?.videoUrl ||
    video?.url;

  // Resolve thumbnail URL
  const rawThumbnailSrc =
    video?.thumbnail ||
    video?.thumbnailUrl ||
    video?.thumb;

  // Format media URL if backend returned a relative file path instead of a full URL (e.g. Cloudinary)
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
              {/* Video Player */}
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

              {/* Video Title */}
              <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight leading-snug">
                {video.title}
              </h1>

              {/* Video Meta (Date) */}
              {video.createdAt && (
                <div className="flex items-center gap-2 text-xs text-zinc-400 pb-4 border-b border-white/[0.08]">
                  <span>{new Date(video.createdAt).toLocaleDateString()}</span>
                </div>
              )}

              {/* Description Box */}
              {video.description && (
                <div className="bg-[#18181c] border border-white/[0.07] rounded-xl p-4 text-sm text-zinc-300 whitespace-pre-wrap leading-relaxed">
                  <p className="font-semibold text-white mb-1.5 text-xs uppercase tracking-wider text-zinc-400">
                    Description
                  </p>
                  {video.description}
                </div>
              )}

              {/* Comments Section */}
              <Comments videoId={videoId} />
            </div>
          )}
        </main>
      </div>
    </>
  );
}

