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

import { BASE_URL } from "./config";
const BACKEND_URL = BASE_URL;

export type Pin = {
  _id?: string;
  id: string;
  imageUrl: string;
  title?: string;
  description?: string;
  tags?: string[];
  category?: string;
  color?: string;
  createdAt?: string;
  user?: any;
  [key: string]: any;
};

type User = {
  username: string;
  uploaded: string[];
  savedPins: string[];
  likes: string[];
  moodBoard: string[];
  avatarUrl?: string;
};

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [pins, setPins] = useState<Pin[]>([]);
  const [selectedPin, setSelectedPin] = useState<Pin | null>(null);

  // UI state
  const [showProfile, setShowProfile] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [similarOpen, setSimilarOpen] = useState(false);
  const [similarResults, setSimilarResults] = useState<SimilarPin[]>([]);
  const [similarTarget, setSimilarTarget] = useState<SimilarPin | null>(null);



  // Check for existing token on mount
  useEffect(() => {
    const savedToken = localStorage.getItem("authToken");
    const savedUsername = localStorage.getItem("username");

    if (savedToken && savedUsername) {
      setToken(savedToken);
      // Will trigger user fetch in next useEffect
    }
  }, []);

  // Fetch all pins
  useEffect(() => {
    const fetchPins = async () => {
      try {
        const res = await axios.get(`${BACKEND_URL}/pins`);
        console.log("Pins fetched:", res.data);

        // Normalize pin IDs (_id from MongoDB to id for frontend)
        const normalizedPins = res.data.map((p: any) => ({
          ...p,
          id: p._id || p.id,
        }));

        setPins(normalizedPins);
      } catch (err) {
        console.error("Failed to fetch pins:", err);
      }
    };
    fetchPins();
  }, []);

  // Fetch user data when token exists
  useEffect(() => {
    const fetchUser = async () => {
      const savedUsername = localStorage.getItem("username");
      if (!token || !savedUsername) return;

      try {
        const res = await axios.get(`${BACKEND_URL}/users/${savedUsername}`);
        console.log("User fetched:", res.data);

        setUser({
          username: res.data.username,
          uploaded: res.data.uploaded || [],
          savedPins: res.data.savedPins || [],
          likes: res.data.likes || [],
          moodBoard: res.data.moodBoard || [],
          avatarUrl: res.data.avatarUrl || "",
        });
      } catch (err) {
        console.error("Failed to fetch user:", err);
        // If fetch fails, token might be invalid
        if (axios.isAxiosError(err) && err.response?.status === 401) {
          handleLogout();
        }
      }
    };
    fetchUser();
  }, [token]);

  const goHome = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    setSelectedPin(null);
    setShowProfile(false);
  };

  const onUpload = () => setShowUpload(true);
  const onOpenProfile = () => setShowProfile(true);

  const handleLogout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("authToken");
    localStorage.removeItem("username");
  };

  // Upload pin to backend
  const handleUploadSave = async (newPin: Pin) => {
    if (!token || !user) {
      alert("You must be logged in to upload");
      return;
    }

    try {
      const payload = {
        title: newPin.title,
        description: newPin.description,
        imageUrl: newPin.imageUrl,
        category: newPin.category,
        tags: newPin.tags,
        color: newPin.color,
      };

      const res = await axios.post(`${BACKEND_URL}/pins`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Normalize the response
      const normalized = {
        ...res.data,
        id: res.data._id || res.data.id,
      };

      setPins((prev) => [normalized, ...prev]);

      // Update user's uploaded array
      setUser((prev) => prev ? {
        ...prev,
        uploaded: [normalized.id, ...prev.uploaded],
      } : null);

      setShowUpload(false);
    } catch (err) {
      console.error("Failed to upload pin:", err);
      if (axios.isAxiosError(err)) {
        alert(err.response?.data?.message || "Upload failed");
      }
    }
  };

  // Filter pins for search
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

  const handleLogin = (_username: string, authToken: string) => {
    setToken(authToken);
    // User data will be fetched by useEffect
  };

  if (!user || !token)
    return <Auth onLogin={handleLogin} />;

  return (
    <div style={{ minHeight: "100vh", background: "#fafafa" }}>
      <Header
        username={user.username}
        onHome={goHome}
        onUpload={onUpload}
        onOpenProfile={onOpenProfile}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onLogout={handleLogout}
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

      <Modal
        isOpen={!!selectedPin}
        data={selectedPin}
        onClose={() => setSelectedPin(null)}
        username={user.username}
        token={token}
      />

      <ProfileModal
        isOpen={showProfile}
        onClose={() => setShowProfile(false)}
        username={user.username}
        pins={pins}
      />

      <UploadModal
        isOpen={showUpload}
        onClose={() => setShowUpload(false)}
        onSave={(pin) => handleUploadSave(pin)}
      />

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