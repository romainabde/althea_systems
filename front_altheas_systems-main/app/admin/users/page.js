"use client";

import Link from "next/link";
import { useState } from "react";

const pageStyle = { padding: "1rem", maxWidth: "900px", margin: "0 auto" };
const cardStyle = { border: "1px solid #ddd", borderRadius: "12px", padding: "1rem", marginTop: "1rem", background: "#fff" };
const inputStyle = { width: "100%", padding: "0.55rem 0.65rem", border: "1px solid #ccc", borderRadius: "8px" };
const buttonStyle = { padding: "0.45rem 0.7rem", border: "none", borderRadius: "8px", cursor: "pointer" };

const initialUsers = [
  { id: 1, fullName: "Jean Dupont", email: "jean@althea.com", role: "Client" },
  { id: 2, fullName: "Sara Martin", email: "sara@althea.com", role: "Admin" },
  { id: 3, fullName: "Lucas Bernard", email: "lucas@althea.com", role: "Client" },
];

export default function AdminUsersPage() {
  const [users, setUsers] = useState(initialUsers);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("Client");

  function handleAddUser(event) {
    event.preventDefault();
    if (!fullName.trim() || !email.trim()) return;
    setUsers((prev) => [...prev, { id: Date.now(), fullName: fullName.trim(), email: email.trim(), role }]);
    setFullName("");
    setEmail("");
    setRole("Client");
  }

  function handleDelete(id) {
    setUsers((prev) => prev.filter((item) => item.id !== id));
  }

  function handleEdit(user) {
    const nextName = window.prompt("Nouveau nom", user.fullName);
    if (!nextName) return;
    const nextEmail = window.prompt("Nouvel email", user.email);
    if (!nextEmail) return;
    const nextRole = window.prompt("Nouveau rôle (Admin ou Client)", user.role);
    if (!nextRole) return;

    setUsers((prev) =>
      prev.map((item) =>
        item.id === user.id
          ? { ...item, fullName: nextName.trim(), email: nextEmail.trim(), role: nextRole.trim() }
          : item
      )
    );
  }

  return (
    <section style={pageStyle}>
      <h1 style={{ marginBottom: "0.35rem" }}>Admin - Utilisateurs</h1>
      <p style={{ marginTop: 0, color: "#555" }}>Gestion front-only des utilisateurs.</p>

      <form onSubmit={handleAddUser} style={cardStyle}>
        <h2 style={{ marginTop: 0, fontSize: "1rem" }}>Ajouter un utilisateur</h2>
        <div style={{ display: "grid", gap: "0.6rem" }}>
          <input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Nom complet" style={inputStyle} />
          <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" type="email" style={inputStyle} />
          <select value={role} onChange={(e) => setRole(e.target.value)} style={inputStyle}>
            <option>Client</option>
            <option>Admin</option>
          </select>
        </div>
        <button type="submit" style={{ ...buttonStyle, marginTop: "0.8rem", background: "#003d5c", color: "#fff" }}>
          Ajouter
        </button>
      </form>

      <article style={cardStyle}>
        <h2 style={{ marginTop: 0, fontSize: "1rem" }}>Liste utilisateurs</h2>
        <div style={{ display: "grid", gap: "0.65rem" }}>
          {users.map((user) => (
            <div key={user.id} style={{ border: "1px solid #eee", borderRadius: "10px", padding: "0.75rem" }}>
              <p style={{ margin: 0, fontWeight: 700 }}>{user.fullName}</p>
              <p style={{ margin: "0.3rem 0 0 0", color: "#444" }}>{user.email}</p>
              <p style={{ margin: "0.3rem 0 0 0", color: "#003d5c", fontWeight: 600 }}>Rôle : {user.role}</p>
              <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.55rem" }}>
                <button type="button" onClick={() => handleEdit(user)} style={{ ...buttonStyle, background: "#2563eb", color: "#fff" }}>
                  Modifier
                </button>
                <button type="button" onClick={() => handleDelete(user.id)} style={{ ...buttonStyle, background: "#dc2626", color: "#fff" }}>
                  Supprimer
                </button>
              </div>
            </div>
          ))}
        </div>
      </article>

      <Link href="/admin" style={{ display: "inline-block", marginTop: "1rem", color: "#003d5c", textDecoration: "none" }}>
        Retour dashboard admin
      </Link>
    </section>
  );
}
