import React, { useState } from "react";

type AuthProps = {
  onLogin: (username: string) => void;
};

export const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [activeTab, setActiveTab] = useState<"login" | "signup">("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = () => {
    const users = JSON.parse(localStorage.getItem("users") || "[]");
    const existingUser = users.find((u: any) => u.username === username);

    if (!existingUser) {
      setError("User does not exist. Please signup.");
      return;
    }
    if (existingUser.password !== password) {
      setError("Incorrect password");
      return;
    }
    setError("");
    onLogin(username);
  };

  const handleSignup = () => {
    if (!username || !password) {
      setError("Please enter username and password");
      return;
    }

    const users = JSON.parse(localStorage.getItem("users") || "[]");
    const existingUser = users.find((u: any) => u.username === username);

    if (existingUser) {
      setError("Username already exists. Please login.");
      return;
    }

    users.push({ username, password });
    localStorage.setItem("users", JSON.stringify(users));
    setError("");
    onLogin(username);
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
          width: "300px",
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
            }}
            onClick={() => { setActiveTab("login"); setError(""); }}
          >
            Login
          </button>
          <button
            style={{
              flex: 1,
              padding: "0.5rem",
              borderBottom: activeTab === "signup" ? "2px solid #646cff" : "2px solid #ccc",
              background: "transparent",
              cursor: "pointer",
            }}
            onClick={() => { setActiveTab("signup"); setError(""); }}
          >
            Signup
          </button>
        </div>

        <h2 style={{ textAlign: "center", marginBottom: "1rem" }}>
          {activeTab === "login" ? "Login to your account" : "Create a new account"}
        </h2>

        {error && <p style={{ color: "red", textAlign: "center" }}>{error}</p>}

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={{ width: "100%", padding: "0.5rem", marginBottom: "0.5rem", borderRadius: "4px", border: "1px solid #ccc" }}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ width: "100%", padding: "0.5rem", marginBottom: "1rem", borderRadius: "4px", border: "1px solid #ccc" }}
          />
          <button
            type="submit"
            style={{
              width: "100%",
              padding: "0.5rem",
              backgroundColor: "#646cff",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            {activeTab === "login" ? "Login" : "Signup"}
          </button>
        </form>
      </div>
    </div>
  );
};
