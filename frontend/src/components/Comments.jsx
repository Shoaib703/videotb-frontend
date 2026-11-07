import { useEffect, useState, useCallback } from "react";

export default function Comments({ videoId }) {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [totalComments, setTotalComments] = useState(0);

  const fetchComments = useCallback(
    async (pageNum = 1, append = false) => {
      if (!videoId) return;

      try {
        setLoading(true);
        if (!append) setError(null);

        const stored = localStorage.getItem("videotb_user");
        const parsedUser = stored ? JSON.parse(stored) : null;
        const accessToken = parsedUser?.accessToken;


        const numericPage = Number(pageNum) || 1;
        const numericLimit = Number(10);

  
        const url = `/api/v1/comments/${videoId}?page=${numericPage}&limit=${numericLimit}`;

        const res = await fetch(url, {
          credentials: "include",
          headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
        });

        if (!res.ok) {
          throw new Error(`Failed to load comments (${res.status}: ${res.statusText})`);
        }

        const data = await res.json();
        console.log("[Comments] Fetched comments:", data);

   
        const inner = data?.data;
        let list = [];
        let total = 0;
        let totalPages = 1;

        if (Array.isArray(inner)) {
          list = inner;
          total = inner.length;
        } else if (Array.isArray(inner?.docs)) {
          list = inner.docs;
          total = inner?.totalDocs ?? inner.docs.length;
          totalPages = inner?.totalPages ?? 1;
        } else if (Array.isArray(inner?.comments)) {
          list = inner.comments;
          total = inner?.totalComments ?? inner.comments.length;
          totalPages = inner?.totalPages ?? 1;
        } else if (Array.isArray(data?.docs)) {
          list = data.docs;
          total = data?.totalDocs ?? data.docs.length;
          totalPages = data?.totalPages ?? 1;
        } else if (inner && typeof inner === "object") {
          const arrKey = Object.keys(inner).find((k) => Array.isArray(inner[k]));
          if (arrKey) {
            list = inner[arrKey];
            total = inner?.totalDocs ?? inner?.total ?? list.length;
            totalPages = inner?.totalPages ?? 1;
          }
        }

        setComments((prev) => (append ? [...prev, ...list] : list));
        setTotalComments(total);
        setHasMore(pageNum < totalPages && list.length > 0);
      } catch (err) {
        console.error("[Comments] Error fetching comments:", err);
        setError(err.message || "Failed to load comments");
      } finally {
        setLoading(false);
      }
    },
    [videoId]
  );

  useEffect(() => {
    setPage(1);
    fetchComments(1, false);
  }, [fetchComments]);

  const handleLoadMore = () => {
    const nextPage = Number(page) + 1;
    setPage(nextPage);
    fetchComments(nextPage, true);
  };

  return (
    <section className="mt-8 pt-6 border-t border-white/[0.08]" aria-label="Comments">
      {/* Comments Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
          <span>Comments</span>
          {totalComments > 0 && (
            <span className="text-xs font-normal text-zinc-400 bg-white/[0.06] px-2 py-0.5 rounded-full">
              {totalComments}
            </span>
          )}
        </h2>
      </div>

      {/* Error state */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-xl mb-4 flex items-center justify-between">
          <span>{error}</span>
          <button
            onClick={() => fetchComments(1, false)}
            className="text-xs font-semibold bg-red-600 hover:bg-red-500 text-white px-3 py-1 rounded-md transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {/* Loading Skeletons for first load */}
      {loading && comments.length === 0 && (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex gap-3 animate-pulse">
              <div className="w-9 h-9 rounded-full bg-white/[0.08] flex-shrink-0" />
              <div className="flex-1 space-y-2 pt-1">
                <div className="h-3 w-1/4 bg-white/[0.08] rounded" />
                <div className="h-3 w-3/4 bg-white/[0.08] rounded" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && comments.length === 0 && (
        <p className="text-sm text-zinc-500 py-6 text-center">
          No comments yet.
        </p>
      )}

      {/* Comment List */}
      <div className="space-y-4">
        {comments.map((comment, index) => {
          const owner = comment.owner || comment.user || {};
          const username = owner.username || "User";
          const avatar = owner.avatar;
          const initial = (username[0] || "U").toUpperCase();
          const content = comment.content || comment.text || "";
          const createdAt = comment.createdAt
            ? new Date(comment.createdAt).toLocaleDateString()
            : null;

          return (
            <div
              key={comment._id || comment.id || index}
              className="flex gap-3.5 p-3 rounded-xl hover:bg-white/[0.02] transition-colors"
            >
              {/* Avatar */}
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-zinc-700 to-zinc-800 flex items-center justify-center text-xs font-semibold text-white overflow-hidden flex-shrink-0 mt-0.5 border border-white/[0.08]">
                {avatar ? (
                  <img
                    src={avatar}
                    alt={username}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span>{initial}</span>
                )}
              </div>

              {/* Comment Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-semibold text-zinc-200">
                    @{username}
                  </span>
                  {createdAt && (
                    <span className="text-[11px] text-zinc-500">
                      {createdAt}
                    </span>
                  )}
                </div>

                <p className="text-sm text-zinc-300 whitespace-pre-wrap break-words leading-relaxed">
                  {content}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Load More Button */}
      {hasMore && (
        <div className="flex justify-center mt-6">
          <button
            onClick={handleLoadMore}
            disabled={loading}
            className="text-xs font-semibold text-zinc-300 hover:text-white bg-[#18181c] border border-white/[0.1] hover:border-red-500/40 px-5 py-2 rounded-full transition-all disabled:opacity-50"
          >
            {loading ? "Loading..." : "Load more comments"}
          </button>
        </div>
      )}
    </section>
  );
}

