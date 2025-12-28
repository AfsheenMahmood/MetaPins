import React, { useEffect, useState } from "react";
import axios from "axios";
import { Card } from "./components/Card";
import { Modal } from "./components/Modal";
import { Auth } from "./components/Auth";
import { Header } from "./components/Header";
import { ProfileModal } from "./components/ProfileModal";
import { UploadModal } from "./components/UploadModal";
import SimilarModal from "./components/SimilarModal";
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

export type Board = {
  _id: string;
  id: string;
  title: string;
  description?: string;
  pins: any[];
  user: string;
  createdAt?: string;
};

type User = {
  id: string;
  username: string;
  uploaded: string[];
  savedPins: string[];
  likes: string[];
  following: string[];
  followersCount: number;
  followingCount: number;
  avatarUrl?: string;
  name?: string;
  boards?: Board[];
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
  const [similarTarget, setSimilarTarget] = useState<SimilarPin | null>(null);

  // Public Profile state
  const [publicProfileUser, setPublicProfileUser] = useState<any>(null);
  const [showPublicProfile, setShowPublicProfile] = useState(false);



  // Check for existing token on mount
  useEffect(() => {
    const savedToken = localStorage.getItem("authToken");
    const savedUsername = localStorage.getItem("username");

    if (savedToken && savedUsername) {
      setToken(savedToken);
      // Will trigger user fetch in next useEffect
    }
  }, []);

  // Fetch all pins (Personalized if logged in)
  useEffect(() => {
    const fetchPins = async () => {
      try {
        const url = user ? `${BACKEND_URL}/pins?userId=${user.id}` : `${BACKEND_URL}/pins`;
        const res = await axios.get(url);
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
  }, [user?.id]); // Refetch when user logs in/out to get personalized feed

  // Fetch user data when token exists
  useEffect(() => {
    const fetchUser = async () => {
      const savedUsername = localStorage.getItem("username");
      if (!token || !savedUsername) return;

      try {
        const res = await axios.get(`${BACKEND_URL}/users/${savedUsername}`);
        console.log("User fetched:", res.data);

        setUser({
          id: res.data.id,
          username: res.data.username,
          uploaded: res.data.uploaded || [],
          savedPins: res.data.savedPins || [],
          likes: res.data.likes || [],
          following: res.data.following || [],
          followersCount: res.data.followersCount || 0,
          followingCount: res.data.followingCount || 0,
          avatarUrl: res.data.avatarUrl || "",
          name: res.data.name || "",
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
  const onOpenProfile = () => {
    setPublicProfileUser(null);
    setShowProfile(true);
  };

  const onOpenPublicProfile = async (targetUserId: string | any) => {
    // If it's the current user, just open their profile
    const id = typeof targetUserId === "string" ? targetUserId : targetUserId._id || targetUserId.id;
    if (id === user?.id) {
      onOpenProfile();
      return;
    }

    try {
      // Find user by ID or use username if targetUserId is an object with username
      const searchParam = typeof targetUserId === "object" ? targetUserId.username : targetUserId;
      const res = await axios.get(`${BACKEND_URL}/users/${searchParam}`);
      setPublicProfileUser(res.data);
      setShowPublicProfile(true);
    } catch (err) {
      console.error("Failed to fetch public profile:", err);
    }
  };

  const handleLogout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("authToken");
    localStorage.removeItem("username");
  };

  // Upload pin to backend
  // Handle successful upload from UploadModal
  const handleUploadSave = (newPin: Pin) => {
    setPins((prev) => [newPin, ...prev]);

    // Update user's uploaded array
    setUser((prev) => prev ? {
      ...prev,
      uploaded: [newPin.id, ...prev.uploaded],
    } : null);

    setShowUpload(false);
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

  const handleCardContext = (e: React.MouseEvent | null, cardData: Pin) => {
    if (e) e.preventDefault();
    setSimilarTarget(cardData as SimilarPin);
    setSimilarOpen(true);
  };

  // Expose for Modal.tsx to trigger
  (window as any).triggerSimilar = (data: any) => handleCardContext(null, data);

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

  const handleToggleSave = async (e: React.MouseEvent | null, pinId: string) => {
    if (e) e.stopPropagation();
    if (!user || !token) return;

    const isSaved = user.savedPins.some((id: any) => String(id) === pinId || String(id?._id || id?.id || id) === pinId);
    const newSaved = isSaved
      ? user.savedPins.filter((id: any) => String(id) !== pinId && String(id?._id || id?.id || id) !== pinId)
      : [...user.savedPins, pinId];

    const optimisticUser = { ...user, savedPins: newSaved };
    setUser(optimisticUser);

    try {
      await axios.post(
        `${BACKEND_URL}/users/${user.username}/save/${pinId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Fetch latest user data to stay in sync
      const res = await axios.get(`${BACKEND_URL}/users/${user.username}`);
      setUser({
        id: res.data.id,
        username: res.data.username,
        uploaded: res.data.uploaded || [],
        savedPins: res.data.savedPins || [],
        likes: res.data.likes || [],
        following: res.data.following || [],
        followersCount: res.data.followersCount || 0,
        followingCount: res.data.followingCount || 0,
        avatarUrl: res.data.avatarUrl || "",
        name: res.data.name || "",
      });
    } catch (err) {
      console.error("Save toggle failed:", err);
      // Revert optimistic update on failure
      const revertSaved = !isSaved
        ? user.savedPins.filter((id: string) => String(id) !== pinId)
        : [...user.savedPins, pinId];
      setUser({ ...user, savedPins: revertSaved });
    }
  };

  if (!user || !token)
    return <Auth onLogin={handleLogin} />;

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-color)" }}>
      <Header
        username={user.username}
        onHome={goHome}
        onUpload={onUpload}
        onOpenProfile={onOpenProfile}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onLogout={handleLogout}
      />

      <main className="masonry-grid">
        {filteredPins.map((item) => (
          <div key={item.id} className="masonry-item">
            <Card
              data={item}
              onClick={() => setSelectedPin(item)}
              onContextMenu={(e) => handleCardContext(e, item)}
              onToggleSave={handleToggleSave}
              isSaved={user.savedPins.some((id: any) => String(id) === String(item._id || item.id) || String(id?._id || id?.id || id) === String(item._id || item.id))}
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
        currentUser={user}
        onUpdateUser={setUser}
        onOpenProfile={onOpenPublicProfile}
      />

      {/* Auth-user Profile */}
      <ProfileModal
        isOpen={showProfile}
        onClose={() => setShowProfile(false)}
        user={user}
        token={token}
        pins={pins}
        onUpdateUser={setUser}
        onPinClick={(pin) => {
          setSelectedPin(pin);
          setShowProfile(false);
        }}
      />

      {/* Public Profile */}
      <ProfileModal
        isOpen={showPublicProfile}
        onClose={() => setShowPublicProfile(false)}
        user={publicProfileUser}
        token={token}
        pins={pins}
        onUpdateUser={(updated) => {
          // If the profile being updated is the public one, update it
          if (publicProfileUser && publicProfileUser.username === updated.username) {
            setPublicProfileUser(updated);
          }
        }}
        isPublic={true}
        currentUser={user}
        onUpdateCurrentUser={setUser}
        onPinClick={(pin) => {
          setSelectedPin(pin);
          setShowPublicProfile(false);
        }}
        onNavigateToUser={onOpenPublicProfile}
      />

      <UploadModal
        isOpen={showUpload}
        onClose={() => setShowUpload(false)}
        onSave={(pin) => handleUploadSave(pin)}
      />

      <SimilarModal
        isOpen={similarOpen}
        onClose={() => setSimilarOpen(false)}
        targetPin={similarTarget}
        onOpenPin={handleOpenPinFromSimilar}
      />
    </div>
  );
};

export default App;