import React, { useEffect, useState } from "react";

type UploadModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (pin: any) => void;
};

export const UploadModal: React.FC<UploadModalProps> = ({ isOpen, onClose, onSave }) => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState(""); // comma separated
  const [category, setCategory] = useState("");
  const [color, setColor] = useState("");

  useEffect(() => {
    if (!file) {
      setPreview(null);
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setPreview(String(reader.result));
    reader.readAsDataURL(file);
    return () => {
      // nothing to cleanup for FileReader
    };
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
    if (!file && !preview) {
      alert("Please choose an image.");
      return;
    }
    if (!title.trim()) {
      alert("Please provide a title for the image.");
      return;
    }

    // if preview already available (FileReader done), use that
    const imageUrl = preview!;
    const pin = {
      id: `pin_${Date.now()}_${Math.floor(Math.random() * 9999)}`,
      imageUrl,
      title: title.trim(),
      description: description.trim(),
      tags: tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      category: category.trim(),
      color: color.trim(),
      createdAt: new Date().toISOString(),
    };
    onSave(pin);
    onClose();
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
            <button onClick={() => { onClose(); }} style={{ padding: "6px 10px", cursor: "pointer" }}>Close</button>
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
                <img src={preview} alt="preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
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
                  />
                </label>
              )}
            </div>
          </div>

          <div style={{ flex: "1 1 320px", minWidth: 260 }}>
            <div style={{ marginBottom: 8 }}>
              <label style={{ display: "block", fontSize: 13, marginBottom: 6 }}>Title *</label>
              <input value={title} onChange={(e) => setTitle(e.target.value)} style={inputStyle} />
            </div>

            <div style={{ marginBottom: 8 }}>
              <label style={{ display: "block", fontSize: 13, marginBottom: 6 }}>Description</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} style={{ ...inputStyle, resize: "vertical" }} />
            </div>

            <div style={{ marginBottom: 8 }}>
              <label style={{ display: "block", fontSize: 13, marginBottom: 6 }}>Tags (comma separated)</label>
              <input value={tags} onChange={(e) => setTags(e.target.value)} style={inputStyle} />
            </div>

            <div style={{ display: "flex", gap: 8 }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: "block", fontSize: 13, marginBottom: 6 }}>Category</label>
                <input value={category} onChange={(e) => setCategory(e.target.value)} style={inputStyle} />
              </div>
              <div style={{ width: 110 }}>
                <label style={{ display: "block", fontSize: 13, marginBottom: 6 }}>Color</label>
                <input value={color} onChange={(e) => setColor(e.target.value)} placeholder="#f0f" style={inputStyle} />
              </div>
            </div>

            <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
              <button onClick={submit} style={{ padding: "8px 12px", cursor: "pointer" }}>Save</button>
              <button onClick={() => { onClose(); }} style={{ padding: "8px 12px", cursor: "pointer" }}>Cancel</button>
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