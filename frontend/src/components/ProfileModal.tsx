import React from "react";
import type { Pin } from "../App";

type ProfileModalProps = {
  isOpen: boolean;
  onClose: () => void;
  username: string;
  pins: Pin[];
};

export const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose, username, pins }) => {
  if (!isOpen) return null;

  // Filter pins uploaded by the user
  const userPins = pins.filter((p) => p.createdAt && p.id); // All pins in this prototype

  return (
    <div style={overlayStyle}>
      <div style={contentStyle}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1rem" }}>
          <h2>{username}'s Profile</h2>
          <button onClick={onClose} style={closeButtonStyle}>
            ✕
          </button>
        </div>

        <div style={gridStyle}>
          {userPins.length === 0 && <p>No pins uploaded yet.</p>}
          {userPins.map((pin) => (
            <div key={pin.id} style={pinCardStyle}>
              <img src={pin.imageUrl} alt={pin.title || "Pin"} style={{ width: "100%", borderRadius: "4px" }} />
              {pin.title && <p style={{ marginTop: 4 }}>{pin.title}</p>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Styles
const overlayStyle: React.CSSProperties = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100vw",
  height: "100vh",
  backgroundColor: "rgba(0,0,0,0.4)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 1000,
};

const contentStyle: React.CSSProperties = {
  backgroundColor: "white",
  padding: "1rem",
  borderRadius: "8px",
  width: "600px",
  maxHeight: "80vh",
  overflowY: "auto",
};

const closeButtonStyle: React.CSSProperties = {
  background: "transparent",
  border: "none",
  fontSize: "1.2rem",
  cursor: "pointer",
};

const gridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
  gap: "0.5rem",
};

const pinCardStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
};
