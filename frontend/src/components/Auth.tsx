import React, { useState } from "react";

type AuthProps = {
  onLogin: (username: string) => void;
};

export const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!username.trim()) {
      setError("Username cannot be empty");
      return;
    }

    onLogin(username.trim());
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "#f0f0f0",
        padding: "1rem",
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          background: "white",
          padding: "2rem",
          borderRadius: "12px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          width: "100%",
          maxWidth: 400,
          textAlign: "center",
        }}
      >
        <h2 style={{ marginBottom: "1rem" }}>Welcome to MetaPins</h2>
        <input
          type="text"
          placeholder="Enter your username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          style={{
            width: "100%",
            padding: "0.75rem",
            borderRadius: "8px",
            border: "1px solid #ccc",
            marginBottom: "1rem",
            fontSize: "1rem",
          }}
        />
        {error && <p style={{ color: "red", marginBottom: "1rem" }}>{error}</p>}
        <button
          type="submit"
          style={{
            width: "100%",
            padding: "0.75rem",
            borderRadius: "8px",
            border: "none",
            background: "#0070f3",
            color: "white",
            fontSize: "1rem",
            cursor: "pointer",
          }}
        >
          Login
        </button>
      </form>
    </div>
  );
};
