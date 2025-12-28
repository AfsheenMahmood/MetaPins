import React, { useRef, useState } from "react";
import axios from "axios";
import type { Pin } from "../App";
import { BASE_URL } from "../config";

const BACKEND_URL = BASE_URL;

type ProfileModalProps = {
  isOpen: boolean;
  onClose: () => void;
  user: any; // Full user object
  token: string | null;
  onUpdateUser: (updatedUser: any) => void;
  onPinClick: (pin: Pin) => void;
  isPublic?: boolean;
  currentUser?: any;
  onNavigateToUser?: (user: any) => void;
  onUpdateCurrentUser?: (user: any) => void;
};

export const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose, user, token, onUpdateUser, onPinClick, isPublic, currentUser, onNavigateToUser, onUpdateCurrentUser }) => {
  const [activeTab, setActiveTab] = useState<"created" | "saved" | "moodboard" | "boards" | "followers" | "following">("created");
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [boards, setBoards] = useState<any[]>([]);
  const [selectedBoard, setSelectedBoard] = useState<any | null>(null);
  const [showCreateBoard, setShowCreateBoard] = useState(false);
  const [newBoardTitle, setNewBoardTitle] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen || !user) return null;

  const isFollowing = currentUser && (currentUser.following || []).some((id: any) => String(id) === String(user.id) || String(id?._id || id?.id) === String(user.id));

  const fetchBoards = async () => {
    if (!token) return;
    try {
      const res = await axios.get(`${BACKEND_URL}/users/${user.username}/boards`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBoards(res.data);
    } catch (err) {
      console.error("Failed to fetch boards:", err);
    }
  };

  const handleCreateBoard = async () => {
    if (!newBoardTitle.trim() || !token) return;
    try {
      await axios.post(`${BACKEND_URL}/users/${user.username}/boards`, { title: newBoardTitle }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNewBoardTitle("");
      setShowCreateBoard(false);
      fetchBoards();
    } catch (err) {
      console.error("Failed to create board:", err);
    }
  };

  React.useEffect(() => {
    if (isOpen) {
      fetchBoards();
      setSelectedBoard(null);
    }
  }, [isOpen, user.username]);

  const toggleFollow = async () => {
    if (!token || !currentUser || loading) return;
    setLoading(true);
    try {
      const res = await axios.post(`${BACKEND_URL}/users/${currentUser.username}/follow/${user.username}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Update the public profile user with new follower count
      onUpdateUser({ ...user, followersCount: res.data.followersCount });

      // Update the logged-in user with new following list and count
      if (onUpdateCurrentUser) {
        onUpdateCurrentUser({
          ...currentUser,
          following: res.data.following,
          followingCount: res.data.followingCount
        });
      }
    } catch (err) {
      console.error("Follow failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;

    const file = e.target.files[0];
    const formData = new FormData();
    formData.append("image", file);

    setUploading(true);
    try {
      const res = await axios.post(
        `${BACKEND_URL}/users/${user.username}/avatar`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`
          }
        }
      );
      onUpdateUser({ ...user, avatarUrl: res.data.avatarUrl });
    } catch (err: any) {
      console.error("Failed to upload avatar:", err);
      alert("Failed to upload avatar: " + (err.response?.data?.message || err.message));
    } finally {
      setUploading(false);
    }
  };

  const displayPins = (() => {
    if (selectedBoard) return selectedBoard.pins || [];
    if (activeTab === "created") return user.uploaded || [];
    if (activeTab === "saved" && !isPublic) return user.savedPins || [];
    if (activeTab === "moodboard" && !isPublic) return user.moodBoard || [];
    return [];
  })();
  const avatarUrl = user.avatarUrl || `https://via.placeholder.com/150?text=${user.username[0].toUpperCase()}`;

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div
        className="glass"
        style={contentStyle}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          style={closeButtonStyle}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "var(--gray-hover)"}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "var(--gray-light)"}
        >✕</button>

        <div style={{ textAlign: "center", marginBottom: "48px" }}>
          <div style={{ position: "relative", display: "inline-block" }}>
            <div style={{
              width: "140px", height: "140px", borderRadius: "50%", overflow: "hidden",
              border: "4px solid white", boxShadow: "var(--shadow-md)", background: "var(--gray-light)"
            }}>
              <img
                src={avatarUrl}
                alt="avatar"
                style={{ width: "100%", height: "100%", objectFit: "cover", transition: "all 0.4s" }}
              />
            </div>
            <div
              title="Change Profile Photo"
              onClick={() => fileInputRef.current?.click()}
              style={{
                position: "absolute", bottom: "8px", right: "8px",
                backgroundColor: "white", borderRadius: "50%", width: "40px", height: "40px",
                cursor: "pointer", display: "flex", justifyContent: "center", alignItems: "center",
                boxShadow: "var(--shadow-md)", transition: "all 0.2s"
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.1)"}
              onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
            >
              📷
            </div>
            <input disabled={uploading} type="file" ref={fileInputRef} hidden onChange={handleFileChange} accept="image/*" />
          </div>

          <h2 style={{ fontSize: "36px", fontWeight: "800", marginTop: "20px", marginBottom: "4px", color: "var(--text-primary)", letterSpacing: "-1px" }}>{user.name || user.username}</h2>
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "12px", marginBottom: "24px" }}>
            <span style={{ color: "var(--text-secondary)", fontSize: "16px", fontWeight: "600" }}>@{user.username}</span>
            <span style={{ fontSize: "14px", color: "var(--pinterest-red)", fontWeight: "800", background: "#fee2e2", padding: "2px 8px", borderRadius: "6px" }}>PRO</span>
          </div>

          <div style={{ display: "flex", justifyContent: "center", gap: "24px", color: "var(--text-primary)", fontSize: "15px", fontWeight: "700", marginBottom: "24px" }}>
            <div
              onClick={() => setActiveTab("followers")}
              style={{ display: "flex", gap: "6px", cursor: "pointer" }}
            >
              <span>{user.followersCount || 0}</span>
              <span style={{ color: "var(--text-secondary)", fontWeight: "500" }}>followers</span>
            </div>
            <div
              onClick={() => setActiveTab("following")}
              style={{ display: "flex", gap: "6px", cursor: "pointer" }}
            >
              <span>{user.followingCount || 0}</span>
              <span style={{ color: "var(--text-secondary)", fontWeight: "500" }}>following</span>
            </div>
          </div>

          {isPublic && currentUser && currentUser.username !== user.username && (
            <button
              onClick={toggleFollow}
              disabled={loading}
              style={{
                backgroundColor: isFollowing
                  ? "var(--text-primary)"
                  : "var(--pinterest-red)",
                color: "white", borderRadius: "30px", padding: "12px 32px", fontSize: "16px",
                fontWeight: "700", border: "none", cursor: "pointer", transition: "0.2s",
                boxShadow: "var(--shadow-md)"
              }}
            >
              {isFollowing ? "Followed" : "Follow"}
            </button>
          )}
        </div>

        <div style={{ display: "flex", justifyContent: "center", gap: "32px", marginBottom: "40px", borderBottom: "1px solid var(--gray-light)", paddingBottom: "4px" }}>
          <button
            onClick={() => setActiveTab("created")}
            className={`tab-btn ${activeTab === "created" ? "active" : ""}`}
            style={tabBtnStyle(activeTab === "created")}
          >
            Created <span style={counterStyle(activeTab === "created")}>{(user.uploaded || []).length}</span>
          </button>
          {!isPublic && (
            <button
              onClick={() => setActiveTab("saved")}
              className={`tab-btn ${activeTab === "saved" ? "active" : ""}`}
              style={tabBtnStyle(activeTab === "saved")}
            >
              Saved <span style={counterStyle(activeTab === "saved")}>{(user.savedPins || []).length}</span>
            </button>
          )}
          {!isPublic && (user.moodBoard || []).length > 0 && (
            <button
              onClick={() => setActiveTab("moodboard")}
              className={`tab-btn ${activeTab === "moodboard" ? "active" : ""}`}
              style={tabBtnStyle(activeTab === "moodboard")}
            >
              Moodboard <span style={counterStyle(activeTab === "moodboard")}>{(user.moodBoard || []).length}</span>
            </button>
          )}
          {!isPublic && (
            <button
              onClick={() => { setActiveTab("boards"); setSelectedBoard(null); }}
              className={`tab-btn ${activeTab === "boards" ? "active" : ""}`}
              style={tabBtnStyle(activeTab === "boards")}
            >
              Boards <span style={counterStyle(activeTab === "boards")}>{boards.length}</span>
            </button>
          )}
        </div>

        <div style={{ flex: 1 }}>
          {selectedBoard && (
            <div style={{ marginBottom: "24px", display: "flex", alignItems: "center", gap: "16px" }}>
              <button
                onClick={() => setSelectedBoard(null)}
                style={{ background: "none", border: "none", fontSize: "24px", cursor: "pointer", color: "var(--text-primary)" }}
              >
                ←
              </button>
              <h3 style={{ fontSize: "24px", fontWeight: "700" }}>{selectedBoard.title}</h3>
            </div>
          )}

          {(activeTab === "followers" || activeTab === "following") ? (
            <div style={{ maxWidth: "600px", margin: "0 auto", animation: "fadeIn 0.4s" }}>
              <h3 style={{ marginBottom: "24px", fontSize: "20px", fontWeight: "700" }}>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</h3>
              {(user[activeTab] || []).length === 0 ? (
                <p style={{ textAlign: "center", color: "var(--text-secondary)", padding: "40px" }}>No users found here yet.</p>
              ) : (
                user[activeTab].map((u: any) => (
                  <div
                    key={u._id || u.id}
                    onClick={() => onNavigateToUser && onNavigateToUser(u)}
                    style={{
                      display: "flex", alignItems: "center", gap: "16px", padding: "12px",
                      borderRadius: "16px", cursor: "pointer", transition: "0.2s"
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "var(--gray-light)"}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                  >
                    <img
                      src={u.avatarUrl || `https://via.placeholder.com/40?text=${u.username?.[0]?.toUpperCase()}`}
                      alt="avatar"
                      style={{ width: "48px", height: "48px", borderRadius: "50%", objectFit: "cover" }}
                    />
                    <div>
                      <div style={{ fontWeight: "700", color: "var(--text-primary)" }}>{u.name || u.username}</div>
                      <div style={{ fontSize: "14px", color: "var(--text-secondary)" }}>@{u.username}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : activeTab === "boards" && !selectedBoard ? (
            <div style={{ animation: "fadeIn 0.5s" }}>
              {!isPublic && (
                <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "24px" }}>
                  <button
                    onClick={() => setShowCreateBoard(true)}
                    style={{
                      backgroundColor: "var(--gray-light)", color: "var(--text-primary)", border: "none",
                      padding: "10px 20px", borderRadius: "20px", fontWeight: "700", cursor: "pointer",
                      display: "flex", alignItems: "center", gap: "8px"
                    }}
                  >
                    <span style={{ fontSize: "20px" }}>+</span> Create Board
                  </button>
                </div>
              )}

              {showCreateBoard && (
                <div style={{
                  backgroundColor: "var(--gray-light)", padding: "20px", borderRadius: "20px",
                  marginBottom: "24px", display: "flex", gap: "12px", alignItems: "center"
                }}>
                  <input
                    placeholder="Board name"
                    value={newBoardTitle}
                    onChange={(e) => setNewBoardTitle(e.target.value)}
                    style={{
                      flex: 1, padding: "12px 20px", borderRadius: "24px", border: "1px solid var(--gray-medium)",
                      fontSize: "16px", outline: "none"
                    }}
                  />
                  <button
                    onClick={handleCreateBoard}
                    style={{
                      backgroundColor: "var(--pinterest-red)", color: "white", border: "none",
                      padding: "12px 24px", borderRadius: "24px", fontWeight: "700", cursor: "pointer"
                    }}
                  >
                    Create
                  </button>
                  <button
                    onClick={() => setShowCreateBoard(false)}
                    style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-secondary)" }}
                  >
                    Cancel
                  </button>
                </div>
              )}

              <div style={gridStyle}>
                {boards.length === 0 && (
                  <p style={{ gridColumn: "1/-1", textAlign: "center", padding: "40px", color: "var(--text-secondary)" }}>
                    No boards found.
                  </p>
                )}
                {boards.map((board) => (
                  <div
                    key={board._id}
                    onClick={() => setSelectedBoard(board)}
                    style={{ cursor: "pointer", textAlign: "left" }}
                  >
                    <div style={{
                      aspectRatio: "1", borderRadius: "20px", overflow: "hidden",
                      backgroundColor: "var(--gray-light)", marginBottom: "12px",
                      display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2px"
                    }}>
                      {board.pins && board.pins.length > 0 ? (
                        board.pins.slice(0, 4).map((p: any, i: number) => (
                          <img
                            key={i}
                            src={p.imageUrl}
                            alt="preview"
                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                          />
                        ))
                      ) : (
                        <div style={{ gridColumn: "1/-1", display: "flex", justifyContent: "center", alignItems: "center", height: "100%" }}>
                          🖼️
                        </div>
                      )}
                    </div>
                    <div style={{ fontWeight: "700", fontSize: "16px", paddingLeft: "8px" }}>{board.title}</div>
                    <div style={{ fontSize: "12px", color: "var(--text-secondary)", paddingLeft: "8px" }}>
                      {(board.pins || []).length} Pins
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div style={gridStyle}>
              {displayPins.length === 0 && (
                <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "80px 40px", color: "var(--text-secondary)", animation: "fadeIn 0.5s" }}>
                  <div style={{ fontSize: "40px", marginBottom: "16px" }}>🏜️</div>
                  <p style={{ fontSize: "18px", fontWeight: "600", color: "var(--text-primary)" }}>Your collection is whisper quiet.</p>
                  <p style={{ fontSize: "14px", marginBottom: "24px" }}>Start exploring to build your digital heritage.</p>
                  {!isPublic && (
                    <button
                      onClick={onClose}
                      style={{
                        backgroundColor: "var(--text-primary)", color: "white", borderRadius: "30px",
                        padding: "14px 28px", border: "none", cursor: "pointer", fontWeight: "700", boxShadow: "var(--shadow-md)"
                      }}
                    >
                      Browse Collections
                    </button>
                  )}
                </div>
              )}
              {displayPins.map((pin: any, i: number) => (
                <div
                  key={pin.id || pin._id}
                  className="pin-card"
                  style={{ cursor: "pointer", animation: `fadeIn 0.5s ease-out ${i * 0.05}s both` }}
                  onClick={() => onPinClick(pin)}
                >
                  <div style={{ borderRadius: "20px", overflow: "hidden", boxShadow: "var(--shadow-sm)", transition: "all 0.3s" }}>
                    <img
                      src={pin.imageUrl}
                      alt={pin.title || "Pin"}
                      style={{ width: "100%", objectFit: "cover", display: "block", transition: "all 0.4s" }}
                      onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
                      onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const overlayStyle: React.CSSProperties = {
  position: "fixed", inset: 0,
  backgroundColor: "rgba(0,0,0,0.85)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1100,
  backdropFilter: "blur(12px)", padding: "20px"
};

const contentStyle: React.CSSProperties = {
  backgroundColor: "rgba(255, 255, 255, 0.98)", padding: "64px 40px 40px", borderRadius: "40px",
  width: "100%", maxWidth: "1000px", height: "90vh", overflowY: "auto", position: "relative",
  boxShadow: "var(--shadow-lg)", animation: "fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1)"
};

const closeButtonStyle: React.CSSProperties = {
  position: "absolute", top: "32px", right: "32px", background: "var(--gray-light)", border: "none",
  fontSize: "16px", cursor: "pointer", width: "44px", height: "44px", borderRadius: "50%",
  display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s"
};

const gridStyle: React.CSSProperties = {
  display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "24px",
};

const tabBtnStyle = (active: boolean): React.CSSProperties => ({
  fontSize: "16px",
  fontWeight: "700",
  display: "flex",
  alignItems: "center",
  gap: "10px",
  paddingBottom: "12px",
  color: active ? "var(--text-primary)" : "var(--text-secondary)",
  borderBottom: active ? "3px solid var(--text-primary)" : "3px solid transparent",
  transition: "all 0.2s"
});

const counterStyle = (active: boolean): React.CSSProperties => ({
  fontSize: "12px",
  background: active ? "var(--text-primary)" : "var(--gray-light)",
  color: active ? "white" : "var(--text-secondary)",
  padding: "2px 10px",
  borderRadius: "10px",
  transition: "all 0.2s"
});

