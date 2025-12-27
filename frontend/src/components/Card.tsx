import React from "react";

type CardProps = {
  data: any;
  onClick?: () => void;
  onContextMenu?: (e: React.MouseEvent, data: any) => void;
};

export const Card: React.FC<CardProps> = ({ data, onClick, onContextMenu }) => {
  return (
    <div
      onClick={onClick}
      onContextMenu={(e) => {
        if (onContextMenu) {
          e.preventDefault();
          onContextMenu(e, data);
        }
      }}
      style={{
        cursor: "pointer",
        borderRadius: 8,
        overflow: "hidden",
        background: "#fff",
        boxShadow: "0 1px 4px rgba(0,0,0,0.06)"
      }}
      aria-label={data.title || "pin card"}
    >
      {data.imageUrl && (
        <img
          src={data.imageUrl}
          alt={data.title}
          style={{ width: "100%", display: "block", objectFit: "cover", maxHeight: 360 }}
          loading="lazy"
        />
      )}
      <div style={{ padding: 8 }}>
        <div style={{ fontWeight: 600, fontSize: 14 }}>{data.title}</div>
        {data.description && (
          <div style={{ fontSize: 12, color: "#666", marginTop: 6 }}>{data.description}</div>
        )}
      </div>
    </div>
  );
};

export default Card;