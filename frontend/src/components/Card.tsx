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
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
              <div style={{ backgroundColor: "white", padding: "8px", borderRadius: "50%", width: "32px", height: "32px", display: "flex", alignItems: "center", justifyContent: "center" }}>📤</div>
              <div style={{ backgroundColor: "white", padding: "8px", borderRadius: "50%", width: "32px", height: "32px", display: "flex", alignItems: "center", justifyContent: "center" }}>⋮</div>
            </div>
          </div>
        </div>
      )}
      <div className="pin-title">{data.title || "Untitled"}</div>
    </div>
  );
};

export default Card;