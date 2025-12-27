import React, { useEffect, useState } from "react";
import axios from "axios";
import { Card } from "./components/Card";
import { Modal } from "./components/Modal";
import { Auth } from "./components/Auth";
import { Header } from "./components/Header";
import { ProfileModal } from "./components/ProfileModal";
import { UploadModal } from "./components/UploadModal";
import SimilarModal from "./components/SimilarModal";
import { findSimilarPins } from "./utils/similarity";
import type { Pin as SimilarPin } from "./utils/similarity";

// ✅ Export Pin type so other files can import it
export type Pin = {
  id: string;
  imageUrl: string;
  title?: string;
  description?: string;
  tags?: string[];
  category?: string;
  color?: string;
  createdAt?: string;
  [key: string]: any;
};

type User = {
  username: string;
  uploaded: string[];
  savedPins: string[];
  avatarUrl?: string;
};

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [pins, setPins] = useState<Pin[]>([]);
  const [selectedPin, setSelectedPin] = useState<Pin | null>(null);

  const [showProfile, setShowProfile] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [similarOpen, setSimilarOpen] = useState(false);
  const [similarResults, setSimilarResults] = useState<SimilarPin[]>([]);
  const [similarTarget, setSimilarTarget] = useState<SimilarPin | null>(null);

  const BACKEND_URL = "https://metapibns-production.up.railway.app/api";

  // Fetch all pins
  useEffect(() => {
    const fetchPins = async () => {
      try {
        const res = await axios.get(`${BACKEND_URL}/pins`);
        console.log("Pins fetched:", res.data);
        setPins(res.data);
      } catch (err) {
        console.error("Failed to fetch pins:", err);
      }
    };
    fetchPins();
  }, []);

  // Fetch user data after login
  useEffect(() => {
    if (!user) return;
    const fetchUser = async () => {
      try {
        const res = await axios.get(`${BACKEND_URL}/users/${user.username}`);
        setUser(res.data);
      } catch (err) {
        console.error("Failed to fetch user:", err);
      }
    };
    fetchUser();
  }, [user?.username]);

  const goHome = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    setSelectedPin(null);
    setShowProfile(false);
  };

  const onUpload = () => setShowUpload(true);
  const onOpenProfile = () => setShowProfile(true);
  const onLogout = () => setUser(null);

  const makeId = () => `pin_${Date.now()}_${Math.floor(Math.random() * 10000)}`;

  const handleUploadSave = async (newPin: Pin) => {
    try {
      const payload = {
        ...newPin,
        id: newPin.id ?? makeId(),
        createdAt: newPin.createdAt ?? new Date().toISOString(),
        username: user?.username,
      };
      const res = await axios.post(`${BACKEND_URL}/pins`, payload);
      setPins((prev) => [res.data, ...prev]);
      setShowUpload(false);
    } catch (err) {
      console.error("Failed to upload pin:", err);
    }
  };

  const normalizedSearch = searchTerm.trim().toLowerCase();
  const filteredPins = normalizedSearch
    ? pins.filter((p) => {
        if ((p.title || "").toLowerCase().includes(normalizedSearch)) return true;
        if ((p.description || "").toLowerCase().includes(normalizedSearch)) return true;
        if ((p.category || "").toLowerCase().includes(normalizedSearch)) return true;
        if ((p.color || "").toLowerCase().includes(normalizedSearch)) return true;
        if (Array.isArray(p.tags) && p.tags.some((t) => String(t).toLowerCase().includes(normalizedSearch)))
          return true;
        return false;
      })
    : pins;

  const handleCardContext = (e: React.MouseEvent, cardData: Pin) => {
    e.preventDefault();
    const results = findSimilarPins(cardData as SimilarPin, pins as SimilarPin[], 12);
    setSimilarTarget(cardData as SimilarPin);
    setSimilarResults(results);
    setSimilarOpen(true);
  };

  const handleOpenPinFromSimilar = (pin: SimilarPin) => {
    const found = pins.find((p) => String(p.id) === String(pin.id));
    if (found) setSelectedPin(found);
    else setSelectedPin(pin as any);
    setSimilarOpen(false);
  };

  const handleLogin = (username: string) => {
    setUser({
      username,
      uploaded: [],
      savedPins: [],
    });
  };

  if (!user) return <Auth onLogin={handleLogin} />;

  return (
    <div style={{ minHeight: "100vh", background: "#fafafa" }}>
      <Header
        username={user.username}
        onHome={goHome}
        onUpload={onUpload}
        onOpenProfile={onOpenProfile}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onLogout={onLogout}
      />

      <main style={{ padding: "1rem" }} className="masonry-grid">
        {filteredPins.map((item) => (
          <div key={item.id} className="masonry-item" style={{ marginBottom: 12 }}>
            <Card
              data={item}
              onClick={() => setSelectedPin(item)}
              onContextMenu={(e) => handleCardContext(e, item)}
            />
          </div>
        ))}
      </main>

      <Modal isOpen={!!selectedPin} data={selectedPin} onClose={() => setSelectedPin(null)} username={user.username} />

      <ProfileModal isOpen={showProfile} onClose={() => setShowProfile(false)} username={user.username} pins={pins} />

      <UploadModal isOpen={showUpload} onClose={() => setShowUpload(false)} onSave={handleUploadSave} />

      <SimilarModal
        isOpen={similarOpen}
        onClose={() => setSimilarOpen(false)}
        initialPin={similarTarget}
        results={similarResults}
        onOpenPin={handleOpenPinFromSimilar}
      />
    </div>
  );
};

export default App;
