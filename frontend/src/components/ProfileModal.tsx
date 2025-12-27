import React, { useMemo, useState, useEffect } from "react";

type Pin = {
  id: string | number;
  imageUrl: string;
  title?: string;
  description?: string;
  [key: string]: any;
};

type User = {
  username: string;
  avatarUrl?: string;
  uploaded?: (string | number)[];
  savedPins?: (string | number)[];
  moodBoard?: (string | number)[];
  [key: string]: any;
};

type ProfileModalProps = {
  isOpen: boolean;
  onClose: () => void;
  username: string;
  pins: Pin[]; // accept pins as prop so it reacts immediately after upload
};

export const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose, username, pins }) => {
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<"uploaded" | "saved" | "mood">("uploaded");

  useEffect(() => {
    const users = JSON.parse(localStorage.getItem("users") || "[]") as User[];
    const u = users.find(x => x.username === username) || null;
    if (u) {
      setUser({
        ...u,
        uploaded: Array.isArray(u.uploaded) ? u.uploaded : [],
        savedPins: Array.isArray(u.savedPins) ? u.savedPins : [],
        moodBoard: Array.isArray(u.moodBoard) ? u.moodBoard : []
      });
    } else {
      setUser(null);
    }
  }, [username, isOpen, pins]); // re-read user whenever pins change so counts reflect updates

  useEffect(() => {
    if (!isOpen) setActiveTab("uploaded");
  }, [isOpen]);

  const pinsByIds = (ids?: (string | number)[]) => {
    if (!ids || ids.length === 0) return [];
    const setIds = new Set(ids.map(String));
    return pins.filter(p => setIds.has(String(p.id)));
  };

  const uploadedPins = useMemo(() => pinsByIds(user?.uploaded), [user, pins]);
  const savedPins = useMemo(() => pinsByIds(user?.savedPins), [user, pins]);
  const moodPins = useMemo(() => pinsByIds(user?.moodBoard), [user, pins]);

  if (!isOpen) return null;

  return (
    <div style={{
      position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.6)",
      display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1300
    }}>
      <div style={{
        width: "92%", maxWidth: 900, maxHeight: "90%", overflowY: "auto",
        background: "#fff", borderRadius: 10, padding: 16, boxSizing: "border-box"
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <img
              src={user?.avatarUrl || "https://via.placeholder.com/72?text=User"}
              alt={`${username} avatar`}
              style={{ width: 72, height: 72, borderRadius: "50%", objectFit: "cover", border: "1px solid #eee" }}
            />
            <div>
              <h2 style={{ margin: 0 }}>{username}</h2>
              <div style={{ fontSize: 13, color: "#666" }}>
                {user ? `${(user.uploaded || []).length} uploads • ${(user.savedPins || []).length} saved • ${(user.moodBoard || []).length} mood` : "No profile"}
              </div>
            </div>
          </div>

          <div>
            <button onClick={onClose} style={{ padding: "6px 10px", cursor: "pointer" }}>Close</button>
          </div>
        </div>

        <div style={{ marginTop: 16 }}>
          <nav style={{ display: "flex", gap: 8, marginBottom: 12 }}>
            <button onClick={() => setActiveTab("uploaded")} style={tabButton(activeTab === "uploaded")}>Uploaded</button>
            <button onClick={() => setActiveTab("saved")} style={tabButton(activeTab === "saved")}>Saved</button>
            <button onClick={() => setActiveTab("mood")} style={tabButton(activeTab === "mood")}>Mood Board</button>
          </nav>

          <section>
            {activeTab === "uploaded" && <Grid pins={uploadedPins} />}
            {activeTab === "saved" && <Grid pins={savedPins} />}
            {activeTab === "mood" && <Grid pins={moodPins} />}
          </section>
        </div>
      </div>
    </div>
  );
};

const Grid: React.FC<{ pins: Pin[] }> = ({ pins }) => {
  if (!pins || pins.length === 0) {
    return <div style={{ color: "#666", padding: 20 }}>No images to show.</div>;
  }
  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
      gap: 8
    }}>
      {pins.map(p => (
        <div key={String(p.id)} style={{ borderRadius: 8, overflow: "hidden", background: "#f8f8f8" }}>
          <img src={p.imageUrl} alt={p.title || ""} style={{ width: "100%", height: 120, objectFit: "cover" }} />
          <div style={{ padding: 6 }}>
            <div style={{ fontSize: 13, fontWeight: 600 }}>{p.title}</div>
            {p.description && <div style={{ fontSize: 12, color: "#666" }}>{p.description}</div>}
          </div>
        </div>
      ))}
    </div>
  );
};

const tabButton = (active: boolean): React.CSSProperties => ({
  padding: "6px 10px",
  borderRadius: 6,
  border: "1px solid #eee",
  background: active ? "#111" : "#fff",
  color: active ? "#fff" : "#111",
  cursor: "pointer"
});