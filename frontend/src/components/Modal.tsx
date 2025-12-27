import React, { useEffect, useState } from "react";
import axios from "axios";

type CommentObj = {
  author: string;
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

  // Keep internal userData in sync with prop
  useEffect(() => {
    if (currentUser) {
      setUserData(currentUser);
    }
  }, [currentUser]);

  useEffect(() => {
    if (!data || !isOpen) return;

    // Load comments from localStorage
    try {
      const allComments = JSON.parse(localStorage.getItem("comments") || "{}") as Record<string, CommentObj[]>;
      const pinId = String(data._id || data.id);
      setComments(Array.isArray(allComments[pinId]) ? allComments[pinId] : []);
    } catch (err) {
      setComments([]);
    }
  }, [data, isOpen]);

  if (!isOpen || !data || !userData) return null;

  const pinId = String(data._id || data.id);

  // Helper for optimistic update
  const optimisticUpdate = (field: "likes" | "savedPins" | "moodBoard", action: "add" | "remove") => {
    setUserData((prev: any) => {
      if (!prev) return prev;
      const list = prev[field] || [];
      const newList = action === "add"
        ? [...list, pinId]
        : list.filter((id: any) => String(id) !== pinId && String(id?._id || id?.id || id) !== pinId);

      const newState = { ...prev, [field]: newList };
      // Note: We'll call onUpdateUser AFTER this update happens in the toggle functions
      return newState;
    });
  };

  const syncWithServer = async () => {
    try {
      const res = await axios.get(`${BACKEND_URL}/users/${username}`);
      const updated = {
        username: res.data.username,
        likes: res.data.likes || [],
        savedPins: res.data.savedPins || [],
        moodBoard: res.data.moodBoard || [],
        avatarUrl: res.data.avatarUrl || "",
      };
      setUserData(updated);
      onUpdateUser(updated);
    } catch (err) {
      console.error("Failed to sync user data:", err);
    }
  };

  // Toggle like
  const toggleLike = async () => {
    if (loading) return;
    setLoading(true);

    const isLiked = liked;
    optimisticUpdate("likes", isLiked ? "remove" : "add");

    try {
      await axios.post(
        `${BACKEND_URL}/users/${username}/like/${pinId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await syncWithServer();
    } catch (err: any) {
      console.error("Failed to toggle like:", err);
      optimisticUpdate("likes", isLiked ? "add" : "remove");
    } finally {
      setLoading(false);
    }
  };

  // Toggle save
  const toggleSave = async () => {
    if (loading) return;
    setLoading(true);

    const isSaved = saved;
    optimisticUpdate("savedPins", isSaved ? "remove" : "add");

    try {
      await axios.post(
        `${BACKEND_URL}/users/${username}/save/${pinId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await syncWithServer();
    } catch (err: any) {
      console.error("Failed to toggle save:", err);
      optimisticUpdate("savedPins", isSaved ? "add" : "remove");
    } finally {
      setLoading(false);
    }
  };

  // Toggle mood board
  const toggleMoodBoard = async () => {
    if (loading) return;
    setLoading(true);

    const isInMoodBoard = inMoodBoard;
    optimisticUpdate("moodBoard", isInMoodBoard ? "remove" : "add");

    try {
      await axios.post(
        `${BACKEND_URL}/users/${username}/moodboard/${pinId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await syncWithServer();
    } catch (err: any) {
      console.error("Failed to toggle mood board:", err);
      optimisticUpdate("moodBoard", isInMoodBoard ? "add" : "remove");
    } finally {
      setLoading(false);
    }
  };

  const addComment = () => {
    const txt = commentText.trim();
    if (!txt) return;

    const newComment: CommentObj = {
      author: username,
      text: txt,
      createdAt: new Date().toISOString(),
    };

    const allComments = JSON.parse(localStorage.getItem("comments") || "{}") as Record<string, CommentObj[]>;
    const current = Array.isArray(allComments[pinId]) ? [...allComments[pinId]] : [];
    const updated = [...current, newComment];
    allComments[pinId] = updated;
    localStorage.setItem("comments", JSON.stringify(allComments));
    setComments(updated);
    setCommentText("");
  };

  const isIdInList = (list: any[], targetId: string) =>
    Array.isArray(list) && list.some(id => String(id) === targetId || String(id?._id || id?.id || id) === targetId);

  const liked = isIdInList(userData.likes, pinId);
  const saved = isIdInList(userData.savedPins, pinId);
  const inMoodBoard = isIdInList(userData.moodBoard, pinId);

  const getUserAvatar = (authorName: string) => {
    if (authorName === username && userData.avatarUrl) {
      return userData.avatarUrl;
    }
    return placeholderAvatar;
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={onClose}
      style={{
        position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
        backgroundColor: "rgba(0,0,0,0.7)", display: "flex", justifyContent: "center", alignItems: "center",
        zIndex: 1000, backdropFilter: "blur(5px)"
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: "white", borderRadius: "32px", width: "90%", maxWidth: "1012px", height: "85vh",
          display: "flex", overflow: "hidden", boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)"
        }}
      >
        {/* Left Side - Image */}
        <div style={{ flex: "1.2", backgroundColor: "#f0f0f0", display: "flex", alignItems: "center", justifyContent: "center" }}>
          {data.imageUrl && (
            <img
              src={data.imageUrl}
              alt={data.title}
              style={{ width: "100%", height: "100%", objectFit: "contain" }}
            />
          )}
        </div>

        {/* Right Side - Details */}
        <div style={{ flex: "1", padding: "32px", display: "flex", flexDirection: "column", overflowY: "auto" }}>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
            <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
              <button
                onClick={toggleLike}
                style={{
                  background: "none", border: "none", cursor: "pointer", fontSize: "28px",
                  display: "flex", alignItems: "center", gap: "8px", color: liked ? "#e60023" : "#111"
                }}
              >
                {liked ? "❤️" : "🤍"}
                <span style={{ fontSize: "16px", fontWeight: "600" }}>{liked ? 1 : 0}</span>
              </button>

              <button
                onClick={toggleMoodBoard}
                title="Add to Moodboard"
                style={{ background: "none", border: "none", cursor: "pointer", fontSize: "28px", color: inMoodBoard ? "#e60023" : "#111" }}
              >
                {inMoodBoard ? "🧩" : "➕"}
              </button>
            </div>

            <div style={{ display: "flex", gap: "8px" }}>
              <button
                onClick={() => {
                  onClose();
                  // We'll pass a new prop 'onFindSimilar' or similar
                  if ((window as any).triggerSimilar) {
                    (window as any).triggerSimilar(data);
                  }
                }}
                title="Find Similar"
                style={{
                  background: "#efefef", border: "none", cursor: "pointer", fontSize: "20px",
                  borderRadius: "50%", width: "48px", height: "48px",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  transition: "0.2s"
                }}
              >
                🔍
              </button>
              <button
                onClick={toggleSave}
                style={{
                  backgroundColor: saved ? "#111" : "#e60023",
                  color: "white", border: "none", borderRadius: "24px", padding: "12px 24px",
                  fontSize: "16px", fontWeight: "600", cursor: "pointer", transition: "0.2s"
                }}
              >
                {saved ? "Saved" : "Save"}
              </button>
            </div>
          </div>

          <h1 style={{ fontSize: "32px", fontWeight: "700", marginBottom: "12px", lineHeight: "1.2" }}>{data.title}</h1>
          <p style={{ fontSize: "16px", color: "#111", marginBottom: "20px", lineHeight: "1.5" }}>{data.description}</p>

          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "24px" }}>
            {data.category && (
              <span style={{ backgroundColor: "#efefef", padding: "6px 14px", borderRadius: "16px", fontSize: "12px", fontWeight: "600" }}>
                {data.category}
              </span>
            )}
            {data.tags && data.tags.map((tag: string, i: number) => (
              <span key={i} style={{ backgroundColor: "#efefef", padding: "6px 14px", borderRadius: "16px", fontSize: "12px" }}>
                #{tag}
              </span>
            ))}
            {data.color && (
              <span style={{ display: "flex", alignItems: "center", gap: "6px", backgroundColor: "#efefef", padding: "6px 14px", borderRadius: "16px", fontSize: "12px" }}>
                <span style={{ width: "12px", height: "12px", borderRadius: "50%", backgroundColor: data.color, border: "1px solid #ddd" }}></span>
                {data.color}
              </span>
            )}
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{ width: "48px", height: "48px", borderRadius: "50%", backgroundColor: "#f0f0f0", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "600" }}>
                {data.user?.username?.charAt(0).toUpperCase() || "U"}
              </div>
              <div>
                <div style={{ fontWeight: "600", fontSize: "16px" }}>{data.user?.username || "Unknown"}</div>
                <div style={{ fontSize: "14px", color: "#666" }}>0 followers</div>
              </div>
            </div>
            <button style={{
              backgroundColor: "#efefef", border: "none", borderRadius: "24px", padding: "12px 20px",
              fontWeight: "600", cursor: "pointer"
            }}>
              Follow
            </button>
          </div>

          <div style={{ marginTop: "auto" }}>
            <h3 style={{ fontSize: "20px", fontWeight: "700", marginBottom: "20px" }}>Comments</h3>

            <div style={{ maxHeight: "200px", overflowY: "auto", marginBottom: "24px" }}>
              {comments.length === 0 && <p style={{ color: "#767676", fontStyle: "italic" }}>No comments yet. Share your thoughts!</p>}
              {comments.map((c, i) => (
                <div key={i} style={{ display: "flex", gap: "12px", marginBottom: "16px" }}>
                  <img src={getUserAvatar(c.author)} alt="avatar" style={{ width: "32px", height: "32px", borderRadius: "50%", objectFit: "cover" }} />
                  <div>
                    <div style={{ fontSize: "14px", lineHeight: "1.4" }}>
                      <span style={{ fontWeight: "700", marginRight: "8px" }}>{c.author}</span>
                      {c.text}
                    </div>
                    <div style={{ fontSize: "11px", color: "#767676", marginTop: "4px" }}>{new Date(c.createdAt).toLocaleDateString()}</div>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: "flex", gap: "12px", alignItems: "center", padding: "16px 0", borderTop: "1px solid #efefef" }}>
              <div style={{ width: "40px", height: "40px", borderRadius: "50%", backgroundColor: "#efefef", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "600" }}>
                {username[0]}
              </div>
              <input
                type="text"
                placeholder="Add a comment"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addComment()}
                style={{
                  flex: 1, padding: "12px 16px", borderRadius: "24px", border: "1px solid #ddd",
                  outline: "none", fontSize: "16px", backgroundColor: "#f9f9f9"
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};