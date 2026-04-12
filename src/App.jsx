import { useState } from "react";
import LoginPage   from "./LoginPage";
import SalarySheet from "./SalaryCalculations";
import Timesheet from "./TimeSheet";
import useSecurity from "./useSecurity";

const LS_SESSION = "payroll_session";
const loadSession = () => {
  try { return JSON.parse(localStorage.getItem(LS_SESSION) || "null"); }
  catch { return null; }
};

const ADMIN_USERNAMES = ["admin", "superadmin"];
const isAdmin = (username) =>
  ADMIN_USERNAMES.includes(username?.trim().toLowerCase());

export default function App() {
  useSecurity();
  const [user, setUser] = useState(loadSession);

  // Default landing page depends on role
  const [page, setPage] = useState(() => {
    const saved = loadSession();
    return saved && isAdmin(saved.username) ? "salary" : "timesheet";
  });

  const handleLogin = (username) => {
    const s = { username, loginAt: Date.now() };
    localStorage.setItem(LS_SESSION, JSON.stringify(s));
    setUser(s);
    // Send admin → Salary Sheet, everyone else → Timesheet
    setPage(isAdmin(username) ? "salary" : "timesheet");
  };

  const handleLogout = () => {
    localStorage.removeItem(LS_SESSION);
    setUser(null);
  };

  if (!user) return <LoginPage onLogin={handleLogin} />;

  const admin = isAdmin(user.username);

  return (
    <>
      <nav style={{
        display: "flex", gap: "8px", padding: "8px 20px",
        background: "var(--bg-card)", borderBottom: "1px solid var(--border)"
      }}>
        {/* Salary Sheet tab — admin only */}
        {admin && (
          <button
            onClick={() => setPage("salary")}
            style={{
              padding: "6px 14px", borderRadius: "6px", border: "none",
              cursor: "pointer", fontFamily: "inherit", fontWeight: 600,
              background: page === "salary" ? "var(--accent)" : "transparent",
              color:      page === "salary" ? "#fff" : "var(--text-secondary)",
            }}
          >
            Salary Sheet
          </button>
        )}

        {/* Timesheet tab — always visible */}
        <button
          onClick={() => setPage("timesheet")}
          style={{
            padding: "6px 14px", borderRadius: "6px", border: "none",
            cursor: "pointer", fontFamily: "inherit", fontWeight: 600,
            background: page === "timesheet" ? "var(--accent)" : "transparent",
            color:      page === "timesheet" ? "#fff" : "var(--text-secondary)",
          }}
        >
          Timesheet
        </button>
      </nav>

      {page === "salary"    && admin && <SalarySheet user={user} onLogout={handleLogout} />}
      {page === "timesheet" &&          <Timesheet   user={user} onLogout={handleLogout} />}
    </>
  );
}