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
  pins: Pin[];
  onUpdateUser: (updatedUser: any) => void;
  onPinClick: (pin: Pin) => void;
};

export const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose, user, token, pins, onUpdateUser, onPinClick }) => {
  const [activeTab, setActiveTab] = useState<"created" | "saved" | "moodboard">("created");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen || !user) return null;

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

      // Update local user state
      onUpdateUser({ ...user, avatarUrl: res.data.avatarUrl });
    } catch (err: any) {
      console.error("Failed to upload avatar:", err);
      if (err.response && err.response.status === 404) {
        alert("Avatar upload failed: The backend does not support this feature yet. If you are using the production server, please redeploy your backend code.");
      } else {
        alert("Failed to upload avatar: " + (err.response?.data?.message || err.message));
      }
    } finally {
      setUploading(false);
    }
  };

  const getDisplayPins = () => {
    const list = pins || [];
    switch (activeTab) {
      case "created":
        return list.filter(p =>
          (user.uploaded || []).some((id: any) => String(id) === String(p.id)) ||
          String(p.user?._id || p.user?.id || p.user) === String(user.id) ||
          p.user?.username === user.username
        );
      case "saved":
        return list.filter(p => (user.savedPins || []).some((id: any) => String(id) === String(p.id)));
      case "moodboard":
        return list.filter(p => (user.moodBoard || []).some((id: any) => String(id) === String(p.id)));
      default:
        return [];
    }
  };

  const displayPins = getDisplayPins();
  const avatarUrl = user.avatarUrl || "https://via.placeholder.com/150?text=U";

  return (
    <div style={overlayStyle}>
      <div style={contentStyle}>
        <button onClick={onClose} style={closeButtonStyle}>✕</button>

        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <div style={{ position: "relative", display: "inline-block" }}>
            <div style={{ width: "120px", height: "120px", borderRadius: "50%", overflow: "hidden", border: "1px solid #ddd" }}>
              <img
                src={avatarUrl}
                alt="avatar"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </div>
            <div
              title="Change Avatar"
              onClick={() => fileInputRef.current?.click()}
              style={{
                position: "absolute", bottom: 4, right: 4,
                backgroundColor: "white", borderRadius: "50%", width: "32px", height: "32px",
                cursor: "pointer", display: "flex", justifyContent: "center", alignItems: "center",
                boxShadow: "0 2px 8px rgba(0,0,0,0.15)", border: "1px solid #ddd"
              }}
            >
              ✏️
            </div>
            <input disabled={uploading} type="file" ref={fileInputRef} hidden onChange={handleFileChange} accept="image/*" />
          </div>

          <h2 style={{ fontSize: "32px", fontWeight: "700", marginTop: "16px", marginBottom: "4px" }}>{user.name || user.username}</h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "16px" }}>@{user.username}</p>
        </div>

        <div style={{ display: "flex", justifyContent: "center", gap: "24px", marginBottom: "32px", borderBottom: "1px solid #efefef", paddingBottom: "12px" }}>
          <button
            onClick={() => setActiveTab("created")}
            className={`tab-btn ${activeTab === "created" ? "active" : ""}`}
            style={{ fontSize: "16px", fontWeight: "600", display: "flex", alignItems: "center", gap: "8px" }}
          >
            Created <span style={{ opacity: 0.6, fontSize: "14px" }}>{(user.uploaded || []).length}</span>
          </button>
          <button
            onClick={() => setActiveTab("saved")}
            className={`tab-btn ${activeTab === "saved" ? "active" : ""}`}
            style={{ fontSize: "16px", fontWeight: "600", display: "flex", alignItems: "center", gap: "8px" }}
          >
            Saved <span style={{ opacity: 0.6, fontSize: "14px" }}>{(user.savedPins || []).length}</span>
          </button>
          <button
            onClick={() => setActiveTab("moodboard")}
            className={`tab-btn ${activeTab === "moodboard" ? "active" : ""}`}
            style={{ fontSize: "16px", fontWeight: "600", display: "flex", alignItems: "center", gap: "8px" }}
          >
            Moodboard <span style={{ opacity: 0.6, fontSize: "14px" }}>{(user.moodBoard || []).length}</span>
          </button>
        </div>

        <div style={gridStyle}>
          {displayPins.length === 0 && (
            <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "60px", color: "var(--text-secondary)" }}>
              <p style={{ fontSize: "18px" }}>No pins here yet.</p>
              <button
                onClick={onClose}
                className="tab-btn"
                style={{ backgroundColor: "#efefef", borderRadius: "24px", padding: "12px 24px", marginTop: "12px", border: "none", cursor: "pointer", fontWeight: "600" }}
              >
                Go find some ideas
              </button>
            </div>
          )}
          {displayPins.map((pin) => (
            <div
              key={pin.id}
              style={pinCardStyle}
              onClick={() => onPinClick(pin)}
            >
              <img
                src={pin.imageUrl}
                alt={pin.title || "Pin"}
                style={{ width: "100%", borderRadius: "16px", objectFit: "cover", display: "block", transition: "0.2s" }}
                onMouseEnter={(e) => (e.currentTarget.style.filter = "brightness(0.8)")}
                onMouseLeave={(e) => (e.currentTarget.style.filter = "brightness(1)")}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Styles
const overlayStyle: React.CSSProperties = {
  position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh",
  backgroundColor: "rgba(0,0,0,0.6)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1100,
  backdropFilter: "blur(4px)"
};

const contentStyle: React.CSSProperties = {
  backgroundColor: "white", padding: "48px 32px 32px", borderRadius: "32px",
  width: "90%", maxWidth: "800px", height: "85vh", overflowY: "auto", position: "relative"
};

const closeButtonStyle: React.CSSProperties = {
  position: "absolute", top: "24px", right: "24px", background: "#efefef", border: "none",
  fontSize: "18px", cursor: "pointer", width: "40px", height: "40px", borderRadius: "50%",
  display: "flex", alignItems: "center", justifyContent: "center"
};

const gridStyle: React.CSSProperties = {
  display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "12px",
};

const pinCardStyle: React.CSSProperties = {
  cursor: "zoom-in",
};
