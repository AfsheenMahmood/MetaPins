import React, { useState } from "react";
import type { Pin } from "../App";

type UploadModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (pin: Pin) => void;
};

export const UploadModal: React.FC<UploadModalProps> = ({ isOpen, onClose, onSave }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageUrl) return alert("Please enter an image URL.");

    const newPin: Pin = {
      id: Date.now().toString(),
      title,
      description,
      imageUrl,
      createdAt: new Date().toISOString(),
    };

    onSave(newPin);
    setTitle("");
    setDescription("");
    setImageUrl("");
    onClose();
  };

  return (
    <div style={modalOverlayStyle}>
      <div style={modalContentStyle}>
        <h2>Upload a new Pin</h2>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          <input
            type="text"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={inputStyle}
          />
          <input
            type="text"
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            style={inputStyle}
          />
          <input
            type="text"
            placeholder="Image URL"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            style={inputStyle}
          />
          <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
            <button type="button" onClick={onClose} style={buttonStyleGray}>
              Cancel
            </button>
            <button type="submit" style={buttonStylePrimary}>
              Upload
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Styles
const modalOverlayStyle: React.CSSProperties = {
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

const modalContentStyle: React.CSSProperties = {
  backgroundColor: "white",
  padding: "1.5rem",
  borderRadius: "8px",
  width: "400px",
  maxWidth: "90%",
  boxShadow: "0 0 15px rgba(0,0,0,0.2)",
};

const inputStyle: React.CSSProperties = {
  padding: "0.5rem",
  borderRadius: "4px",
  border: "1px solid #ccc",
  width: "100%",
};

const buttonStylePrimary: React.CSSProperties = {
  backgroundColor: "#646cff",
  color: "white",
  border: "none",
  padding: "0.5rem 1rem",
  borderRadius: "4px",
  cursor: "pointer",
};

const buttonStyleGray: React.CSSProperties = {
  backgroundColor: "#eee",
  color: "#333",
  border: "none",
  padding: "0.5rem 1rem",
  borderRadius: "4px",
  cursor: "pointer",
};
