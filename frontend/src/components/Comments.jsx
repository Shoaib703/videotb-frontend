import { useEffect, useState, useCallback } from "react";

export default function Comments({ videoId }) {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [totalComments, setTotalComments] = useState(0);


  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");


  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editCommentText, setEditCommentText] = useState("");
  const [updatingCommentId, setUpdatingCommentId] = useState(null);
  const [deletingCommentId, setDeletingCommentId] = useState(null);
  const [actionError, setActionError] = useState("");

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

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || submitting || !videoId) return;

    const stored = localStorage.getItem("videotb_user");
    const parsedUser = stored ? JSON.parse(stored) : null;
    const accessToken = parsedUser?.accessToken;

    if (!accessToken) {
      setSubmitError("Please sign in to write a comment.");
      return;
    }

    setSubmitting(true);
    setSubmitError("");

    try {

      const res = await fetch(`/api/v1/comments/${videoId}`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          comments: newComment.trim(),
          content: newComment.trim(),
          comment: newComment.trim(),
        }),
      });

      if (!res.ok) {
        throw new Error(`Failed to post comment (${res.status}: ${res.statusText})`);
      }

      const data = await res.json();
      console.log("[Comments] Added comment response:", data);

      const added = data?.data || data?.comment || {};
      const newCommentObj = {
        _id: added._id || Date.now().toString(),
        content: added.content || added.comments || added.comment || newComment.trim(),
        owner: added.owner || {
          username: parsedUser?.username || "You",
          avatar: parsedUser?.avatar,
        },
        createdAt: added.createdAt || new Date().toISOString(),
      };

      setComments((prev) => [newCommentObj, ...prev]);
      setTotalComments((prev) => prev + 1);
      setNewComment("");
    } catch (err) {
      console.error("[Comments] Error adding comment:", err);
      setSubmitError(err.message || "Failed to post comment. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const requestCommentAction = async (endpointPath, options) => {

    let res = await fetch(`/api/v1/comments/c/${endpointPath}`, options);
    if (res.status === 404) {
      res = await fetch(`/api/v1/c/${endpointPath}`, options);
    }
    return res;
  };


  const handleStartEdit = (comment) => {
    const id = comment._id || comment.id;
    setEditingCommentId(id);
    setEditCommentText(comment.content || comment.comment || comment.comments || "");
    setActionError("");
  };

  const handleCancelEdit = () => {
    setEditingCommentId(null);
    setEditCommentText("");
    setActionError("");
  };

  const handleUpdateComment = async (commentId) => {
    if (!editCommentText.trim() || updatingCommentId) return;

    const stored = localStorage.getItem("videotb_user");
    const parsedUser = stored ? JSON.parse(stored) : null;
    const accessToken = parsedUser?.accessToken;

    if (!accessToken) {
      setActionError("Please sign in to update your comment.");
      return;
    }

    setUpdatingCommentId(commentId);
    setActionError("");

    try {

      const res = await requestCommentAction(commentId, {
        method: "PATCH",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          comment: editCommentText.trim(),
          content: editCommentText.trim(),
          comments: editCommentText.trim(),
        }),
      });

      if (!res.ok) {
        throw new Error(`Failed to update comment (${res.status}: ${res.statusText})`);
      }

      const data = await res.json();
      console.log("[Comments] Updated comment response:", data);

      const updatedText = editCommentText.trim();
      setComments((prev) =>
        prev.map((c) =>
          (c._id === commentId || c.id === commentId)
            ? { ...c, content: updatedText, comment: updatedText, comments: updatedText }
            : c
        )
      );

      setEditingCommentId(null);
      setEditCommentText("");
    } catch (err) {
      console.error("[Comments] Error updating comment:", err);
      setActionError(err.message || "Failed to update comment.");
    } finally {
      setUpdatingCommentId(null);
    }
  };


  const handleDeleteComment = async (commentId) => {
    if (deletingCommentId) return;

    const stored = localStorage.getItem("videotb_user");
    const parsedUser = stored ? JSON.parse(stored) : null;
    const accessToken = parsedUser?.accessToken;

    if (!accessToken) {
      setActionError("Please sign in to delete your comment.");
      return;
    }

    setDeletingCommentId(commentId);
    setActionError("");

    try {

      const res = await requestCommentAction(commentId, {
        method: "DELETE",
        credentials: "include",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!res.ok) {
        throw new Error(`Failed to delete comment (${res.status}: ${res.statusText})`);
      }

      const data = await res.json();
      console.log("[Comments] Deleted comment response:", data);

      setComments((prev) => prev.filter((c) => c._id !== commentId && c.id !== commentId));
      setTotalComments((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error("[Comments] Error deleting comment:", err);
      setActionError(err.message || "Failed to delete comment.");
    } finally {
      setDeletingCommentId(null);
    }
  };

  const stored = localStorage.getItem("videotb_user");
  const currentUser = stored ? JSON.parse(stored) : null;
  const currentAvatar = currentUser?.avatar;
  const currentInitial = (currentUser?.username || "U")[0]?.toUpperCase() || "U";

  return (
    <section className="mt-8 pt-6 border-t border-white/[0.08]" aria-label="Comments">

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


      <form onSubmit={handleAddComment} className="mb-8">
        <div className="flex gap-3 items-start">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-red-600 to-red-400 flex items-center justify-center text-xs font-bold text-white overflow-hidden flex-shrink-0 mt-0.5 border border-white/[0.08]">
            {currentAvatar ? (
              <img src={currentAvatar} alt="Your avatar" className="w-full h-full object-cover" />
            ) : (
              <span>{currentInitial}</span>
            )}
          </div>

          <div className="flex-1 flex flex-col gap-2">
            <textarea
              rows={2}
              value={newComment}
              onChange={(e) => {
                setNewComment(e.target.value);
                setSubmitError("");
              }}
              placeholder="Add a comment..."
              className="w-full bg-[#18181c] border border-white/[0.1] focus:border-red-500/60 rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-500 outline-none resize-none transition-colors"
            />

            {submitError && (
              <p className="text-xs text-red-400">{submitError}</p>
            )}

            <div className="flex justify-end gap-2 mt-1">
              {newComment.trim() && (
                <button
                  type="button"
                  onClick={() => {
                    setNewComment("");
                    setSubmitError("");
                  }}
                  className="text-xs text-zinc-400 hover:text-white px-3 py-1.5 rounded-lg transition-colors"
                >
                  Cancel
                </button>
              )}
              <button
                type="submit"
                disabled={submitting || !newComment.trim()}
                className="text-xs font-semibold px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-md shadow-red-600/20"
              >
                {submitting ? "Posting..." : "Comment"}
              </button>
            </div>
          </div>
        </div>
      </form>


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


      {actionError && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs px-3.5 py-2 rounded-xl mb-4 flex items-center justify-between">
          <span>{actionError}</span>
          <button
            type="button"
            onClick={() => setActionError("")}
            className="text-xs font-semibold opacity-70 hover:opacity-100 ml-2"
          >
            ✕
          </button>
        </div>
      )}

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

      {!loading && !error && comments.length === 0 && (
        <p className="text-sm text-zinc-500 py-6 text-center">
          No comments yet.
        </p>
      )}

      <div className="space-y-4">
        {comments.map((comment, index) => {
          const commentId = comment._id || comment.id || index;
          const owner = comment.owner || comment.user || {};
          const username = owner.username || "User";
          const avatar = owner.avatar;
          const initial = (username[0] || "U").toUpperCase();
          const content = comment.content || comment.comment || comment.comments || comment.text || "";
          const createdAt = comment.createdAt
            ? new Date(comment.createdAt).toLocaleDateString()
            : null;
          const isEditing = editingCommentId === commentId;

          return (
            <div
              key={commentId}
              className="flex gap-3.5 p-3 rounded-xl hover:bg-white/[0.02] transition-colors group"
            >
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

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-zinc-200">
                      @{username}
                    </span>
                    {createdAt && (
                      <span className="text-[11px] text-zinc-500">
                        {createdAt}
                      </span>
                    )}
                  </div>


                  {!isEditing && (
                    <div className="flex items-center gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
                      <button
                        type="button"
                        onClick={() => handleStartEdit(comment)}
                        className="flex items-center gap-1 text-[11px] text-zinc-400 hover:text-white px-2 py-0.5 rounded hover:bg-white/[0.06] transition-colors cursor-pointer"
                        title="Update comment"
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3" aria-hidden="true">
                          <path d="M12 20h9" />
                          <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                        </svg>
                        <span>Update</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteComment(commentId)}
                        disabled={deletingCommentId === commentId}
                        className="flex items-center gap-1 text-[11px] text-zinc-400 hover:text-red-400 px-2 py-0.5 rounded hover:bg-red-500/10 transition-colors disabled:opacity-50 cursor-pointer"
                        title="Delete comment"
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3" aria-hidden="true">
                          <path d="M3 6h18" />
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                        </svg>
                        <span>{deletingCommentId === commentId ? "Deleting..." : "Delete"}</span>
                      </button>
                    </div>
                  )}
                </div>


                {isEditing ? (
                  <div className="flex flex-col gap-2 mt-2">
                    <textarea
                      rows={2}
                      value={editCommentText}
                      onChange={(e) => setEditCommentText(e.target.value)}
                      className="w-full bg-[#18181c] border border-white/[0.1] focus:border-red-500/60 rounded-xl px-3 py-2 text-sm text-white placeholder-zinc-500 outline-none resize-none"
                    />
                    <div className="flex gap-2 justify-end">
                      <button
                        type="button"
                        onClick={handleCancelEdit}
                        disabled={updatingCommentId === commentId}
                        className="text-xs text-zinc-400 hover:text-white px-3 py-1 rounded-lg transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => handleUpdateComment(commentId)}
                        disabled={updatingCommentId === commentId || !editCommentText.trim()}
                        className="text-xs font-semibold px-3 py-1 bg-red-600 hover:bg-red-500 text-white rounded-lg transition-colors disabled:opacity-50 shadow-sm cursor-pointer"
                      >
                        {updatingCommentId === commentId ? "Saving..." : "Save"}
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-zinc-300 whitespace-pre-wrap break-words leading-relaxed">
                    {content}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>


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

