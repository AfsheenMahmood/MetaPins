import React, { useEffect, useRef, useState } from "react";

type HeaderProps = {
  username: string;
  onHome: () => void;
  onUpload: () => void;
  onOpenProfile: () => void;
  searchTerm?: string;
  onSearchChange?: (value: string) => void;
  onLogout?: () => void;
};

export const Header: React.FC<HeaderProps> = ({
  username,
  onHome,
  onUpload,
  onOpenProfile,
  searchTerm = "",
  onSearchChange = () => { },
  onLogout = () => { },
}) => {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  return (
    <header className="premium-shadow" style={{ display: "flex", alignItems: "center", gap: "16px", padding: "12px 24px" }}>
      <div
        onClick={onHome}
        style={{
          cursor: "pointer", display: "flex", alignItems: "center", gap: "8px",
          color: "var(--pinterest-red)", fontWeight: "bold"
        }}
      >
        <div style={{
          backgroundColor: "var(--pinterest-red)", color: "white", borderRadius: "50%",
          width: "32px", height: "32px", display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "20px"
        }}>M</div>
        <span style={{ fontSize: "20px", display: "none" }} className="show-md">MetaPins</span>
      </div>

      <button onClick={onHome} className="tab-btn active" style={{ fontSize: "16px" }}>Home</button>
      <button onClick={onUpload} className="tab-btn" style={{ fontSize: "16px" }}>Create</button>

      <div className="search-container">
        <span style={{ fontSize: "18px", color: "var(--text-secondary)" }}>🔍</span>
        <input
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search"
          className="search-input"
        />
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <div
          onClick={onOpenProfile}
          style={{
            cursor: "pointer", width: "36px", height: "36px", borderRadius: "50%",
            backgroundColor: "var(--gray-light)", display: "flex", alignItems: "center", justifyContent: "center",
            fontWeight: "600", color: "var(--text-primary)", overflow: "hidden", border: "1px solid #ddd"
          }}
        >
          {username?.charAt(0).toUpperCase()}
        </div>

        <div style={{ position: "relative" }} ref={menuRef}>
          <button
            onClick={() => setOpen((v) => !v)}
            style={{ background: "none", border: "none", cursor: "pointer", fontSize: "14px", color: "var(--text-secondary)" }}
          >
            ▼
          </button>
          {open && (
            <div role="menu" style={{
              position: "absolute", right: 0, top: "calc(100% + 12px)", background: "#fff",
              boxShadow: "0 0 8px rgba(0,0,0,0.1)", borderRadius: "16px", padding: "12px", minWidth: "160px", zIndex: 1200
            }}>
              <div style={{ fontSize: "12px", color: "#666", padding: "0 8px 8px" }}>Currently in</div>
              <button
                onClick={() => { setOpen(false); onOpenProfile(); }}
                style={{ ...menuBtnStyle, fontWeight: "600", display: "flex", alignItems: "center", gap: "8px" }}
              >
                <div style={{ width: "24px", height: "24px", borderRadius: "50%", background: "#eee", textAlign: "center" }}>{username[0]}</div>
                {username}
              </button>
              <hr style={{ border: "none", borderTop: "1px solid #eee", margin: "8px 0" }} />
              <button onClick={() => { setOpen(false); onLogout(); }} style={menuBtnStyle}>Log out</button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

const menuBtnStyle: React.CSSProperties = {
  display: "block",
  width: "100%",
  textAlign: "left",
  padding: "0.5rem 0.6rem",
  border: "none",
  background: "transparent",
  cursor: "pointer",
  fontSize: 14,
};