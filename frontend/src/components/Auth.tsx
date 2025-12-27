import React, { useState } from "react";
import axios from "axios";

type AuthProps = {
  onLogin: (username: string, token: string) => void;
};

const BACKEND_URL = "https://metapibns-production.up.railway.app/api";

export const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [activeTab, setActiveTab] = useState<"login" | "signup">("login");
  const [username, setUsername] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      setError("Please enter email and password");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await axios.post(`${BACKEND_URL}/auth/login`, {
        email,
        password
      });

      const { token, user } = res.data;
      
      // Store token in localStorage
      localStorage.setItem("authToken", token);
      localStorage.setItem("username", user.username);
      
      onLogin(user.username, token);
    } catch (err: any) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async () => {
    if (!username || !name || !email || !password) {
      setError("Please fill in all fields");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await axios.post(`${BACKEND_URL}/auth/signup`, {
        username,
        name,
        email,
        password
      });

      const { token, user } = res.data;
      
      // Store token in localStorage
      localStorage.setItem("authToken", token);
      localStorage.setItem("username", user.username);
      
      onLogin(user.username, token);
    } catch (err: any) {
      setError(err.response?.data?.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeTab === "login") handleLogin();
    else handleSignup();
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        backgroundColor: "#f9f9f9",
      }}
    >
      <div
        style={{
          backgroundColor: "white",
          padding: "2rem",
          borderRadius: "8px",
          boxShadow: "0 0 10px rgba(0,0,0,0.1)",
          width: "340px",
        }}
      >
        {/* Tabs */}
        <div style={{ display: "flex", marginBottom: "1rem" }}>
          <button
            style={{
              flex: 1,
              padding: "0.5rem",
              borderBottom: activeTab === "login" ? "2px solid #646cff" : "2px solid #ccc",
              background: "transparent",
              cursor: "pointer",
              border: "none",
              borderBottom: activeTab === "login" ? "2px solid #646cff" : "2px solid #ccc",
            }}
            onClick={() => {
              setActiveTab("login");
              setError("");
            }}
          >
            Login
          </button>
          <button
            style={{
              flex: 1,
              padding: "0.5rem",
              background: "transparent",
              cursor: "pointer",
              border: "none",
              borderBottom: activeTab === "signup" ? "2px solid #646cff" : "2px solid #ccc",
            }}
            onClick={() => {
              setActiveTab("signup");
              setError("");
            }}
          >
            Signup
          </button>
        </div>

        <h2 style={{ textAlign: "center", marginBottom: "1rem", fontSize: "1.3rem" }}>
          {activeTab === "login" ? "Login to your account" : "Create a new account"}
        </h2>

        {error && (
          <p style={{ color: "red", textAlign: "center", fontSize: "0.9rem", marginBottom: "0.5rem" }}>
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit}>
          {activeTab === "signup" && (
            <>
              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                style={inputStyle}
                disabled={loading}
              />
              <input
                type="text"
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={inputStyle}
                disabled={loading}
              />
            </>
          )}
          
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={inputStyle}
            disabled={loading}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={inputStyle}
            disabled={loading}
          />
          
          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "0.6rem",
              backgroundColor: loading ? "#9ca3af" : "#646cff",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: loading ? "not-allowed" : "pointer",
              fontSize: "1rem",
            }}
          >
            {loading ? "Please wait..." : activeTab === "login" ? "Login" : "Signup"}
          </button>
        </form>
      </div>
    </div>
  );
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "0.6rem",
  marginBottom: "0.7rem",
  borderRadius: "4px",
  border: "1px solid #ccc",
  boxSizing: "border-box",
  fontSize: "0.95rem",
};