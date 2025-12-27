import React, { useEffect, useState } from "react";

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
};

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, data, username }) => {
  const [userData, setUserData] = useState<any>(null);
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState<CommentObj[]>([]);
  const placeholderAvatar = "https://via.placeholder.com/40?text=U";

  useEffect(() => {
    if (!data) return;
    // load current user from localStorage and normalize fields
    const users = JSON.parse(localStorage.getItem("users") || "[]") as any[];
    const user = users.find((u: any) => u.username === username) || null;
    if (user) {
      setUserData({
        ...user,
        likes: Array.isArray(user.likes) ? user.likes : [],
        savedPins: Array.isArray(user.savedPins) ? user.savedPins : [],
        moodBoard: Array.isArray(user.moodBoard) ? user.moodBoard : [],
        comments: typeof user.comments === "object" && user.comments !== null ? user.comments : {},
      });
    } else {
      setUserData({
        username,
        likes: [],
        savedPins: [],
        moodBoard: [],
        comments: {},
        avatarUrl: "",
      });
    }

    // load global comments for this pin (migrate if older per-user comments exist)
    try {
      const allComments = JSON.parse(localStorage.getItem("comments") || "{}") as Record<string, CommentObj[]>;
      const pinId = String(data.id);
      const global = Array.isArray(allComments[pinId]) ? allComments[pinId] : [];

      // Backwards compatibility: check user.comments pin-specific array of strings (legacy) and merge
      const legacyComments: CommentObj[] = [];
      if (users && Array.isArray(users)) {
        users.forEach((u) => {
          if (u.comments && u.comments[pinId] && Array.isArray(u.comments[pinId])) {
            u.comments[pinId].forEach((c: any) => {
              if (typeof c === "string") {
                legacyComments.push({ author: u.username, text: c, createdAt: new Date().toISOString() });
              } else if (c && c.author && c.text) {
                legacyComments.push({ author: c.author, text: c.text, createdAt: c.createdAt ?? new Date().toISOString() });
              }
            });
          }
        });
      }

      // merge legacy and global (avoid duplicates by text+author)
      const merged = [...global];
      legacyComments.forEach((lc) => {
        const exists = merged.some((g) => g.author === lc.author && g.text === lc.text);
        if (!exists) merged.push(lc);
      });

      setComments(merged);
    } catch (err) {
      setComments([]);
    }
  }, [data, username]);

  if (!isOpen || !data || !userData) return null;

  const saveUserData = (updatedUser: any) => {
    const users = JSON.parse(localStorage.getItem("users") || "[]") as any[];
    const idx = users.findIndex((u: any) => u.username === username);
    if (idx === -1) {
      users.push(updatedUser);
    } else {
      users[idx] = updatedUser;
    }
    localStorage.setItem("users", JSON.stringify(users));
    setUserData({ ...updatedUser });
  };

  const toggleField = (field: "likes" | "savedPins" | "moodBoard") => {
    const curArr = Array.isArray(userData[field]) ? [...userData[field]] : [];
    const idStr = data.id;
    const index = curArr.indexOf(idStr);
    const newArr = index > -1 ? curArr.filter((v) => v !== idStr) : [...curArr, idStr];

    const updatedUser = {
      ...userData,
      [field]: newArr,
    };
    saveUserData(updatedUser);
  };

  const addComment = () => {
    const txt = commentText.trim();
    if (!txt) return;
    const newComment: CommentObj = {
      author: username,
      text: txt,
      createdAt: new Date().toISOString(),
    };

    // update global comments store in localStorage
    const allComments = JSON.parse(localStorage.getItem("comments") || "{}") as Record<string, CommentObj[]>;
    const pinId = String(data.id);
    const current = Array.isArray(allComments[pinId]) ? [...allComments[pinId]] : [];
    const updated = [...current, newComment];
    allComments[pinId] = updated;
    localStorage.setItem("comments", JSON.stringify(allComments));
    setComments(updated);

    // Optionally also record user's own comment-history (not required, but keep data consistent)
    const users = JSON.parse(localStorage.getItem("users") || "[]") as any[];
    const uidx = users.findIndex((u: any) => u.username === username);
    if (uidx > -1) {
      users[uidx].comments = users[uidx].comments || {};
      users[uidx].comments[pinId] = Array.isArray(users[uidx].comments[pinId]) ? [...users[uidx].comments[pinId], newComment] : [newComment];
      localStorage.setItem("users", JSON.stringify(users));
      // refresh userData so component stays consistent
      const refreshedUser = users[uidx];
      setUserData({
        ...refreshedUser,
        likes: Array.isArray(refreshedUser.likes) ? refreshedUser.likes : [],
        savedPins: Array.isArray(refreshedUser.savedPins) ? refreshedUser.savedPins : [],
        moodBoard: Array.isArray(refreshedUser.moodBoard) ? refreshedUser.moodBoard : [],
        comments: typeof refreshedUser.comments === "object" ? refreshedUser.comments : {},
      });
    }

    setCommentText("");
  };

  const liked = Array.isArray(userData.likes) && userData.likes.includes(data.id);
  const saved = Array.isArray(userData.savedPins) && userData.savedPins.includes(data.id);
  const inMoodBoard = Array.isArray(userData.moodBoard) && userData.moodBoard.includes(data.id);

  // helper to read user avatar by username
  const getUserAvatar = (authorName: string) => {
    try {
      const users = JSON.parse(localStorage.getItem("users") || "[]") as any[];
      const u = users.find((x) => x.username === authorName);
      return u?.avatarUrl || placeholderAvatar;
    } catch {
      return placeholderAvatar;
    }
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
        <button onClick={onClose} style={{ float: "right", fontSize: "1.2rem" }} aria-label="Close">
          ✖
        </button>

        <div style={{ display: "flex", gap: "1rem", marginBottom: "0.5rem" }}>
          <span>❤️ {liked ? 1 : 0} Likes</span>
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
          <button onClick={() => toggleField("likes")}>❤️ {liked ? "Unlike" : "Like"}</button>
          <button onClick={() => toggleField("savedPins")}>📌 {saved ? "Saved" : "Save"}</button>
          <button onClick={() => toggleField("moodBoard")}>{inMoodBoard ? "Added" : "Add to Mood Board"}</button>
        </div>

        <div>
          <h3>Comments</h3>
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {comments.map((c, i) => (
              <li key={i} style={{ display: "flex", gap: 8, padding: "8px 0", borderBottom: "1px solid #f0f0f0" }}>
                <img src={getUserAvatar(c.author)} alt={`${c.author} avatar`} style={{ width: 40, height: 40, borderRadius: "50%", objectFit: "cover" }} />
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{c.author} <span style={{ fontSize: 12, fontWeight: 400, color: "#666", marginLeft: 8 }}>{new Date(c.createdAt).toLocaleString()}</span></div>
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
              style={{ width: "80%", padding: "0.5rem", marginRight: "0.5rem" }}
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