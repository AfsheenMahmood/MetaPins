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
      display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1400
    }}>
      <div style={{
        width: "92%", maxWidth: 720, maxHeight: "90%", overflowY: "auto",
        background: "#fff", borderRadius: 10, padding: 16, boxSizing: "border-box"
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <h2 style={{ margin: 0 }}>Upload a picture</h2>
          <div>
            <button onClick={onClose} disabled={uploading} style={{ padding: "6px 10px", cursor: uploading ? "not-allowed" : "pointer" }}>
              Close
            </button>
          </div>
        </div>

        <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
          <div style={{ flex: "1 1 280px", minWidth: 260 }}>
            <div style={{
              width: "100%",
              height: 300,
              border: "1px dashed #ddd",
              borderRadius: 8,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden",
              background: "#fafafa"
            }}>
              {preview ? (
                <div style={{ position: "relative", width: "100%", height: "100%" }}>
                  <img src={preview} alt="preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  {!uploading && (
                    <button
                      onClick={() => {
                        setFile(null);
                        setPreview(null);
                      }}
                      style={{
                        position: "absolute",
                        top: 8,
                        right: 8,
                        background: "rgba(0,0,0,0.6)",
                        color: "white",
                        border: "none",
                        borderRadius: 4,
                        padding: "4px 8px",
                        cursor: "pointer",
                        fontSize: 12
                      }}
                    >
                      Remove
                    </button>
                  )}
                </div>
              ) : (
                <label style={{ textAlign: "center", cursor: "pointer" }}>
                  <div style={{ fontSize: 24, marginBottom: 6 }}>📁</div>
                  <div style={{ color: "#666" }}>Click to choose image</div>
                  <input
                    type="file"
                    accept="image/*"
                    style={{ display: "none" }}
                    onChange={(e) => {
                      const f = e.target.files?.[0] ?? null;
                      setFile(f);
                    }}
                    disabled={uploading}
                  />
                </label>
              )}
            </div>

            {file && (
              <div style={{ marginTop: 8, fontSize: 12, color: "#666" }}>
                <strong>File:</strong> {file.name} ({(file.size / 1024).toFixed(1)} KB)
              </div>
            )}
          </div>

          <div style={{ flex: "1 1 320px", minWidth: 260 }}>
            <div style={{ marginBottom: 8 }}>
              <label style={{ display: "block", fontSize: 13, marginBottom: 6 }}>Title *</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                style={inputStyle}
                disabled={uploading}
              />
            </div>

            <div style={{ marginBottom: 8 }}>
              <label style={{ display: "block", fontSize: 13, marginBottom: 6 }}>Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                style={{ ...inputStyle, resize: "vertical" }}
                disabled={uploading}
              />
            </div>

            <div style={{ marginBottom: 8 }}>
              <label style={{ display: "block", fontSize: 13, marginBottom: 6 }}>Tags (comma separated)</label>
              <input
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                style={inputStyle}
                placeholder="nature, sunset, beach"
                disabled={uploading}
              />
            </div>

            <div style={{ display: "flex", gap: 8 }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: "block", fontSize: 13, marginBottom: 6 }}>Category</label>
                <input
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  style={inputStyle}
                  placeholder="Nature"
                  disabled={uploading}
                />
              </div>
              <div style={{ width: 110 }}>
                <label style={{ display: "block", fontSize: 13, marginBottom: 6 }}>Color</label>
                <input
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  placeholder="blue"
                  style={inputStyle}
                  disabled={uploading}
                />
              </div>
            </div>

            <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
              <button
                onClick={submit}
                disabled={uploading}
                style={{
                  padding: "8px 12px",
                  cursor: uploading ? "not-allowed" : "pointer",
                  backgroundColor: uploading ? "#ccc" : "#646cff",
                  color: "white",
                  border: "none",
                  borderRadius: 4
                }}
              >
                {uploading ? "Uploading..." : "Upload"}
              </button>
              <button
                onClick={onClose}
                disabled={uploading}
                style={{ padding: "8px 12px", cursor: uploading ? "not-allowed" : "pointer" }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "8px 10px",
  borderRadius: 6,
  border: "1px solid #ddd",
  boxSizing: "border-box"
};