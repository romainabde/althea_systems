export async function login(email, password) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // Simulation : on accepte n'importe quel login pour le test
      if (email && password.length >= 4) {
        const userData = { id: 1, name: "Dr. Jean Dupont", email: email, role: "CLIENT" };
        localStorage.setItem("althea_user", JSON.stringify(userData));
        resolve(userData);
      } else {
        reject("Identifiants invalides (le mot de passe doit faire 4 caractères).");
      }
    }, 800);
  });
}

export async function register(userData) {
  return new Promise((resolve) => {
    setTimeout(() => {
      localStorage.setItem("althea_user", JSON.stringify(userData));
      resolve(userData);
    }, 800);
  });
}

export function logout() {
  localStorage.removeItem("althea_user");
  window.location.href = "/login";
}