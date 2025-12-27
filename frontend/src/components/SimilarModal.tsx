import React from "react";
import type { Pin } from "../utils/similarity";

type SimilarModalProps = {
  isOpen: boolean;
  onClose: () => void;
  initialPin: Pin | null;
  results: Pin[];
  onOpenPin: (pin: Pin) => void;
};

export const SimilarModal: React.FC<SimilarModalProps> = ({ isOpen, onClose, initialPin, results, onOpenPin }) => {
  if (!isOpen || !initialPin) return null;

  return (
    <div style={{
      position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.7)",
      display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1600,
      backdropFilter: "blur(8px)"
    }} onClick={onClose}>
      <div
        style={{
          width: "95%", maxWidth: 1100, height: "85vh",
          background: "#fff", borderRadius: 32, overflow: "hidden",
          display: "flex", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)"
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Left - Target Preview */}
        <div style={{ flex: "0 0 320px", background: "#f8f8f8", borderRight: "1px solid #eee", padding: 32, display: "flex", flexDirection: "column" }}>
          <h3 style={{ margin: "0 0 20px", fontSize: "20px", fontWeight: "700" }}>Visual Search</h3>
          <div style={{ width: "100%", borderRadius: 16, overflow: "hidden", marginBottom: 20 }}>
            <img src={initialPin.imageUrl} alt="target" style={{ width: "100%", display: "block" }} />
          </div>
          <div style={{ fontSize: "14px", fontWeight: "600", color: "#111" }}>Searching similar to:</div>
          <div style={{ fontSize: "18px", fontWeight: "400", marginTop: 4, color: "#555" }}>{initialPin.title || "Selected Item"}</div>

          <div style={{ marginTop: "auto" }}>
            <button
              onClick={onClose}
              style={{
                width: "100%", padding: "14px", borderRadius: 28, border: "none",
                backgroundColor: "#efefef", cursor: "pointer", fontWeight: "700",
                transition: "0.2s"
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#e2e2e2"}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#efefef"}
            >
              Close Search
            </button>
          </div>
        </div>

        {/* Right - Results */}
        <div style={{ flex: 1, padding: 32, overflowY: "auto" }}>
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 13, color: "#767676", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.5px" }}>
              {results.length} results found based on visual & text data
            </div>
          </div>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
            gap: 16
          }}>
            {results.length === 0 && (
              <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "100px 0", color: "#767676" }}>
                <div style={{ fontSize: 40, marginBottom: 16 }}>🔍</div>
                <div style={{ fontSize: 18, fontWeight: "600" }}>No similar pins found</div>
                <div style={{ fontSize: 14 }}>Try selecting a pin with more tags or a clearer description.</div>
              </div>
            )}
            {results.map((p) => (
              <div
                key={String(p.id)}
                onClick={() => onOpenPin(p)}
                style={{ cursor: "pointer", transition: "0.2s" }}
                onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-4px)"}
                onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(0)"}
              >
                <div style={{ borderRadius: 16, overflow: "hidden", marginBottom: 8, boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)" }}>
                  <img src={p.imageUrl} alt={p.title} style={{ width: "100%", height: 200, objectFit: "cover", display: "block" }} />
                </div>
                <div style={{ padding: "0 4px" }}>
                  <div style={{ fontSize: 14, fontWeight: "700", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.title}</div>
                  <div style={{ fontSize: 12, color: "#767676", marginTop: 2 }}>
                    {p.tags && p.tags.slice(0, 2).map(t => `#${t}`).join(" ")}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimilarModal;