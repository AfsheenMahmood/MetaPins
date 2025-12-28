import React, { useEffect, useState } from "react";
import axios from "axios";

type UploadModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (pin: any) => void;
};

import { BASE_URL } from "../config";
const BACKEND_URL = BASE_URL;

export const UploadModal: React.FC<UploadModalProps> = ({ isOpen, onClose, onSave }) => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState(""); // comma separated
  const [category, setCategory] = useState("");
  const [color, setColor] = useState("");
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!file) {
      setPreview(null);
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setPreview(String(reader.result));
    reader.readAsDataURL(file);
  }, [file]);

  useEffect(() => {
    if (!isOpen) {
      setFile(null);
      setPreview(null);
      setTitle("");
      setDescription("");
      setTags("");
      setCategory("");
      setColor("");
    }
  }, [isOpen]);

  const submit = async () => {
    if (!file) {
      alert("Please choose an image file.");
      return;
    }
    if (!title.trim()) {
      alert("Please provide a title for the image.");
      return;
    }

    const token = localStorage.getItem("authToken");
    if (!token) {
      alert("You must be logged in to upload.");
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("image", file);
      formData.append("title", title.trim());
      formData.append("description", description.trim());
      formData.append("category", category.trim());
      formData.append("color", color.trim());

      const tagList = tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean)
        .join(",");
      formData.append("tags", tagList);

      const res = await axios.post(`${BACKEND_URL}/pins`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      const normalized = {
        ...res.data,
        id: res.data._id || res.data.id,
      };

      onSave(normalized);
      onClose();
    } catch (err: any) {
      console.error("Upload failed:", err);
      console.error("Backend URL:", BACKEND_URL);
      console.error("Error details:", {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status
      });
      alert(err.response?.data?.message || err.message || "Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: "fixed", inset: 0,
      backgroundColor: "rgba(0,0,0,0.85)", display: "flex", justifyContent: "center", alignItems: "center",
      zIndex: 1400, backdropFilter: "blur(12px)", padding: "20px"
    }}>
      <div
        className="glass"
        style={{
          width: "100%", maxWidth: 1012, maxHeight: "90vh", overflowY: "auto",
          backgroundColor: "rgba(255, 255, 255, 0.98)", borderRadius: "40px", padding: "40px",
          display: "flex", flexDirection: "column", boxShadow: "var(--shadow-lg)",
          animation: "fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1)"
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "40px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ background: "var(--pinterest-red)", color: "white", padding: "8px 12px", borderRadius: "12px", fontWeight: "800", fontSize: "12px", letterSpacing: "1px" }}>NEW CONTENT</div>
            <h2 style={{ margin: 0, fontSize: "32px", fontWeight: "700", letterSpacing: "-1px" }}>Create a Pin</h2>
          </div>
          <button
            onClick={onClose}
            disabled={uploading}
            style={{
              background: "var(--gray-light)", border: "none", borderRadius: "50%",
              width: "44px", height: "44px", cursor: "pointer", fontSize: "16px",
              display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s"
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "var(--gray-hover)"}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "var(--gray-light)"}
          >✕</button>
        </div>

        <div style={{ display: "flex", gap: "48px", flexWrap: "wrap" }}>
          {/* Left - Visual Uploader */}
          <div style={{ flex: "1", minWidth: "340px" }}>
            <div
              style={{
                width: "100%", height: "520px", border: "2px dashed var(--gray-hover)", borderRadius: "32px",
                display: "flex", alignItems: "center", justifyContent: "center",
                overflow: "hidden", background: "var(--gray-light)", cursor: "pointer", transition: "all 0.3s"
              }}
              onMouseEnter={(e) => e.currentTarget.style.borderColor = "var(--text-secondary)"}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = "var(--gray-hover)"}
            >
              {preview ? (
                <div style={{ position: "relative", width: "100%", height: "100%" }}>
                  <img src={preview} alt="preview" style={{ width: "100%", height: "100%", objectFit: "cover", animation: "fadeIn 0.3s" }} />
                  {!uploading && (
                    <button
                      onClick={() => { setFile(null); setPreview(null); }}
                      style={{
                        position: "absolute", top: "20px", right: "20px", background: "white",
                        color: "var(--text-primary)", border: "none", borderRadius: "50%", width: "40px", height: "40px",
                        cursor: "pointer", boxShadow: "var(--shadow-md)", display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: "14px", fontWeight: "bold"
                      }}
                    >✕</button>
                  )}
                </div>
              ) : (
                <label style={{ textAlign: "center", cursor: "pointer", width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", padding: "40px" }}>
                  <div style={{ width: "64px", height: "64px", background: "white", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "28px", marginBottom: "20px", boxShadow: "var(--shadow-sm)" }}>⬆️</div>
                  <div style={{ fontWeight: "700", fontSize: "18px", color: "var(--text-primary)" }}>Select a visual asset</div>
                  <div style={{ color: "var(--text-secondary)", fontSize: "14px", marginTop: "12px", lineHeight: "1.5" }}>Our engine supports high-quality JPG, PNG, or GIF files. Max size 20MB.</div>
                  <input
                    type="file" accept="image/*" style={{ display: "none" }}
                    onChange={(e) => { const f = e.target.files?.[0] ?? null; setFile(f); }}
                    disabled={uploading}
                  />
                </label>
              )}
            </div>
          </div>

          {/* Right - Metadata Form */}
          <div style={{ flex: "1.2", minWidth: "340px", display: "flex", flexDirection: "column" }}>
            <div style={{ marginBottom: "24px" }}>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Add a compelling title"
                style={{ ...titleInputStyle }}
                disabled={uploading}
              />
            </div>

            <div style={{ marginBottom: "24px" }}>
              <div style={labelStyle}>CONTEXT & DESCRIPTION</div>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the aesthetic and analytics significance..."
                rows={4}
                style={inputStyle}
                disabled={uploading}
              />
            </div>

            <div style={{ marginBottom: "24px" }}>
              <div style={labelStyle}>DATA TAGS (SEARCH OPTIMIZATION)</div>
              <input
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                style={inputStyle}
                placeholder="e.g. brutalism, typography, palette"
                disabled={uploading}
              />
            </div>

            <div style={{ display: "flex", gap: "16px", marginBottom: "40px" }}>
              <div style={{ flex: 1 }}>
                <div style={labelStyle}>CATEGORY</div>
                <input
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  style={inputStyle}
                  placeholder="Design System"
                  disabled={uploading}
                />
              </div>
              <div style={{ width: "140px" }}>
                <div style={labelStyle}>CORE COLOR</div>
                <input
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  placeholder="e.g. Blue"
                  style={inputStyle}
                  disabled={uploading}
                />
              </div>
            </div>

            <div style={{ marginTop: "auto", display: "flex", justifyContent: "flex-end" }}>
              <button
                onClick={submit}
                disabled={uploading || !file || !title}
                style={{
                  padding: "0 40px",
                  height: "56px",
                  cursor: (uploading || !file || !title) ? "not-allowed" : "pointer",
                  backgroundColor: (uploading || !file || !title) ? "var(--gray-light)" : "var(--pinterest-red)",
                  color: (uploading || !file || !title) ? "var(--text-secondary)" : "white",
                  border: "none",
                  borderRadius: "30px",
                  fontWeight: "700",
                  fontSize: "16px",
                  boxShadow: (uploading || !file || !title) ? "none" : "var(--shadow-md)",
                  transition: "all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)"
                }}
                onMouseEnter={(e) => {
                  if (!(uploading || !file || !title)) {
                    e.currentTarget.style.transform = "scale(1.05)";
                    e.currentTarget.style.backgroundColor = "#ad081b";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!(uploading || !file || !title)) {
                    e.currentTarget.style.transform = "scale(1)";
                    e.currentTarget.style.backgroundColor = "var(--pinterest-red)";
                  }
                }}
              >
                {uploading ? "Analyzing & Processing..." : "Publish Inspiration"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const titleInputStyle: React.CSSProperties = {
  width: "100%",
  padding: "12px 0",
  fontSize: "36px",
  fontWeight: "800",
  border: "none",
  borderBottom: "2px solid var(--gray-light)",
  outline: "none",
  fontFamily: "inherit",
  letterSpacing: "-1px",
  color: "var(--text-primary)",
};

const labelStyle: React.CSSProperties = {
  fontSize: "11px",
  fontWeight: "800",
  marginBottom: "10px",
  color: "var(--text-secondary)",
  letterSpacing: "1px",
  textTransform: "uppercase"
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "16px 20px",
  borderRadius: "20px",
  border: "2px solid var(--gray-light)",
  boxSizing: "border-box",
  fontSize: "16px",
  fontFamily: "inherit",
  outline: "none",
  transition: "all 0.2s",
  backgroundColor: "white",
  fontWeight: "500"
};