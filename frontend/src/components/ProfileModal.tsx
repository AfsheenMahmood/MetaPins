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
      onUpdateUser({ ...user, avatarUrl: res.data.avatarUrl });
    } catch (err: any) {
      console.error("Failed to upload avatar:", err);
      alert("Failed to upload avatar: " + (err.response?.data?.message || err.message));
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
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
            <span style={{ color: "var(--text-secondary)", fontSize: "16px", fontWeight: "600" }}>@{user.username}</span>
            <span style={{ fontSize: "14px", color: "var(--pinterest-red)", fontWeight: "800", background: "#fee2e2", padding: "2px 8px", borderRadius: "6px" }}>PRO</span>
          </div>

          <div style={{ display: "flex", justifyContent: "center", gap: "24px", color: "var(--text-primary)", fontSize: "15px", fontWeight: "700" }}>
            <div style={{ display: "flex", gap: "6px" }}>
              <span>{user.followersCount || 0}</span>
              <span style={{ color: "var(--text-secondary)", fontWeight: "500" }}>followers</span>
            </div>
            <div style={{ display: "flex", gap: "6px" }}>
              <span>{user.followingCount || 0}</span>
              <span style={{ color: "var(--text-secondary)", fontWeight: "500" }}>following</span>
            </div>
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "center", gap: "32px", marginBottom: "40px", borderBottom: "1px solid var(--gray-light)", paddingBottom: "4px" }}>
          <button
            onClick={() => setActiveTab("created")}
            className={`tab-btn ${activeTab === "created" ? "active" : ""}`}
            style={tabBtnStyle(activeTab === "created")}
          >
            Created <span style={counterStyle(activeTab === "created")}>{(user.uploaded || []).length}</span>
          </button>
          <button
            onClick={() => setActiveTab("saved")}
            className={`tab-btn ${activeTab === "saved" ? "active" : ""}`}
            style={tabBtnStyle(activeTab === "saved")}
          >
            Saved <span style={counterStyle(activeTab === "saved")}>{(user.savedPins || []).length}</span>
          </button>
          <button
            onClick={() => setActiveTab("moodboard")}
            className={`tab-btn ${activeTab === "moodboard" ? "active" : ""}`}
            style={tabBtnStyle(activeTab === "moodboard")}
          >
            Moodboard <span style={counterStyle(activeTab === "moodboard")}>{(user.moodBoard || []).length}</span>
          </button>
        </div>

        <div style={gridStyle}>
          {displayPins.length === 0 && (
            <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "80px 40px", color: "var(--text-secondary)", animation: "fadeIn 0.5s" }}>
              <div style={{ fontSize: "40px", marginBottom: "16px" }}>🏜️</div>
              <p style={{ fontSize: "18px", fontWeight: "600", color: "var(--text-primary)" }}>Your collection is whisper quiet.</p>
              <p style={{ fontSize: "14px", marginBottom: "24px" }}>Start exploring to build your digital heritage.</p>
              <button
                onClick={onClose}
                style={{
                  backgroundColor: "var(--text-primary)", color: "white", borderRadius: "30px",
                  padding: "14px 28px", border: "none", cursor: "pointer", fontWeight: "700", boxShadow: "var(--shadow-md)"
                }}
              >
                Browse Collections
              </button>
            </div>
          )}
          {displayPins.map((pin, i) => (
            <div
              key={pin.id}
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

