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
      // reset fields when closed
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
      // Create FormData for multipart upload
      const formData = new FormData();
      formData.append("image", file);
      formData.append("title", title.trim());
      formData.append("description", description.trim());
      formData.append("category", category.trim());
      formData.append("color", color.trim());

      // Tags as comma-separated string
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

      // Normalize response
      const normalized = {
        ...res.data,
        id: res.data._id || res.data.id,
      };

      onSave(normalized);
      onClose();
    } catch (err: any) {
      console.error("Upload failed:", err);
      alert(err.response?.data?.message || "Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.6)",
      display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1400,
      backdropFilter: "blur(4px)"
    }}>
      <div style={{
        width: "92%", maxWidth: 880, maxHeight: "90vh", overflowY: "auto",
        background: "#fff", borderRadius: 32, padding: 40, boxSizing: "border-box",
        boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)", position: "relative"
      }}>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
          <h2 style={{ margin: 0, fontSize: "28px", fontWeight: "700" }}>Create a Pin</h2>
          <button
            onClick={onClose}
            disabled={uploading}
            style={{
              background: "#efefef", border: "none", borderRadius: "50%",
              width: "40px", height: "40px", cursor: "pointer", fontSize: "18px"
            }}
          >✕</button>
        </div>

        <div style={{ display: "flex", gap: 32, flexWrap: "wrap" }}>
          {/* Left - Upload Area */}
          <div style={{ flex: "1", minWidth: 300 }}>
            <div style={{
              width: "100%", height: 450, border: "2px dashed #dadada", borderRadius: 24,
              display: "flex", alignItems: "center", justifyContent: "center",
              overflow: "hidden", background: "#efefef", cursor: "pointer", transition: "0.2s"
            }}>
              {preview ? (
                <div style={{ position: "relative", width: "100%", height: "100%" }}>
                  <img src={preview} alt="preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  {!uploading && (
                    <button
                      onClick={() => { setFile(null); setPreview(null); }}
                      style={{
                        position: "absolute", top: 12, right: 12, background: "white",
                        color: "#111", border: "none", borderRadius: "50%", width: "32px", height: "32px",
                        cursor: "pointer", boxShadow: "0 2px 8px rgba(0,0,0,0.2)"
                      }}
                    >✕</button>
                  )}
                </div>
              ) : (
                <label style={{ textAlign: "center", cursor: "pointer", width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
                  <div style={{ fontSize: 40, marginBottom: 12 }}>⬆️</div>
                  <div style={{ fontWeight: "600", fontSize: "16px" }}>Choose a file</div>
                  <div style={{ color: "#767676", fontSize: "14px", marginTop: "8px" }}>We recommend high-quality .jpg files</div>
                  <input
                    type="file" accept="image/*" style={{ display: "none" }}
                    onChange={(e) => { const f = e.target.files?.[0] ?? null; setFile(f); }}
                    disabled={uploading}
                  />
                </label>
              )}
            </div>
          </div>

          {/* Right - Form Area */}
          <div style={{ flex: "1.2", minWidth: 300, display: "flex", flexDirection: "column" }}>
            <div style={{ marginBottom: 20 }}>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Add your title"
                style={{ ...titleInputStyle, borderBottom: "1px solid #ddd" }}
                disabled={uploading}
              />
            </div>

            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: "12px", fontWeight: "600", marginBottom: "8px", color: "#767676" }}>Description</div>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Tell everyone what your Pin is about"
                rows={3}
                style={inputStyle}
                disabled={uploading}
              />
            </div>

            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: "12px", fontWeight: "600", marginBottom: "8px", color: "#767676" }}>Tags</div>
              <input
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                style={inputStyle}
                placeholder="Add tags (nature, design, etc.)"
                disabled={uploading}
              />
            </div>

            <div style={{ display: "flex", gap: 12, marginBottom: 32 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: "12px", fontWeight: "600", marginBottom: "8px", color: "#767676" }}>Category</div>
                <input
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  style={inputStyle}
                  placeholder="Design"
                  disabled={uploading}
                />
              </div>
              <div style={{ width: 120 }}>
                <div style={{ fontSize: "12px", fontWeight: "600", marginBottom: "8px", color: "#767676" }}>Color</div>
                <input
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  placeholder="#ffffff"
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
                  padding: "12px 24px",
                  cursor: (uploading || !file || !title) ? "not-allowed" : "pointer",
                  backgroundColor: (uploading || !file || !title) ? "#efefef" : "var(--pinterest-red)",
                  color: (uploading || !file || !title) ? "#767676" : "white",
                  border: "none",
                  borderRadius: 24,
                  fontWeight: "700",
                  fontSize: "16px",
                  transition: "0.2s"
                }}
              >
                {uploading ? "Uploading..." : "Publish"}
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
  padding: "16px 0",
  fontSize: "32px",
  fontWeight: "700",
  border: "none",
  outline: "none",
  fontFamily: "inherit",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "12px 16px",
  borderRadius: 16,
  border: "1px solid #ddd",
  boxSizing: "border-box",
  fontSize: "16px",
  fontFamily: "inherit",
  outline: "none",
};