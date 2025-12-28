import React, { useEffect, useState } from "react";
import axios from "axios";

type CommentObj = {
  user: {
    username: string;
    avatarUrl?: string;
  };
  text: string;
  createdAt: string;
};

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  data: any;
  username: string;
  token: string;
  currentUser: any;
  onUpdateUser: (user: any) => void;
};

import { BASE_URL } from "../config";
const BACKEND_URL = BASE_URL;

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, data, username, token, currentUser, onUpdateUser }) => {
  const [userData, setUserData] = useState<any>(currentUser || null);
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState<CommentObj[]>([]);
  const [loading, setLoading] = useState(false);
  const placeholderAvatar = "https://via.placeholder.com/40?text=U";

  useEffect(() => {
    if (currentUser) setUserData(currentUser);
  }, [currentUser]);

  useEffect(() => {
    if (!data || !isOpen) return;

    const fetchComments = async () => {
      try {
        const pinId = String(data._id || data.id);
        const res = await axios.get(`${BACKEND_URL}/pins/${pinId}/comments`);
        setComments(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error("Failed to fetch comments:", err);
        setComments([]);
      }
    };

    fetchComments();
  }, [data, isOpen]);

  if (!isOpen || !data || !userData) return null;

  const pinId = String(data._id || data.id);

  const optimisticUpdate = (field: "likes" | "savedPins" | "moodBoard", action: "add" | "remove") => {
    setUserData((prev: any) => {
      if (!prev) return prev;
      const list = prev[field] || [];
      const newList = action === "add"
        ? [...list, pinId]
        : list.filter((id: any) => String(id) !== pinId && String(id?._id || id?.id || id) !== pinId);
      return { ...prev, [field]: newList };
    });
  };

  const optimisticFollow = (authorId: string, action: "add" | "remove") => {
    setUserData((prev: any) => {
      if (!prev) return prev;
      const following = prev.following || [];
      const newFollowing = action === "add"
        ? [...following, authorId]
        : following.filter((id: any) => String(id) !== authorId && String(id?._id || id?.id || id) !== authorId);
      return { ...prev, following: newFollowing };
    });
  };

  const syncWithServer = async () => {
    try {
      const res = await axios.get(`${BACKEND_URL}/users/${username}`);
      const updated = {
        id: res.data.id,
        username: res.data.username,
        name: res.data.name || "",
        likes: res.data.likes || [],
        savedPins: res.data.savedPins || [],
        moodBoard: res.data.moodBoard || [],
        following: res.data.following || [],
        followersCount: res.data.followersCount || 0,
        followingCount: res.data.followingCount || 0,
        avatarUrl: res.data.avatarUrl || "",
      };
      setUserData(updated);
      onUpdateUser(updated);
    } catch (err) {
      console.error("Failed to sync user data:", err);
    }
  };

  const toggleLike = async () => {
    if (loading) return;
    setLoading(true);
    const isLiked = liked;
    optimisticUpdate("likes", isLiked ? "remove" : "add");
    try {
      await axios.post(`${BACKEND_URL}/users/${username}/like/${pinId}`, {}, { headers: { Authorization: `Bearer ${token}` } });
      await syncWithServer();
    } catch (err) {
      optimisticUpdate("likes", isLiked ? "add" : "remove");
    } finally {
      setLoading(false);
    }
  };

  const toggleSave = async () => {
    if (loading) return;
    setLoading(true);
    const isSaved = saved;
    optimisticUpdate("savedPins", isSaved ? "remove" : "add");
    try {
      await axios.post(`${BACKEND_URL}/users/${username}/save/${pinId}`, {}, { headers: { Authorization: `Bearer ${token}` } });
      await syncWithServer();
    } catch (err) {
      optimisticUpdate("savedPins", isSaved ? "add" : "remove");
    } finally {
      setLoading(false);
    }
  };

  const toggleMoodBoard = async () => {
    if (loading) return;
    setLoading(true);
    const isInMoodBoard = inMoodBoard;
    optimisticUpdate("moodBoard", isInMoodBoard ? "remove" : "add");
    try {
      await axios.post(`${BACKEND_URL}/users/${username}/moodboard/${pinId}`, {}, { headers: { Authorization: `Bearer ${token}` } });
      await syncWithServer();
    } catch (err) {
      optimisticUpdate("moodBoard", isInMoodBoard ? "add" : "remove");
    } finally {
      setLoading(false);
    }
  };

  const toggleFollow = async () => {
    if (loading || !data.user?.username) return;
    setLoading(true);

    const targetUsername = data.user.username;
    const authorId = String(data.user._id || data.user.id);
    if (targetUsername === username) {
      alert("You cannot follow yourself.");
      setLoading(false);
      return;
    }

    const isFollowingNow = isFollowing;
    optimisticFollow(authorId, isFollowingNow ? "remove" : "add");

    try {
      await axios.post(`${BACKEND_URL}/users/${username}/follow/${targetUsername}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      await syncWithServer();
    } catch (err) {
      console.error("Failed to toggle follow:", err);
      optimisticFollow(authorId, isFollowingNow ? "add" : "remove");
    } finally {
      setLoading(false);
    }
  };

  const addComment = async () => {
    const txt = commentText.trim();
    if (!txt || !token) return;
    try {
      const res = await axios.post(`${BACKEND_URL}/pins/${pinId}/comments`, { text: txt }, { headers: { Authorization: `Bearer ${token}` } });
      setComments((prev) => [...prev, res.data]);
      setCommentText("");
    } catch (err) {
      console.error("Failed to add comment:", err);
    }
  };

  const isIdInList = (list: any[], targetId: string) =>
    Array.isArray(list) && list.some(id => String(id) === targetId || String(id?._id || id?.id || id) === targetId);

  const liked = isIdInList(userData.likes, pinId);
  const saved = isIdInList(userData.savedPins, pinId);
  const inMoodBoard = isIdInList(userData.moodBoard, pinId);
  const authorId = String(data.user?._id || data.user?.id || "");
  const isFollowing = authorId && isIdInList(userData.following, authorId);

  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={onClose}
      style={{
        position: "fixed", inset: 0,
        backgroundColor: "rgba(0,0,0,0.85)", display: "flex", justifyContent: "center", alignItems: "center",
        zIndex: 1000, backdropFilter: "blur(12px)", padding: "20px"
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: "white", borderRadius: "40px", width: "100%", maxWidth: "1012px", height: "90vh",
          display: "flex", overflow: "hidden", boxShadow: "var(--shadow-lg)",
          animation: "fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1)"
        }}
      >
        {/* Left Side - Image Container */}
        <div style={{ flex: "1.2", backgroundColor: "#f8f8f8", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", borderRight: "1px solid var(--gray-light)" }}>
          {data.imageUrl && (
            <img
              src={data.imageUrl}
              alt={data.title}
              style={{ width: "100%", height: "100%", objectFit: "contain", padding: "20px" }}
            />
          )}
        </div>

        {/* Right Side - Information Panel */}
        <div style={{ flex: "1", padding: "40px", display: "flex", flexDirection: "column", overflowY: "auto", position: "relative" }}>

          {/* Top Actions Bar */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "40px" }}>
            <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
              <button
                onClick={toggleLike}
                title={liked ? "Unlike" : "Like"}
                style={{
                  background: "none", border: "none", cursor: "pointer", fontSize: "24px",
                  display: "flex", alignItems: "center", gap: "10px", color: liked ? "var(--pinterest-red)" : "var(--text-primary)",
                  transition: "transform 0.2s"
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.1)"}
                onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
              >
                <span style={{ filter: liked ? "none" : "grayscale(100%) opacity(0.6)" }}>{liked ? "❤️" : "🤍"}</span>
                <span style={{ fontSize: "16px", fontWeight: "700" }}>{liked ? 1 : 0}</span>
              </button>

              <button
                onClick={toggleMoodBoard}
                title="Save to Moodboard"
                style={{
                  background: inMoodBoard ? "var(--gray-hover)" : "var(--gray-light)",
                  border: "none", cursor: "pointer", fontSize: "20px",
                  width: "44px", height: "44px", borderRadius: "50%",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  transition: "all 0.2s"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "scale(1.1)";
                  e.currentTarget.style.backgroundColor = "var(--gray-hover)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "scale(1)";
                  e.currentTarget.style.backgroundColor = inMoodBoard ? "var(--gray-hover)" : "var(--gray-light)";
                }}
              >
                {inMoodBoard ? "🧩" : "➕"}
              </button>
            </div>

            <div style={{ display: "flex", gap: "12px" }}>
              <button
                onClick={() => {
                  onClose();
                  if ((window as any).triggerSimilar) (window as any).triggerSimilar(data);
                }}
                title="Find Related Patterns"
                style={{
                  background: "var(--gray-light)", border: "none", cursor: "pointer", fontSize: "20px",
                  borderRadius: "50%", width: "48px", height: "48px",
                  display: "flex", alignItems: "center", justifyContent: "center", transition: "0.2s"
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "var(--gray-hover)"}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "var(--gray-light)"}
              >🔍</button>

              <button
                onClick={toggleSave}
                style={{
                  backgroundColor: saved ? "var(--text-primary)" : "var(--pinterest-red)",
                  color: "white", border: "none", borderRadius: "var(--border-radius-btn)",
                  padding: "0 28px", height: "48px", fontSize: "16px", fontWeight: "700", cursor: "pointer",
                  boxShadow: "var(--shadow-md)", transition: "all 0.2s"
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.05)"}
                onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
              >
                {saved ? "Saved" : "Save"}
              </button>
            </div>
          </div>

          <h1 style={{ fontSize: "36px", fontWeight: "700", marginBottom: "16px", letterSpacing: "-1px", lineHeight: "1.1", color: "var(--text-primary)" }}>{data.title}</h1>
          <p style={{ fontSize: "17px", color: "var(--text-primary)", marginBottom: "24px", lineHeight: "1.6", opacity: 0.9 }}>{data.description}</p>

          {/* Tags & Categories Panel */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginBottom: "32px" }}>
            {data.category && (
              <span style={{ background: "linear-gradient(135deg, var(--gray-light) 0%, #fff 100%)", padding: "8px 16px", borderRadius: "30px", fontSize: "13px", fontWeight: "700", border: "1px solid var(--gray-hover)" }}>
                {data.category}
              </span>
            )}
            {data.tags && data.tags.map((tag: string, i: number) => (
              <span key={i} style={{ background: "var(--gray-light)", padding: "8px 16px", borderRadius: "30px", fontSize: "13px", fontWeight: "500", color: "var(--text-secondary)" }}>
                #{tag}
              </span>
            ))}
          </div>

          {/* User Profile Hook */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "24px 0", borderTop: "1px solid var(--gray-light)", marginBottom: "40px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <div style={{ width: "56px", height: "56px", borderRadius: "50%", backgroundColor: "var(--gray-light)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "700", fontSize: "20px", boxShadow: "var(--shadow-sm)" }}>
                {data.user?.username?.charAt(0).toUpperCase() || "U"}
              </div>
              <div>
                <div style={{ fontWeight: "700", fontSize: "17px", color: "var(--text-primary)" }}>{data.user?.username || "Unknown Architect"}</div>
                <div style={{ fontSize: "14px", color: "var(--text-secondary)" }}>Community Creator</div>
              </div>
            </div>
            {data.user?.username !== username && (
              <button
                onClick={toggleFollow}
                disabled={loading}
                style={{
                  backgroundColor: isFollowing ? "var(--text-primary)" : "var(--gray-light)",
                  color: isFollowing ? "white" : "var(--text-primary)",
                  border: "none", borderRadius: "30px", padding: "14px 24px",
                  fontWeight: "700", cursor: "pointer", transition: "all 0.2s"
                }}
                onMouseEnter={(e) => {
                  if (!isFollowing) e.currentTarget.style.backgroundColor = "var(--gray-hover)";
                }}
                onMouseLeave={(e) => {
                  if (!isFollowing) e.currentTarget.style.backgroundColor = "var(--gray-light)";
                }}
              >
                {isFollowing ? "Following" : "Follow"}
              </button>
            )}
          </div>

          {/* Comments Section */}
          <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
            <h3 style={{ fontSize: "22px", fontWeight: "700", marginBottom: "24px", display: "flex", alignItems: "center", gap: "10px" }}>
              Comments <span style={{ fontSize: "14px", background: "var(--gray-light)", padding: "4px 10px", borderRadius: "10px", color: "var(--text-secondary)" }}>{comments.length}</span>
            </h3>

            <div style={{ flex: 1, overflowY: "auto", marginBottom: "30px", paddingRight: "10px" }}>
              {comments.length === 0 && (
                <div style={{ textAlign: "center", padding: "40px 0", opacity: 0.5 }}>
                  <div style={{ fontSize: "32px", marginBottom: "10px" }}>💬</div>
                  <p style={{ fontWeight: "500" }}>No thoughts yet. Be the first to comment!</p>
                </div>
              )}
              {comments.map((c, i) => (
                <div key={i} style={{ display: "flex", gap: "16px", marginBottom: "24px", animation: "fadeIn 0.3s ease-out" }}>
                  <img src={c.user.avatarUrl || placeholderAvatar} alt="avatar" style={{ width: "40px", height: "40px", borderRadius: "50%", objectFit: "cover", boxShadow: "var(--shadow-sm)" }} />
                  <div>
                    <div style={{ background: "var(--gray-light)", padding: "12px 16px", borderRadius: "20px", borderBottomLeftRadius: "4px" }}>
                      <div style={{ fontWeight: "700", fontSize: "14px", marginBottom: "4px", color: "var(--text-primary)" }}>{c.user.username}</div>
                      <div style={{ fontSize: "15px", lineHeight: "1.5", color: "var(--text-primary)" }}>{c.text}</div>
                    </div>
                    <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "6px", marginLeft: "12px" }}>{new Date(c.createdAt).toLocaleDateString()}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Sticky Comment Input */}
            <div style={{ display: "flex", gap: "16px", alignItems: "center", padding: "20px 0", borderTop: "1px solid var(--gray-light)", backgroundColor: "white" }}>
              <div style={{ width: "44px", height: "44px", borderRadius: "50%", backgroundColor: "var(--pinterest-red)", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "700", boxShadow: "var(--shadow-sm)" }}>
                {username[0]?.toUpperCase()}
              </div>
              <input
                type="text"
                placeholder="Share your thoughts..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addComment()}
                style={{
                  flex: 1, padding: "14px 20px", borderRadius: "30px", border: "2px solid var(--gray-light)",
                  outline: "none", fontSize: "16px", transition: "all 0.2s", fontWeight: "500"
                }}
                onFocus={(e) => e.target.style.borderColor = "var(--gray-hover)"}
                onBlur={(e) => e.target.style.borderColor = "var(--gray-light)"}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};