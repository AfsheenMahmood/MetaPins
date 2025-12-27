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
  onSearchChange = () => {},
  onLogout = () => {},
}) => {
  const [open, setOpen] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const loadAvatar = () => {
      try {
        const users = JSON.parse(localStorage.getItem("users") || "[]") as any[];
        const u = users.find((x) => x.username === username);
        setAvatarUrl(u?.avatarUrl || null);
      } catch {
        setAvatarUrl(null);
      }
    };
    loadAvatar();
    const onStorage = (e: StorageEvent) => {
      if (e.key === "users") loadAvatar();
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [username]);

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  return (
    <header style={{
      background: "#fff",
      borderBottom: "1px solid #eee",
      position: "sticky",
      top: 0,
      zIndex: 100,
    }}>
      {/* Top row: centered title, avatar+menu on right */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "12px 16px", position: "relative" }}>
        <h1 style={{ margin: 0, fontSize: 28, letterSpacing: 0.6 }}>MetaPins</h1>

        <div style={{ position: "absolute", right: 12, display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {avatarUrl ? (
              <img src={avatarUrl} alt={`${username} avatar`} style={{ width: 36, height: 36, borderRadius: "50%", objectFit: "cover", border: "1px solid #eee" }} />
            ) : (
              <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#f0f0f0", display: "flex", alignItems: "center", justifyContent: "center", color: "#666", border: "1px solid #eee" }}>
                {username?.charAt(0)?.toUpperCase() || "U"}
              </div>
            )}
          </div>

          <div style={{ position: "relative" }} ref={menuRef}>
            <button
              aria-haspopup="true"
              aria-expanded={open}
              aria-label="Open menu"
              onClick={() => setOpen((v) => !v)}
              style={{
                background: "transparent",
                border: "1px solid #eee",
                padding: 8,
                cursor: "pointer",
                borderRadius: 6,
              }}
              title="Menu"
            >
              <span style={{ display: "inline-block", transform: "translateY(-2px)", fontSize: 18 }}>⋮</span>
            </button>

            {open && (
              <div role="menu" style={{
                position: "absolute",
                right: 0,
                top: "calc(100% + 8px)",
                background: "#fff",
                boxShadow: "0 6px 18px rgba(0,0,0,0.12)",
                borderRadius: 8,
                padding: "0.5rem",
                minWidth: 180,
                zIndex: 1200,
              }}>
                <button role="menuitem" onClick={() => { setOpen(false); onHome(); }} style={menuBtnStyle}>Home</button>
                <button role="menuitem" onClick={() => { setOpen(false); onUpload(); }} style={menuBtnStyle}>Upload a picture</button>
                <button role="menuitem" onClick={() => { setOpen(false); onOpenProfile(); }} style={menuBtnStyle}>Profile</button>
                <hr style={{ border: "none", borderTop: "1px solid #eee", margin: "8px 0" }} />
                <button role="menuitem" onClick={() => { setOpen(false); onLogout(); }} style={menuBtnStyle}>Logout</button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Second row: search input centered */}
      <div style={{ display: "flex", justifyContent: "center", padding: "10px 16px 14px" }}>
        <div style={{ width: "100%", maxWidth: 720 }}>
          <input
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search title, description, tags, category..."
            style={{
              width: "100%",
              padding: "10px 12px",
              borderRadius: 8,
              border: "1px solid #ddd",
              boxSizing: "border-box",
              fontSize: 14
            }}
            aria-label="Search pins"
          />
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