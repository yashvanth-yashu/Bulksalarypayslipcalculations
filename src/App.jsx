import { useState, useEffect } from "react";
import LoginPage from "./LoginPage";
import SalarySheet from "./SalaryCalculations";
import useSecurity from "./useSecurity";

const LS_SESSION = "payroll_session";

function loadSession() {
  try {
    const s = localStorage.getItem(LS_SESSION);
    return s ? JSON.parse(s) : null;
  } catch { return null; }
}

export default function App() {
  useSecurity();

  const [user, setUser] = useState(loadSession);

  const handleLogin = (username) => {
    const session = { username, loginAt: Date.now() };
    try { localStorage.setItem(LS_SESSION, JSON.stringify(session)); } catch {}
    setUser(session);
  };

  const handleLogout = () => {
    try { localStorage.removeItem(LS_SESSION); } catch {}
    setUser(null);
  };

  if (!user) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return <SalarySheet user={user} onLogout={handleLogout} />;
}
