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
    <header style={{ display: "flex", alignItems: "center", gap: "20px", padding: "16px 24px" }}>
      <div
        onClick={onHome}
        style={{
          cursor: "pointer", display: "flex", alignItems: "center", gap: "10px",
          color: "var(--pinterest-red)", transition: "transform 0.2s"
        }}
        onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.05)"}
        onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
      >
        <div style={{
          backgroundColor: "var(--pinterest-red)", color: "white", borderRadius: "50%",
          width: "36px", height: "36px", display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "22px", fontWeight: "bold", boxShadow: "var(--shadow-sm)"
        }}>M</div>
        <span style={{ fontSize: "20px", fontWeight: "700", letterSpacing: "-0.5px" }} className="show-md">MetaPins</span>
      </div>

      <div style={{ display: "flex", gap: "4px" }}>
        <button onClick={onHome} className="tab-btn active">Home</button>
        <button onClick={onUpload} className="tab-btn">Create</button>
      </div>

      <div className="search-container">
        <span style={{ fontSize: "18px", color: "var(--text-secondary)", opacity: 0.7 }}>🔍</span>
        <input
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search for inspirations..."
          className="search-input"
        />
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
        <button
          title="Notifications"
          style={{ background: "none", border: "none", fontSize: "20px", cursor: "pointer", opacity: 0.6 }}
          onMouseEnter={(e) => e.currentTarget.style.opacity = "1"}
          onMouseLeave={(e) => e.currentTarget.style.opacity = "0.6"}
        >🔔</button>

        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div
            onClick={onOpenProfile}
            style={{
              cursor: "pointer", width: "40px", height: "40px", borderRadius: "50%",
              backgroundColor: "var(--gray-light)", display: "flex", alignItems: "center", justifyContent: "center",
              fontWeight: "600", color: "var(--text-primary)", overflow: "hidden",
              border: "2px solid transparent", transition: "all 0.2s"
            }}
            onMouseEnter={(e) => e.currentTarget.style.borderColor = "var(--gray-hover)"}
            onMouseLeave={(e) => e.currentTarget.style.borderColor = "transparent"}
          >
            {username?.charAt(0).toUpperCase()}
          </div>

          <div style={{ position: "relative" }} ref={menuRef}>
            <button
              onClick={() => setOpen((v) => !v)}
              style={{
                background: "var(--gray-light)", border: "none", cursor: "pointer",
                width: "24px", height: "24px", borderRadius: "50%",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "10px", color: "var(--text-secondary)"
              }}
            >
              {open ? "▲" : "▼"}
            </button>
            {open && (
              <div role="menu" className="glass" style={{
                position: "absolute", right: 0, top: "calc(100% + 16px)",
                boxShadow: "var(--shadow-lg)", borderRadius: "20px", padding: "12px", minWidth: "220px", zIndex: 1200,
                animation: "fadeIn 0.2s ease-out"
              }}>
                <div style={{ fontSize: "12px", color: "var(--text-secondary)", padding: "8px 12px", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.5px" }}>Currently in</div>
                <button
                  onClick={() => { setOpen(false); onOpenProfile(); }}
                  style={{ ...menuBtnStyle, borderRadius: "12px", padding: "10px 12px" }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "var(--gray-light)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", fontWeight: "700" }}>{username[0]}</div>
                    <div style={{ textAlign: "left" }}>
                      <div style={{ fontWeight: "700", color: "var(--text-primary)" }}>{username}</div>
                      <div style={{ fontSize: "12px", color: "var(--text-secondary)" }}>Personal Profile</div>
                    </div>
                  </div>
                </button>
                <hr style={{ border: "none", borderTop: "1px solid var(--gray-light)", margin: "8px 0" }} />
                <button
                  onClick={() => { setOpen(false); onLogout(); }}
                  style={{ ...menuBtnStyle, borderRadius: "12px", padding: "12px", color: "var(--text-primary)", fontWeight: "600" }}
                >Log out</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

const menuBtnStyle: React.CSSProperties = {
  display: "block",
  width: "100%",
  textAlign: "left",
  border: "none",
  background: "transparent",
  cursor: "pointer",
  fontSize: 14,
  transition: "background 0.2s"
};