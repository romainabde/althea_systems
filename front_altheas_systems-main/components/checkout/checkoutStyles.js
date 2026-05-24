export const inputStyle = {
  padding: "15px",
  borderRadius: "10px",
  border: "1px solid #cbd5e1",
  fontSize: "1rem",
  outline: "none",
  width: "100%",
  boxSizing: "border-box",
};

export const nextBtnStyle = {
  width: "100%",
  backgroundColor: "#0f172a",
  color: "white",
  padding: "16px",
  borderRadius: "10px",
  border: "none",
  cursor: "pointer",
  fontWeight: "bold",
  fontSize: "1.1rem",
  marginTop: "20px",
};

export const backBtnStyle = {
  flex: 0.5,
  backgroundColor: "transparent",
  color: "#64748b",
  padding: "16px",
  borderRadius: "10px",
  border: "1px solid #cbd5e1",
  cursor: "pointer",
  fontWeight: "bold",
  fontSize: "1rem",
};

export const confirmBtnStyle = {
  ...nextBtnStyle,
  flex: 1,
  backgroundColor: "#16a34a",
  marginTop: 0,
};

export const errorBoxStyle = {
  padding: "15px",
  backgroundColor: "#fef2f2",
  color: "#dc2626",
  borderRadius: "10px",
  marginBottom: "20px",
  fontWeight: "bold",
  border: "1px solid #f87171",
};

export const stepperStyle = {
  display: "flex",
  justifyContent: "space-between",
  marginBottom: "30px",
  borderBottom: "2px solid #e2e8f0",
  paddingBottom: "20px",
};

export function stepLabelStyle(active) {
  return {
    fontWeight: active ? "bold" : "normal",
    color: active ? "#0f172a" : "#94a3b8",
  };
}

export const mainCardStyle = {
  backgroundColor: "white",
  padding: "40px",
  borderRadius: "20px",
  boxShadow: "0 10px 25px rgba(0,0,0,0.05)",
};

export const radioCardStyle = (selected) => ({
  display: "flex",
  alignItems: "flex-start",
  gap: "12px",
  padding: "16px",
  borderRadius: "12px",
  border: selected ? "2px solid #2563eb" : "1px solid #e2e8f0",
  backgroundColor: selected ? "#eff6ff" : "#fff",
  cursor: "pointer",
  marginBottom: "12px",
});
