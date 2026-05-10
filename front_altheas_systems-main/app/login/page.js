"use client";
import { useState } from "react";
import { login } from "../../services/authService";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      window.location.href = "/";
    } catch (err) {
      alert(err);
    }
  };

  return (
    <main style={{ maxWidth: "400px", margin: "80px auto", padding: "40px", backgroundColor: "white", borderRadius: "16px", boxShadow: "0 10px 25px rgba(0,0,0,0.1)", fontFamily: "sans-serif" }}>
      <h1 style={{ fontSize: "1.8rem", textAlign: "center", marginBottom: "30px" }}>Connexion</h1>
      
      <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        <input type="email" placeholder="Email" required value={email} onChange={e => setEmail(e.target.value)} style={inputStyle} />
        <input type="password" placeholder="Mot de passe" required value={password} onChange={e => setPassword(e.target.value)} style={inputStyle} />
        <button type="submit" style={btnStyle}>Se connecter</button>
      </form>

      <p style={{ marginTop: "20px", textAlign: "center" }}>
        Nouveau client ? <Link href="/register" style={{ color: "#2563eb" }}>Créer un compte</Link>
      </p>
    </main>
  );
}

const inputStyle = { padding: "12px", borderRadius: "8px", border: "1px solid #cbd5e1" };
const btnStyle = { backgroundColor: "#0f172a", color: "white", padding: "14px", borderRadius: "8px", border: "none", cursor: "pointer", fontWeight: "bold" };