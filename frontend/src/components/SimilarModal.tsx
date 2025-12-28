import React, { useEffect, useState } from "react";
import axios from "axios";
import { BASE_URL } from "../config";
import type { Pin } from "../utils/similarity";

type SimilarModalProps = {
  isOpen: boolean;
  onClose: () => void;
  targetPin: Pin | null;
  onOpenPin: (pin: Pin) => void;
};

export const SimilarModal: React.FC<SimilarModalProps> = ({ isOpen, onClose, targetPin, onOpenPin }) => {
  const [results, setResults] = useState<Pin[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && targetPin) {
      const fetchSimilar = async () => {
        setLoading(true);
        try {
          const pinId = String(targetPin._id || targetPin.id);
          const res = await axios.get(`${BASE_URL}/pins/${pinId}/similar`);
          setResults(res.data);
        } catch (err) {
          console.error("Failed to fetch analytics results:", err);
        } finally {
          setLoading(false);
        }
      };
      fetchSimilar();
    }
  }, [isOpen, targetPin]);

  if (!isOpen || !targetPin) return null;

  return (
    <div
      style={{
        position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.85)",
        display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1600,
        backdropFilter: "blur(12px)", padding: "20px"
      }}
      onClick={onClose}
    >
      <div
        className="glass"
        style={{
          width: "100%", maxWidth: 1200, height: "85vh",
          backgroundColor: "rgba(255, 255, 255, 0.98)", borderRadius: "40px", overflow: "hidden",
          display: "flex", boxShadow: "var(--shadow-lg)",
          animation: "fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1)"
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Left - Context Sidebar */}
        <div style={{ flex: "0 0 340px", background: "var(--gray-light)", borderRight: "1px solid var(--gray-hover)", padding: "40px", display: "flex", flexDirection: "column" }}>
          <div style={{ marginBottom: "32px" }}>
            <h3 style={{ margin: "0 0 8px", fontSize: "24px", fontWeight: "700", letterSpacing: "-0.5px" }}>Visual Discovery</h3>
            <p style={{ margin: 0, fontSize: "14px", color: "var(--text-secondary)", fontWeight: "500" }}>Analytics-driven matching</p>
          </div>

          <div style={{ width: "100%", borderRadius: "24px", overflow: "hidden", marginBottom: "24px", boxShadow: "var(--shadow-md)", transition: "transform 0.3s" }}>
            <img src={targetPin.imageUrl} alt="target" style={{ width: "100%", display: "block", transition: "transform 0.5s" }} />
          </div>

          <div style={{ fontSize: "12px", fontWeight: "700", color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "8px" }}>Analyzing context:</div>
          <div style={{ fontSize: "20px", fontWeight: "700", color: "var(--text-primary)", lineHeight: "1.3" }}>{targetPin.title || "Selected Inspiration"}</div>

          <div style={{ marginTop: "auto" }}>
            <button
              onClick={onClose}
              style={{
                width: "100%", padding: "16px", borderRadius: "30px", border: "none",
                backgroundColor: "var(--text-primary)", color: "white", cursor: "pointer", fontWeight: "700",
                fontSize: "16px", boxShadow: "var(--shadow-md)", transition: "all 0.2s"
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-2px)"}
              onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(0)"}
            >
              End Search
            </button>
          </div>
        </div>

        {/* Right - Analytics Results */}
        <div style={{ flex: 1, padding: "40px", overflowY: "auto", display: "flex", flexDirection: "column" }}>
          <div style={{ marginBottom: "32px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ fontSize: "14px", color: "var(--text-secondary)", fontWeight: "600", padding: "8px 16px", background: "var(--gray-light)", borderRadius: "12px" }}>
              {loading ? "✨ Decoding visual patterns..." : `${results.length} relevant matches discovered`}
            </div>
            {!loading && <div style={{ fontSize: "12px", color: "var(--text-secondary)", opacity: 0.6 }}>Sorted by Interest Rank</div>}
          </div>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
            gap: "24px"
          }}>
            {results.length === 0 && !loading && (
              <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "120px 0", color: "var(--text-secondary)" }}>
                <div style={{ fontSize: 48, marginBottom: "16px" }}>🕯️</div>
                <div style={{ fontSize: "20px", fontWeight: "700", color: "var(--text-primary)" }}>No matches yet</div>
                <div style={{ fontSize: "15px", maxWidth: "300px", margin: "10px auto 0" }}>Our engine couldn't find close visual matches in the current library.</div>
              </div>
            )}
            {results.map((p, i) => (
              <div
                key={String(p.id)}
                onClick={() => onOpenPin(p)}
                className="pin-card"
                style={{ cursor: "pointer", animation: `fadeIn 0.5s ease-out ${i * 0.05}s both` }}
              >
                <div style={{ borderRadius: "20px", overflow: "hidden", marginBottom: "12px", boxShadow: "var(--shadow-sm)", height: "240px" }}>
                  <img src={p.imageUrl} alt={p.title} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", transition: "all 0.4s" }} />
                </div>
                <div style={{ padding: "0 8px" }}>
                  <div style={{ fontSize: "15px", fontWeight: "700", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", color: "var(--text-primary)" }}>{p.title}</div>
                  <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "4px", fontWeight: "600", opacity: 0.7 }}>
                    {p.category || "Inspiration"}
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