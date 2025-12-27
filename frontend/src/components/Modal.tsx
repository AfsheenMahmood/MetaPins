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
  token: string; // NEW - added token prop
};

const BACKEND_URL = "https://metapibns-production.up.railway.app/api";

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, data, username, token }) => {
  const [userData, setUserData] = useState<any>(null);
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState<CommentObj[]>([]);
  const [loading, setLoading] = useState(false);
  const placeholderAvatar = "https://via.placeholder.com/40?text=U";

  // Fetch user data when modal opens
  useEffect(() => {
    if (!data || !isOpen) return;

    const fetchUserData = async () => {
      try {
        const res = await axios.get(`${BACKEND_URL}/users/${username}`);
        setUserData({
          username: res.data.username,
          likes: res.data.likes || [],
          savedPins: res.data.savedPins || [],
          moodBoard: res.data.moodBoard || [],
          avatarUrl: res.data.avatarUrl || "",
        });
      } catch (err) {
        console.error("Failed to fetch user data:", err);
      }
    };

    fetchUserData();

    // Load comments from localStorage (we'll keep this as localStorage for now)
    try {
      const allComments = JSON.parse(localStorage.getItem("comments") || "{}") as Record<string, CommentObj[]>;
      const pinId = String(data._id || data.id);
      setComments(Array.isArray(allComments[pinId]) ? allComments[pinId] : []);
    } catch (err) {
      setComments([]);
    }
  }, [data, username, isOpen]);

  if (!isOpen || !data || !userData) return null;

  const pinId = String(data._id || data.id);

  // Toggle like
  const toggleLike = async () => {
    if (loading) return;
    setLoading(true);

    try {
      await axios.post(
        `${BACKEND_URL}/users/${username}/like/${pinId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Refresh user data
      const res = await axios.get(`${BACKEND_URL}/users/${username}`);
      setUserData({
        username: res.data.username,
        likes: res.data.likes || [],
        savedPins: res.data.savedPins || [],
        moodBoard: res.data.moodBoard || [],
        avatarUrl: res.data.avatarUrl || "",
      });
    } catch (err) {
      console.error("Failed to toggle like:", err);
      alert("Failed to update like");
    } finally {
      setLoading(false);
    }
  };

  // Toggle save
  const toggleSave = async () => {
    if (loading) return;
    setLoading(true);

    try {
      await axios.post(
        `${BACKEND_URL}/users/${username}/save/${pinId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Refresh user data
      const res = await axios.get(`${BACKEND_URL}/users/${username}`);
      setUserData({
        username: res.data.username,
        likes: res.data.likes || [],
        savedPins: res.data.savedPins || [],
        moodBoard: res.data.moodBoard || [],
        avatarUrl: res.data.avatarUrl || "",
      });
    } catch (err) {
      console.error("Failed to toggle save:", err);
      alert("Failed to update save");
    } finally {
      setLoading(false);
    }
  };

  // Toggle mood board
  const toggleMoodBoard = async () => {
    if (loading) return;
    setLoading(true);

    try {
      await axios.post(
        `${BACKEND_URL}/users/${username}/moodboard/${pinId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Refresh user data
      const res = await axios.get(`${BACKEND_URL}/users/${username}`);
      setUserData({
        username: res.data.username,
        likes: res.data.likes || [],
        savedPins: res.data.savedPins || [],
        moodBoard: res.data.moodBoard || [],
        avatarUrl: res.data.avatarUrl || "",
      });
    } catch (err) {
      console.error("Failed to toggle mood board:", err);
      alert("Failed to update mood board");
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

    // Update global comments store in localStorage
    const allComments = JSON.parse(localStorage.getItem("comments") || "{}") as Record<string, CommentObj[]>;
    const current = Array.isArray(allComments[pinId]) ? [...allComments[pinId]] : [];
    const updated = [...current, newComment];
    allComments[pinId] = updated;
    localStorage.setItem("comments", JSON.stringify(allComments));
    setComments(updated);
    setCommentText("");
  };

  const liked = Array.isArray(userData.likes) && userData.likes.includes(pinId);
  const saved = Array.isArray(userData.savedPins) && userData.savedPins.includes(pinId);
  const inMoodBoard = Array.isArray(userData.moodBoard) && userData.moodBoard.includes(pinId);

  // helper to read user avatar by username
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
      aria-labelledby="modal-title"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        backgroundColor: "rgba(0,0,0,0.6)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000,
      }}
    >
      <div
        style={{
          backgroundColor: "white",
          padding: "1rem",
          borderRadius: "8px",
          width: "90%",
          maxWidth: "700px",
          maxHeight: "90%",
          overflowY: "auto",
        }}
      >
        <button onClick={onClose} style={{ float: "right", fontSize: "1.2rem", cursor: "pointer" }} aria-label="Close">
          ✖
        </button>

        <div style={{ display: "flex", gap: "1rem", marginBottom: "0.5rem" }}>
          <span>❤️ {liked ? "Liked" : "Like"}</span>
          <span>💬 {comments.length} Comments</span>
        </div>

        {data.imageUrl && <img src={data.imageUrl} alt={data.title} style={{ width: "100%", borderRadius: "8px" }} />}
        <h2 id="modal-title">{data.title}</h2>
        <p>{data.description}</p>
        {data.category && (
          <p>
            <strong>Category:</strong> {data.category}
          </p>
        )}
        {data.tags && <p><strong>Tags:</strong> {data.tags.join(", ")}</p>}
        {data.color && <p><strong>Color:</strong> {data.color}</p>}

        <div style={{ display: "flex", gap: "1rem", margin: "1rem 0" }}>
          <button onClick={toggleLike} disabled={loading}>
            ❤️ {liked ? "Unlike" : "Like"}
          </button>
          <button onClick={toggleSave} disabled={loading}>
            📌 {saved ? "Saved" : "Save"}
          </button>
          <button onClick={toggleMoodBoard} disabled={loading}>
            {inMoodBoard ? "Remove from Mood Board" : "Add to Mood Board"}
          </button>
        </div>

        <div>
          <h3>Comments</h3>
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {comments.map((c, i) => (
              <li key={i} style={{ display: "flex", gap: 8, padding: "8px 0", borderBottom: "1px solid #f0f0f0" }}>
                <img src={getUserAvatar(c.author)} alt={`${c.author} avatar`} style={{ width: 40, height: 40, borderRadius: "50%", objectFit: "cover" }} />
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>
                    {c.author} 
                    <span style={{ fontSize: 12, fontWeight: 400, color: "#666", marginLeft: 8 }}>
                      {new Date(c.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <div style={{ fontSize: 14 }}>{c.text}</div>
                </div>
              </li>
            ))}
          </ul>

          <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Add a comment"
              style={{ flex: 1, padding: "0.5rem" }}
              onKeyDown={(e) => {
                if (e.key === "Enter") addComment();
              }}
              aria-label="Add a comment"
            />
            <button onClick={addComment}>Post</button>
          </div>
        </div>
      </div>
    </div>
  );
};