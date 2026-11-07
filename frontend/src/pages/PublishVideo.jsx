import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

const API_BASE = "/api/v1";

/* ─── Spinner ─────────────────────────────────────────────────────────── */
function Spinner() {
  return (
    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24" aria-hidden="true">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
    </svg>
  );
}

/* ─── Upload Zone ─────────────────────────────────────────────────────── */
function UploadZone({ id, label, hint, accept, icon, file, preview, onChange, onClear, isDragging, onDragOver, onDragLeave, onDrop }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-zinc-300">
        {label}
        <span className="ml-1.5 text-red-400 text-xs font-normal">*required</span>
      </label>

      <div
        role="button"
        tabIndex={0}
        aria-label={`Upload ${label}`}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") document.getElementById(id)?.click(); }}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={() => document.getElementById(id)?.click()}
        className={`relative w-full rounded-2xl border-2 border-dashed overflow-hidden flex items-center justify-center cursor-pointer transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-red-500/40
          ${isDragging
            ? "border-red-500 bg-red-500/8"
            : "border-white/[0.1] bg-[#222228] hover:border-red-500/50 hover:bg-[#252530]"
          }
          ${accept.includes("video") ? "h-48" : "h-36"}`}
      >
        {preview ? (
          /* Preview layer */
          accept.includes("video") ? (
            <video
              src={preview}
              className="w-full h-full object-cover block"
              muted
              playsInline
              preload="metadata"
            />
          ) : (
            <img src={preview} alt={`${label} preview`} className="w-full h-full object-cover block" />
          )
        ) : (
          /* Placeholder */
          <div className="flex flex-col items-center gap-2 text-zinc-600 px-6 text-center pointer-events-none select-none">
            {icon}
            <p className="text-sm text-zinc-500">
              Drag & drop or <span className="text-red-400 underline underline-offset-2">browse</span>
            </p>
            <p className="text-xs opacity-60">{hint}</p>
          </div>
        )}

        {/* Drag-active overlay */}
        {isDragging && (
          <div className="absolute inset-0 bg-red-500/10 flex items-center justify-center pointer-events-none">
            <p className="text-red-300 font-semibold text-sm">Drop here</p>
          </div>
        )}

        {/* Hover-replace overlay when file already chosen */}
        {preview && (
          <div className="absolute inset-0 bg-black/55 opacity-0 hover:opacity-100 flex flex-col items-center justify-center gap-1.5 transition-opacity duration-200 pointer-events-none">
            <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="text-white text-xs font-semibold">Replace file</span>
          </div>
        )}
      </div>

      {/* Hidden file input */}
      <input
        id={id}
        type="file"
        accept={accept}
        onChange={onChange}
        className="hidden"
        aria-label={`Upload ${label}`}
      />

      {/* File chip */}
      {file && (
        <div className="flex items-center gap-2 bg-[#222228] border border-white/[0.08] rounded-md px-4 py-1.5 text-sm text-zinc-400 max-w-full">
          <svg className="w-3.5 h-3.5 flex-shrink-0 text-red-400" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
            <path fillRule="evenodd" d="M8 4a3 3 0 00-3 3v4a5 5 0 0010 0V7a1 1 0 112 0v4a7 7 0 11-14 0V7a3 3 0 016 0v4a3 3 0 11-6 0V7a5 5 0 0110 0v4a1 1 0 11-2 0V7a3 3 0 00-3-3z" clipRule="evenodd" />
          </svg>
          <span className="truncate flex-1 min-w-0">{file.name}</span>
          <span className="text-zinc-600 flex-shrink-0 text-xs">
            {file.size >= 1_000_000
              ? `${(file.size / 1_000_000).toFixed(1)} MB`
              : `${(file.size / 1_000).toFixed(0)} KB`}
          </span>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onClear(); }}
            aria-label={`Remove ${label}`}
            className="ml-1 text-zinc-600 hover:text-red-400 transition-colors text-base leading-none flex-shrink-0"
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════════════════════════════ */
export default function PublishVideo() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Auth guard — redirect to login if not authenticated
  useEffect(() => {
    if (!user) navigate("/login");
  }, [user, navigate]);

  // File state
  const [videoFile, setVideoFile] = useState(null);
  const [videoPreview, setVideoPreview] = useState(null);
  const [thumbnail, setThumbnail] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);

  // Text fields
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  // Drag state per zone
  const [draggingVideo, setDraggingVideo] = useState(false);
  const [draggingThumb, setDraggingThumb] = useState(false);

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(null); // e.g. "Uploading…"

  /* ── File handlers ──────────────────────────────────────────────────── */
  const handleVideoChange = (e) => {
    const f = e.target.files[0];
    processVideoFile(f);
  };

  const processVideoFile = (f) => {
    if (!f) return;
    if (!f.type.startsWith("video/")) {
      setError("Please select a valid video file (mp4, webm, mov, etc.).");
      return;
    }
    if (f.size > 500 * 1024 * 1024) {
      setError("Video must be smaller than 500 MB.");
      return;
    }
    setVideoFile(f);
    setVideoPreview(URL.createObjectURL(f));
    setError("");
  };

  const handleThumbnailChange = (e) => {
    const f = e.target.files[0];
    processThumbnailFile(f);
  };

  const processThumbnailFile = (f) => {
    if (!f) return;
    if (!f.type.startsWith("image/")) {
      setError("Thumbnail must be an image file (jpg, png, webp, etc.).");
      return;
    }
    if (f.size > 5 * 1024 * 1024) {
      setError("Thumbnail must be smaller than 5 MB.");
      return;
    }
    setThumbnail(f);
    setThumbnailPreview(URL.createObjectURL(f));
    setError("");
  };

  const clearVideo = () => {
    setVideoFile(null);
    setVideoPreview(null);
    // reset native input so same file can be re-selected
    const input = document.getElementById("publish-video-file");
    if (input) input.value = "";
  };

  const clearThumbnail = () => {
    setThumbnail(null);
    setThumbnailPreview(null);
    const input = document.getElementById("publish-thumbnail");
    if (input) input.value = "";
  };

  /* ── Validation ─────────────────────────────────────────────────────── */
  const validate = () => {
    if (!title.trim()) return "Please enter a title for your video.";
    if (!videoFile) return "Please select a video file to upload.";
    if (!thumbnail) return "Please select a thumbnail image.";
    return null;
  };

  /* ── Submit ─────────────────────────────────────────────────────────── */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setUploadProgress("Uploading your video…");

    try {
      const formData = new FormData();
      formData.append("title", title.trim());
      formData.append("description", description.trim());
      formData.append("videoFile", videoFile);
      formData.append("thumbnail", thumbnail);

      const stored = localStorage.getItem("videotb_user");
      const parsedUser = stored ? JSON.parse(stored) : null;
      const accessToken = parsedUser?.accessToken;

      const res = await fetch(`${API_BASE}/videos/`, {
        method: "POST",
        credentials: "include",
        headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
        body: formData,
      });

      const raw = await res.text();
      let data = null;
      try {
        data = JSON.parse(raw);
      } catch {
        // Backend returned non-JSON — likely 404 (route not found) or server error page
        throw new Error(
          `Upload failed (${res.status} ${res.statusText}). Verify the backend route exists: POST /api/v1/videos/publishAVideo`
        );
      }

      if (!res.ok) {
        throw new Error(data?.message || "Video upload failed. Please try again.");
      }

      // Success — { "success": true, "data": { ... } }
      setSuccess(true);
      setUploadProgress(null);

      // Reset form after a short delay so the user sees the success state
      setTimeout(() => {
        clearVideo();
        clearThumbnail();
        setTitle("");
        setDescription("");
        setSuccess(false);
        navigate("/home");
      }, 2000);
    } catch (err) {
      setError(err.message);
      setUploadProgress(null);
    } finally {
      setLoading(false);
    }
  };

  /* ── Drag helpers ───────────────────────────────────────────────────── */
  const videoDragProps = {
    isDragging: draggingVideo,
    onDragOver: (e) => { e.preventDefault(); setDraggingVideo(true); },
    onDragLeave: () => setDraggingVideo(false),
    onDrop: (e) => { e.preventDefault(); setDraggingVideo(false); processVideoFile(e.dataTransfer.files[0]); },
  };

  const thumbDragProps = {
    isDragging: draggingThumb,
    onDragOver: (e) => { e.preventDefault(); setDraggingThumb(true); },
    onDragLeave: () => setDraggingThumb(false),
    onDrop: (e) => { e.preventDefault(); setDraggingThumb(false); processThumbnailFile(e.dataTransfer.files[0]); },
  };

  /* ── Both files ready? ──────────────────────────────────────────────── */
  const isReady = !!title.trim() && !!videoFile && !!thumbnail;

  return (
    <>
      <Navbar />
      <div className="flex min-h-[calc(100vh-60px)]">
        <Sidebar />

        <main className="flex-1 min-w-0 p-7 pb-16 overflow-y-auto" id="main-content">
          <h1 className="sr-only">Publish a Video – VideoTB</h1>

          {/* ── Page header ────────────────────────────────────────────── */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-1">Publish a Video</h2>
            <p className="text-sm text-zinc-500">Upload your video file and thumbnail to publish it on VideoTB.</p>
          </div>

          {/* ── Error banner ───────────────────────────────────────────── */}
          {error && (
            <div
              role="alert"
              className="flex items-start gap-2.5 bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-xl px-4 py-3 mb-6"
            >
              <svg className="w-4 h-4 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          {/* ── Success banner ─────────────────────────────────────────── */}
          {success && (
            <div
              role="status"
              aria-live="polite"
              className="flex items-center gap-2.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm rounded-xl px-4 py-3 mb-6"
            >
              <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" aria-hidden="true">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <span>Video published successfully! Redirecting to home…</span>
            </div>
          )}

          {/* ── Form card ─────────────────────────────────────────────── */}
          <div className="bg-[#18181c] border border-white/[0.07] rounded-2xl p-8 max-w-2xl">
            <form onSubmit={handleSubmit} className="flex flex-col gap-7" noValidate>

              {/* Title */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="publish-title" className="text-sm font-medium text-zinc-300">
                  Title
                  <span className="ml-1.5 text-red-400 text-xs font-normal">*required</span>
                </label>
                <input
                  id="publish-title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter a compelling title for your video"
                  maxLength={150}
                  disabled={loading}
                  className="w-full bg-[#222228] border border-white/[0.1] rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-600 outline-none focus:border-red-500/60 focus:ring-2 focus:ring-red-500/20 transition-all duration-200 disabled:opacity-50"
                />
                <p className="text-xs text-zinc-600 text-right">{title.length}/150</p>
              </div>

              {/* Description */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="publish-description" className="text-sm font-medium text-zinc-300">
                  Description
                  <span className="ml-1.5 text-zinc-600 text-xs font-normal">optional</span>
                </label>
                <textarea
                  id="publish-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Tell viewers what your video is about…"
                  maxLength={5000}
                  rows={4}
                  disabled={loading}
                  className="w-full bg-[#222228] border border-white/[0.1] rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-600 outline-none focus:border-red-500/60 focus:ring-2 focus:ring-red-500/20 transition-all duration-200 resize-none disabled:opacity-50"
                />
                <p className="text-xs text-zinc-600 text-right">{description.length}/5000</p>
              </div>

              {/* Video file upload */}
              <UploadZone
                id="publish-video-file"
                label="Video File"
                hint="MP4, WebM, MOV — up to 500 MB"
                accept="video/*"
                file={videoFile}
                preview={videoPreview}
                onChange={handleVideoChange}
                onClear={clearVideo}
                icon={
                  <svg width="40" height="40" fill="none" stroke="currentColor" strokeWidth="1.3" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.069A1 1 0 0121 8.87v6.26a1 1 0 01-1.447.9L15 14M3 8a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
                  </svg>
                }
                {...videoDragProps}
              />

              {/* Thumbnail upload */}
              <UploadZone
                id="publish-thumbnail"
                label="Thumbnail"
                hint="JPG, PNG, WebP — up to 5 MB"
                accept="image/*"
                file={thumbnail}
                preview={thumbnailPreview}
                onChange={handleThumbnailChange}
                onClear={clearThumbnail}
                icon={
                  <svg width="40" height="40" fill="none" stroke="currentColor" strokeWidth="1.3" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                }
                {...thumbDragProps}
              />

              {/* Readiness checklist */}
              <div className="flex flex-col gap-2">
                <p className="text-xs text-zinc-600 uppercase tracking-widest mb-1">Upload checklist</p>
                <div className="flex items-center gap-2">
                  <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${videoFile ? "bg-emerald-500/20 text-emerald-400" : "bg-white/[0.06] text-zinc-600"}`}>
                    {videoFile ? "✓" : "○"}
                  </span>
                  <span className={`text-sm ${videoFile ? "text-emerald-400" : "text-zinc-600"}`}>
                    {videoFile ? `Video ready — ${videoFile.name}` : "No video selected"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${thumbnail ? "bg-emerald-500/20 text-emerald-400" : "bg-white/[0.06] text-zinc-600"}`}>
                    {thumbnail ? "✓" : "○"}
                  </span>
                  <span className={`text-sm ${thumbnail ? "text-emerald-400" : "text-zinc-600"}`}>
                    {thumbnail ? `Thumbnail ready — ${thumbnail.name}` : "No thumbnail selected"}
                  </span>
                </div>
              </div>

              {/* Divider */}
              <div className="h-px bg-white/[0.06]" />

              {/* Submit */}
              <div className="flex items-center gap-4">
                <button
                  id="publish-video-submit-btn"
                  type="submit"
                  disabled={loading || !isReady}
                  className="flex items-center justify-center gap-2 bg-red-600 hover:bg-red-500 text-white text-sm font-semibold px-8 py-3 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 hover:-translate-y-px active:translate-y-0 transition-all duration-200 shadow-lg shadow-red-600/25"
                >
                  {loading ? (
                    <>
                      <Spinner />
                      {uploadProgress || "Uploading…"}
                    </>
                  ) : (
                    <>
                      <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      Publish Video
                    </>
                  )}
                </button>

                <button
                  type="button"
                  disabled={loading}
                  onClick={() => navigate("/home")}
                  className="px-6 py-3 rounded-xl text-sm font-medium text-zinc-400 border border-white/[0.08] hover:text-white hover:border-white/20 hover:bg-[#2a2a32] disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
                >
                  Cancel
                </button>
              </div>

            </form>
          </div>
        </main>
      </div>
    </>
  );
}
