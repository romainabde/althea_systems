"use client";
import { useState } from "react";
import { register } from "../../services/authService";
import Link from "next/link";

export default function RegisterPage() {
  const [formData, setFormData] = useState({ name: "", email: "", password: "", hospital: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    await register(formData);
    alert("Compte créé avec succès ! Bienvenue chez Althea Systems.");
    window.location.href = "/";
  };

  return (
    <main style={{ maxWidth: "450px", margin: "60px auto", padding: "40px", backgroundColor: "white", borderRadius: "16px", boxShadow: "0 10px 25px rgba(0,0,0,0.1)", fontFamily: "sans-serif" }}>
      <h1 style={{ fontSize: "1.8rem", marginBottom: "10px", color: "#0f172a" }}>Créer un compte</h1>
      <p style={{ color: "#64748b", marginBottom: "30px" }}>Rejoignez le réseau Althea Systems.</p>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        <input type="text" placeholder="Nom complet" required onChange={e => setFormData({...formData, name: e.target.value})} style={inputStyle} />
        <input type="text" placeholder="Établissement de santé (ex: CHU Paris)" required onChange={e => setFormData({...formData, hospital: e.target.value})} style={inputStyle} />
        <input type="email" placeholder="Email professionnel" required onChange={e => setFormData({...formData, email: e.target.value})} style={inputStyle} />
        <input type="password" placeholder="Mot de passe" required onChange={e => setFormData({...formData, password: e.target.value})} style={inputStyle} />
        
        <button type="submit" style={btnStyle}>S'inscrire</button>
      </form>

      <p style={{ marginTop: "20px", textAlign: "center", color: "#64748b" }}>
        Déjà inscrit ? <Link href="/login" style={{ color: "#2563eb", fontWeight: "bold" }}>Connectez-vous</Link>
      </p>
    </main>
  );
}

const inputStyle = { padding: "12px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "1rem" };
const btnStyle = { backgroundColor: "#2563eb", color: "white", padding: "14px", borderRadius: "8px", border: "none", cursor: "pointer", fontWeight: "bold", fontSize: "1rem" };