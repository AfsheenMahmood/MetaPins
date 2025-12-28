import React from "react";

type CardProps = {
  data: any;
  onClick?: () => void;
  onContextMenu?: (e: React.MouseEvent, data: any) => void;
  onToggleSave?: (e: React.MouseEvent, pinId: string) => void;
  isSaved?: boolean;
};

export const Card: React.FC<CardProps> = ({ data, onClick, onContextMenu, onToggleSave, isSaved }) => {
  return (
    <div
      onClick={onClick}
      onContextMenu={(e) => {
        if (onContextMenu) {
          e.preventDefault();
          onContextMenu(e, data);
        }
      }}
      className="pin-card"
      aria-label={data.title || "pin card"}
    >
      {data.imageUrl && (
        <div style={{ position: "relative" }}>
          <img
            src={data.imageUrl}
            alt={data.title}
            className="pin-image"
            loading="lazy"
          />
          <div className="pin-overlay">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", width: "100%" }}>
              <div style={{ color: "white", fontSize: "14px", fontWeight: "600", textShadow: "0 1px 4px rgba(0,0,0,0.5)" }}>
                {data.category || "Inspiration"}
              </div>
              <button
                className="pin-save-btn"
                style={{ backgroundColor: isSaved ? "#111" : "var(--pinterest-red)" }}
                onClick={(e) => {
                  e.stopPropagation();
                  const pinId = String(data._id || data.id);
                  if (onToggleSave) onToggleSave(e, pinId);
                }}
              >
                {isSaved ? "Saved" : "Save"}
              </button>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", width: "100%" }}>
              <button
                title="Share"
                style={iconBtnStyle}
                onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.1)"}
                onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
              >📤</button>
              <button
                title="More Options"
                style={iconBtnStyle}
                onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.1)"}
                onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
              >⋮</button>
            </div>
          </div>
        </div>
      )}
      <div className="pin-title">{data.title || "Untitled"}</div>
    </div>
  );
};

const iconBtnStyle: React.CSSProperties = {
  backgroundColor: "rgba(255, 255, 255, 0.9)",
  border: "none",
  borderRadius: "50%",
  width: "36px",
  height: "36px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
  fontSize: "14px",
  boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
  transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)"
};

export default Card;