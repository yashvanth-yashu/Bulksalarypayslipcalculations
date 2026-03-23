import { useState, useEffect, useRef } from "react";
import "./LoginPage.css";

const VALID_USERS = [
  { username: "admin",   password: "Origine@2025" },
  { username: "hr",      password: "HR@origine"   },
  { username: "payroll", password: "Pay@2025"      },
];

const PARTICLES = Array.from({ length: 32 }, (_, i) => ({
  id: i,
  size:    Math.random() * 3 + 1,
  x:       Math.random() * 100,
  y:       Math.random() * 100,
  dur:     Math.random() * 14 + 10,
  delay:   Math.random() * -20,
  opacity: Math.random() * 0.35 + 0.08,
}));

export default function LoginPage({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");
  const [shake,    setShake]    = useState(false);
  const [focused,  setFocused]  = useState("");
  const [mounted,  setMounted]  = useState(false);
  const canvasRef = useRef(null);

  useEffect(() => { setMounted(true); }, []);

  /* ── Canvas waves ── */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let raf, t = 0;
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener("resize", resize);
    const draw = () => {
      const W = canvas.width, H = canvas.height;
      ctx.clearRect(0, 0, W, H);
      const bg = ctx.createLinearGradient(0, 0, W, H);
      bg.addColorStop(0,   "#020408");
      bg.addColorStop(0.5, "#060d18");
      bg.addColorStop(1,   "#020408");
      ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
      [
        { amp:60, freq:.006, speed:.012, y:H*.35, color:"rgba(31,111,235,0.07)" },
        { amp:45, freq:.008, speed:.018, y:H*.55, color:"rgba(224,123,26,0.05)" },
        { amp:35, freq:.010, speed:.010, y:H*.72, color:"rgba(63,185,80,0.04)"  },
      ].forEach(({ amp, freq, speed, y, color }) => {
        ctx.beginPath(); ctx.moveTo(0, H);
        for (let x = 0; x <= W; x += 4) {
          ctx.lineTo(x, y + Math.sin(x*freq + t*speed)*amp + Math.sin(x*freq*1.7 + t*speed*.6)*(amp*.4));
        }
        ctx.lineTo(W, H); ctx.closePath();
        ctx.fillStyle = color; ctx.fill();
      });
      t++; raf = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, []);

  const triggerError = (msg) => {
    setError(msg); setShake(true);
    setTimeout(() => setShake(false), 650);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!username.trim()) { triggerError("Please enter your username."); return; }
    if (!password)        { triggerError("Please enter your password.");  return; }
    setLoading(true); setError("");
    setTimeout(() => {
      const match = VALID_USERS.find(u => u.username === username.trim() && u.password === password);
      if (match) { onLogin(match.username); }
      else { setLoading(false); triggerError("Invalid username or password."); setPassword(""); }
    }, 900);
  };

  return (
    <div className="lp-root">
      <canvas ref={canvasRef} className="lp-canvas" />

      {/* Particles */}
      <div className="lp-particles">
        {PARTICLES.map(p => (
          <div key={p.id} className="lp-particle" style={{
            width: p.size+"px", height: p.size+"px",
            left: p.x+"%", top: p.y+"%", opacity: p.opacity,
            animationDuration: p.dur+"s", animationDelay: p.delay+"s",
          }}/>
        ))}
      </div>

      {/* Spotlights */}
      <div className="lp-spot lp-spot--blue"  />
      <div className="lp-spot lp-spot--orange" />
      <div className="lp-spot lp-spot--green"  />

      {/* ── CENTERED CARD ── */}
      <div className={`lp-wrap${mounted ? " lp-wrap--in" : ""}`}>
        <div className={`lp-card${shake ? " lp-card--shake" : ""}`}>

          {/* Animated border */}
          <div className="lp-card__border" />

          {/* Top: Logo + Brand */}
          <div className="lp-brand">
            <div className="lp-logo">
              <span className="lp-logo__symbol">₹</span>
              <div className="lp-logo__ring lp-logo__ring--1" />
              <div className="lp-logo__ring lp-logo__ring--2" />
              <div className="lp-logo__ring lp-logo__ring--3" />
            </div>
            <div>
              <p className="lp-brand__name">Origine Engineering Tech</p>
              <p className="lp-brand__tag">Payroll Management System</p>
            </div>
          </div>

          <div className="lp-divider" />

          {/* Heading */}
          <div className="lp-heading">
            <div className="lp-badge">SECURE LOGIN</div>
            <h2 className="lp-heading__title">Welcome back</h2>
            <p className="lp-heading__sub">Sign in to access the salary dashboard</p>
          </div>

          {/* Error */}
          {error && (
            <div className="lp-error" role="alert">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8"  x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              <span>{error}</span>
              <button className="lp-error__x" onClick={() => setError("")}>×</button>
            </div>
          )}

          {/* Form */}
          <form className="lp-form" onSubmit={handleSubmit} autoComplete="off">

            {/* Username */}
            <div className={`lp-field${focused==="u" ? " lp-field--active" : ""}`}>
              <label className="lp-field__label">Username</label>
              <div className="lp-field__box">
                <span className="lp-field__icon">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <circle cx="12" cy="8" r="4"/>
                    <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
                  </svg>
                </span>
                <input
                  className="lp-field__input"
                  type="text" placeholder="Enter your username"
                  value={username}
                  onChange={e => { setUsername(e.target.value); setError(""); }}
                  onFocus={() => setFocused("u")}
                  onBlur={()  => setFocused("")}
                  disabled={loading} autoFocus
                />
                <div className="lp-field__line" />
              </div>
            </div>

            {/* Password */}
            <div className={`lp-field${focused==="p" ? " lp-field--active" : ""}`}>
              <label className="lp-field__label">Password</label>
              <div className="lp-field__box">
                <span className="lp-field__icon">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <rect x="3" y="11" width="18" height="11" rx="2"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                </span>
                <input
                  className="lp-field__input"
                  type={showPass ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={e => { setPassword(e.target.value); setError(""); }}
                  onFocus={() => setFocused("p")}
                  onBlur={()  => setFocused("")}
                  disabled={loading}
                />
                <button type="button" className="lp-field__eye" onClick={() => setShowPass(s => !s)} tabIndex={-1}>
                  {showPass ? (
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  ) : (
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  )}
                </button>
                <div className="lp-field__line" />
              </div>
            </div>

            {/* Submit */}
            <button className={`lp-submit${loading ? " lp-submit--busy" : ""}`} type="submit" disabled={loading}>
              <span className="lp-submit__shine" />
              <span className="lp-submit__body">
                {loading ? (
                  <><span className="lp-spin" /> Authenticating…</>
                ) : (
                  <>
                    Sign In
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="5" y1="12" x2="19" y2="12"/>
                      <polyline points="12 5 19 12 12 19"/>
                    </svg>
                  </>
                )}
              </span>
            </button>
          </form>

          {/* Footer */}
          <div className="lp-footer">
            <div className="lp-footer__badge">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <rect x="3" y="11" width="18" height="11" rx="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
              256-bit Encrypted
            </div>
            <span className="lp-footer__dot" />
            <span className="lp-footer__copy">Origine Engineering Tech Pvt Ltd</span>
          </div>

        </div>
      </div>
    </div>
  );
}
