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
      position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.6)",
      display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1600
    }}>
      <div style={{ width: "92%", maxWidth: 1000, maxHeight: "90%", overflowY: "auto", background: "#fff", borderRadius: 10, padding: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <h3 style={{ margin: 0 }}>Similar to: {initialPin.title}</h3>
          <div>
            <button onClick={onClose} style={{ padding: "6px 10px", cursor: "pointer" }}>Close</button>
          </div>
        </div>

        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 13, color: "#555" }}>
            Results are based on tags, category, color and text overlap.
          </div>
        </div>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
          gap: 12
        }}>
          {results.length === 0 && <div style={{ color: "#666", padding: 20 }}>No similar images found.</div>}
          {results.map((p) => (
            <div key={String(p.id)} style={{ borderRadius: 8, overflow: "hidden", background: "#fafafa", cursor: "pointer" }} onClick={() => onOpenPin(p)}>
              <img src={p.imageUrl} alt={p.title} style={{ width: "100%", height: 120, objectFit: "cover" }} />
              <div style={{ padding: 8 }}>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{p.title}</div>
                {p.tags && <div style={{ fontSize: 12, color: "#666" }}>{p.tags.slice(0,3).join(", ")}</div>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SimilarModal;