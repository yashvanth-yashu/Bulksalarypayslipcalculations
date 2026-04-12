import { useState, useEffect, useRef, useCallback } from 'react'
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"
import './Timesheet.css'

/* ─── helpers ─── */
const pad    = n => String(n).padStart(2, '0')
const hms    = s => `${pad(Math.floor(s/3600))}:${pad(Math.floor((s%3600)/60))}:${pad(s%60)}`
const hm     = s => `${Math.floor(s/3600)}h ${pad(Math.floor((s%3600)/60))}m`
const nowStr = () => { const d = new Date(); return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}` }

/* Parse seconds → { h, m } */
const parseHM = s => ({
  h: Math.floor(s / 3600),
  m: Math.floor((s % 3600) / 60),
})

/* ─────────────────────────────────────────────────────────────────
   Replace the entire TotalCard function in Timesheet.jsx with this.
   Everything else in Timesheet.jsx stays the same.
───────────────────────────────────────────────────────────────── */

function TotalCard({ label, secs, variant }) {
  const { h, m } = parseHM(secs)

  const icons = {
    work: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"
        strokeLinecap="round" strokeLinejoin="round" width="15" height="15">
        <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
      </svg>
    ),
    brk: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"
        strokeLinecap="round" strokeLinejoin="round" width="15" height="15">
        <path d="M18 8h1a4 4 0 0 1 0 8h-1"/>
        <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/>
      </svg>
    ),
    grand: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"
        strokeLinecap="round" strokeLinejoin="round" width="15" height="15">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
      </svg>
    ),
  }
  const subLabel = { work: 'Total work time', brk: 'Total break time', grand: 'Work + break combined' }
  return (
    <div className={`total-card total-card--${variant}`}>
      <div className="tc-left">
        <div className={`tc-icon-sm tc-icon-sm--${variant}`}>{icons[variant]}</div>
        <span className="tc-label">{label}</span>
      </div>
      <div className="tc-right">
        <span className="tc-val-num">
          {h}<span className="tc-val-unit">h</span>
        </span>
        <span className="tc-val-sep">:</span>
        <span className="tc-val-num">
          {String(m).padStart(2, '0')}<span className="tc-val-unit">m</span>
        </span>
      </div>
    </div>
  )
}


/* ─── Notification ─── */
const NOTIF_CONFIGS = {
  start:  { stripe: 'linear-gradient(90deg,#0ea572,#4f8ef7)', iconBg: '#e6f9f1', stroke: '#0ea572', prog: '#0ea572',
            icon: <><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></> },
  break:  { stripe: 'linear-gradient(90deg,#f59e0b,#f97316)', iconBg: '#fffbeb', stroke: '#f59e0b', prog: '#f59e0b',
            icon: <><rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/></> },
  resume: { stripe: 'linear-gradient(90deg,#4f8ef7,#0ea572)', iconBg: '#eef4ff', stroke: '#4f8ef7', prog: '#4f8ef7',
            icon: <polygon points="5 3 19 12 5 21 5 3"/> },
  done:   { stripe: 'linear-gradient(90deg,#8b5cf6,#4f8ef7)', iconBg: '#f5f3ff', stroke: '#8b5cf6', prog: '#8b5cf6',
            icon: <polyline points="20 6 9 17 4 12"/> },
  warn:   { stripe: 'linear-gradient(90deg,#f59e0b,#ef4444)', iconBg: '#fffbeb', stroke: '#f59e0b', prog: '#f59e0b',
            icon: <><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></> },
  error:  { stripe: 'linear-gradient(90deg,#ef4444,#dc2626)', iconBg: '#fef2f2', stroke: '#ef4444', prog: '#ef4444',
            icon: <><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></> },
}

function Notification({ notif, onDone }) {
  const [hiding, setHiding] = useState(false)
  const c = NOTIF_CONFIGS[notif.type] || NOTIF_CONFIGS.start
  useEffect(() => {
    const t1 = setTimeout(() => setHiding(true), 3800)
    const t2 = setTimeout(() => onDone(), 4120)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [onDone])
  return (
    <div className={`notif${hiding ? ' hide' : ''}`}>
      <div className="notif-stripe" style={{ background: c.stripe }} />
      <div className="notif-body">
        <div className="notif-icon" style={{ background: c.iconBg }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
            stroke={c.stroke} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            {c.icon}
          </svg>
        </div>
        <div>
          <div className="notif-title">{notif.title}</div>
          <div className="notif-sub">{notif.sub}</div>
        </div>
      </div>
      <div className="notif-prog">
        <div className="notif-prog-bar" style={{ background: c.prog }} />
      </div>
    </div>
  )
}

/* ─── Status Badge ─── */
function StatusBadge({ status }) {
  const map = { done: ['bdone','Done'], break: ['bbreak','Break'], active: ['bact','Active'] }
  const [cls, label] = map[status] || map.done
  return <span className={`badge ${cls}`}>{label}</span>
}

/* ─── Main Component ─── */
export default function Timesheet({ user, onLogout }) {
  const today = new Date().toISOString().split('T')[0]

  // Form
  const [jobNo,    setJobNo]    = useState('')
  const [taskType, setTaskType] = useState('')
  const [billable, setBillable] = useState('non-billable')
  const [taskDesc, setTaskDesc] = useState('')

  // Timer
  const [timerSecs, setTimerSecs] = useState(0)
  const [state,     setState]     = useState('idle') // idle | running | break
  const intervalRef   = useRef(null)
  const workStartRef  = useRef(null)
  const breakStartRef = useRef(null)
  const secRef        = useRef(0)

  // Data
  const [entries,        setEntries]        = useState([])
  const [totalWorkSecs,  setTotalWorkSecs]  = useState(0)
  const [totalBreakSecs, setTotalBreakSecs] = useState(0)

  // Timesheet panel
  const [fromDate, setFromDate] = useState(today)
  const [toDate,   setToDate]   = useState(today)
  const [loading,  setLoading]  = useState(false)

  // Notification
  const [notif, setNotif] = useState(null)

  const headerDate = new Date().toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })

  const startInterval = useCallback(() => {
    intervalRef.current = setInterval(() => {
      secRef.current += 1
      setTimerSecs(secRef.current)
    }, 1000)
  }, [])

  const stopInterval = useCallback(() => {
    clearInterval(intervalRef.current)
    intervalRef.current = null
  }, [])

  useEffect(() => () => stopInterval(), [stopInterval])

  const notify = useCallback((type, title, sub) => {
    setNotif({ type, title, sub, id: Date.now() })
  }, [])

  const pushEntry = useCallback((status, start, end, dur) => {
    const jobOptions = {
      'J001': 'J001 – Website Redesign', 'J002': 'J002 – Backend API',
      'J003': 'J003 – QA Testing',       'J004': 'J004 – Data Migration',
      'J005': 'J005 – Client Onboarding',
    }
    setEntries(prev => [...prev, {
      start, end, status,
      jobNo:    jobNo || '—',
      jobDesc:  jobNo ? (jobOptions[jobNo] || jobNo) : '—',
      comments: taskDesc || '—',
      duration: dur,
      billable,
    }])
  }, [jobNo, taskDesc, billable])

  const resetForm = () => {
    setJobNo(''); setTaskType(''); setBillable('non-billable'); setTaskDesc('')
  }

  /* ── handlers ── */
  const handleStart = () => {
    if (!jobNo && !taskType) {
    notify(
      'warn',
      'Missing details ⚠️',
      'Please Job No, Task Type before starting.'
    )
    return
  }
    if (!taskDesc.trim()) {
    notify(
      'warn',
      'Missing details ⚠️',
      'Please fill Task Description before starting.'
    )
    return
  }

  const today = new Date().toISOString().split('T')[0]
  if (fromDate > today || toDate > today) {
    notify(
      'warn',
      'Invalid date 🚫',
      'Future dates are not allowed.'
    )
    return
  }
   
    if (state !== 'idle') return
    workStartRef.current = nowStr()
    secRef.current = 0
    setTimerSecs(0)
    startInterval()
    setState('running')
    notify('start', 'Your job is started! 🚀', 'Timer is running — stay focused and productive!')
  }

  const handleBreak = () => {
    if (state === 'idle') return
    if (state === 'running') {
      stopInterval()
      const dur = secRef.current
      setTotalWorkSecs(p => p + dur)
      pushEntry('done', workStartRef.current, nowStr(), dur)
      secRef.current = 0; setTimerSecs(0)
      breakStartRef.current = nowStr()
      startInterval()
      setState('break')
      notify('break', 'Break started ☕', `Worked ${hm(dur)} — enjoy your break!`)
    } else if (state === 'break') {
      stopInterval()
      const dur = secRef.current
      setTotalBreakSecs(p => p + dur)
      pushEntry('break', breakStartRef.current, nowStr(), dur)
      secRef.current = 0; setTimerSecs(0)
      workStartRef.current = nowStr()
      startInterval()
      setState('running')
      notify('resume', 'Welcome back! 💪', `Break was ${hm(dur)} — let's keep going!`)
    }
  }

  const handleEndTask = useCallback(() => {
    if (state === 'idle') return
    stopInterval()
    const dur = secRef.current
    if (state === 'running') {
      setTotalWorkSecs(p => {
        const nw = p + dur
        setTotalBreakSecs(b => { notify('done', 'Task completed ✓', `Work: ${hm(nw)}   ·   Break: ${hm(b)}`); return b })
        return nw
      })
      pushEntry('done', workStartRef.current, nowStr(), dur)
    } else if (state === 'break') {
      setTotalBreakSecs(p => {
        const nb = p + dur
        setTotalWorkSecs(w => { notify('done', 'Task completed ✓', `Work: ${hm(w)}   ·   Break: ${hm(nb)}`); return w })
        return nb
      })
      pushEntry('break', breakStartRef.current, nowStr(), dur)
    }
    secRef.current = 0; setTimerSecs(0)
    setState('idle'); resetForm()
  }, [state, stopInterval, pushEntry, notify])

  const handleEndDay = () => {
    if (state !== 'idle') handleEndTask()
    else notify('done', 'Day ended 🌙', `Total: ${hm(totalWorkSecs)}   ·   Break: ${hm(totalBreakSecs)}`)
    resetForm()
  }

  /* ════ GET TIMESHEET API ════
     Replace the body of getTimesheetFromAPI with your real fetch call.
     Expected response: Array of:
     { start, end, status: "done"|"break", jobNo, jobDesc, comments, duration (seconds) }
  */
  const getTimesheetFromAPI = async (from, to) => {
    // const res = await fetch(`/api/timesheet?from=${from}&to=${to}`, {
    //   headers: { Authorization: 'Bearer YOUR_TOKEN' }
    // })
    // if (!res.ok) throw new Error('HTTP ' + res.status)
    // return res.json()
    throw new Error('API_NOT_INTEGRATED')
  }

  const handleGetTimesheet = async () => {
    if (!fromDate || !toDate) { notify('warn', 'Select dates', 'Please pick both From and To dates.'); return }
    if (fromDate > toDate)    { notify('warn', 'Invalid range', 'From date must be before To date.'); return }
    setLoading(true)
    try {
      const data = await getTimesheetFromAPI(fromDate, toDate)
      setEntries(data)
      setTotalWorkSecs(data.filter(e => e.status === 'done').reduce((a, e) => a + e.duration, 0))
      setTotalBreakSecs(data.filter(e => e.status === 'break').reduce((a, e) => a + e.duration, 0))
      notify('start', 'Timesheet loaded', 'Data fetched successfully!')
    } catch (err) {
      if (err.message === 'API_NOT_INTEGRATED')
        notify('warn', 'API not connected yet', 'Share your endpoint and it will be wired up!')
      else
        notify('error', 'Error', err.message)
    } finally { setLoading(false) }
  }

  const isRunning = state === 'running'
  const isBreak   = state === 'break'
  const isIdle    = state === 'idle'

  const clockClass = isRunning ? 'clock running' : isBreak ? 'clock on-break' : 'clock'
  const wrapClass  = isRunning ? 'timer-wrap live' : isBreak ? 'timer-wrap on-break' : 'timer-wrap'
  const chipClass  = isRunning ? 'chip-running' : isBreak ? 'chip-break' : 'chip-idle'
  const chipLabel  = isRunning ? 'Running' : isBreak ? 'On Break' : 'Idle'

  return (
    <div className="ts-page">
      <div className="ts-bg" />
     <header className="ts-header">
  <div className="brand">
    <div className="brand-mark">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff"
        strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
      </svg>
    </div>
    <div className="brand-text">
      <h1>Timesheet</h1>
      <p>Track every second of your work</p>
    </div>
  </div>

  {/* ── Right side: pill + logout grouped together ── */}
  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>

    <div className="header-pill">
      <span className="pill-dot" />
      <span>{headerDate}</span>
    </div>

    <button
  onClick={onLogout}
  style={{
    display: "flex", alignItems: "center", gap: "6px",
    padding: "7px 14px", borderRadius: "8px",
    border: "1.5px solid var(--border)",
    background: "var(--surface-2)",
    color: "var(--text-secondary)",
    cursor: "pointer", fontFamily: "var(--font)",
    fontSize: "13px", fontWeight: 600,
    transition: "all 0.2s",
  }}
  onMouseEnter={e => {
    e.currentTarget.style.background = "#fef2f2"
    e.currentTarget.style.borderColor = "#fca5a5"
    e.currentTarget.style.color = "#ef4444"
  }}
  onMouseLeave={e => {
    e.currentTarget.style.background = "var(--surface-2)"
    e.currentTarget.style.borderColor = "var(--border)"
    e.currentTarget.style.color = "var(--text-secondary)"
  }}
  title="Sign out"
>
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2.2"
    strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
    <polyline points="16 17 21 12 16 7"/>
    <line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
  Logout
</button>

  </div>
</header>
      

      <div className="ts-root">

        {/* ══ LEFT ══ */}
        <div className="card ts-left anim-d1">
          <div className="left-inner">
            <div className="left-header">
              <span className="section-tag">Task Entry</span>
              <button className="icon-btn" title="Sync">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" width="13" height="13">
                  <polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3.1"/>
                </svg>
              </button>
            </div>

            <div className="field">
              <label className="field-label">Job number</label>
              <select value={jobNo} onChange={e => setJobNo(e.target.value)}>
                <option value="">— select job —</option>
                <option value="J001">J001 – Website Redesign</option>
                <option value="J002">J002 – Backend API</option>
                <option value="J003">J003 – QA Testing</option>
                <option value="J004">J004 – Data Migration</option>
                <option value="J005">J005 – Client Onboarding</option>
              </select>
            </div>

            <div className="field">
              <label className="field-label">Task type</label>
              <select value={taskType} onChange={e => setTaskType(e.target.value)}>
                <option value="">— select type —</option>
                <option>Development</option><option>Testing</option>
                <option>Design</option><option>Meeting</option>
                <option>Documentation</option><option>Support</option>
              </select>
            </div>

            <div className="field">
              <label className="field-label">Billable</label>
              <div className="billable-wrap">
                {['non-billable', 'billable'].map(v => (
                  <label key={v} className={`bill-opt ${billable === v ? 'checked' : ''}`}>
                    <input type="radio" name="billable" value={v}
                      checked={billable === v} onChange={() => setBillable(v)} />
                    <span className="bill-dot" />
                    {v === 'non-billable' ? 'Non-billable' : 'Billable'}
                  </label>
                ))}
              </div>
            </div>

            <div className="field">
              <label className="field-label">Task description</label>
              <textarea
                value={taskDesc}
                onChange={e => setTaskDesc(e.target.value)}
                placeholder="Describe what you're working on…"
                rows={3}
              />
            </div>

            {/* Timer */}
            <div className={wrapClass}>
              <div className="timer-inner">
                <span className={clockClass}>{hms(timerSecs)}</span>
                <span className={`status-chip ${chipClass}`}>{chipLabel}</span>
              </div>
            </div>

            {/* Buttons */}
            <div className="btn-grid">
              <button className="abtn abtn-start" disabled={!isIdle} onClick={handleStart}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                Start
              </button>

              <div className="btn-row-mid">
                <button
                  className={`abtn ${isBreak ? 'abtn-endbreak' : 'abtn-break'}`}
                  disabled={isIdle}
                  onClick={handleBreak}
                >
                  {isBreak
                    ? <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                    : <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/></svg>
                  }
                  {isBreak ? 'End Break' : 'Break'}
                </button>
                <button className="abtn abtn-end-task" disabled={isIdle} onClick={handleEndTask}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  End Task
                </button>
              </div>

              <button className="abtn abtn-end-day" onClick={handleEndDay}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><rect x="4" y="4" width="16" height="16" rx="2"/></svg>
                End Day
              </button>
            </div>
          </div>
        </div>

        {/* ══ RIGHT ══ */}
        <div className="ts-right">

          {/* Date bar */}
              
          <div className="card date-bar anim-d2">
  <div className="date-field">
    <label>From date</label>
    <DatePicker
      selected={fromDate ? new Date(fromDate) : null}
      onChange={(date) => setFromDate(date.toISOString().split('T')[0])}
      maxDate={new Date()}
      dateFormat="dd-MM-yyyy"
      placeholderText="Select From Date"
      className="custom-datepicker"
    />
  </div>

  <div className="date-field">
    <label>To date</label>
    <DatePicker
      selected={toDate ? new Date(toDate) : null}
      onChange={(date) => setToDate(date.toISOString().split('T')[0])}
      maxDate={new Date()}
      dateFormat="dd-MM-yyyy"
      placeholderText="Select To Date"
      className="custom-datepicker"
    />
  </div>

  <button className="btn-get" disabled={loading} onClick={handleGetTimesheet}>
    {loading ? 'Loading…' : 'Get Timesheet'}
  </button>
</div>
          {/* Table */}
          <div className="card table-card anim-d2">
            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>Start</th><th>End</th><th>Status</th>
                    <th>Job No</th><th>Job Description</th>
                    <th>Comments</th><th>Duration</th>
                  </tr>
                </thead>
                <tbody>
                  {entries.length === 0 ? (
                    <tr>
                      <td colSpan={7}>
                        <div className="empty-wrap">
                          <div className="empty-circle">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0ea572" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                              <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                            </svg>
                          </div>
                          <p>No entries yet</p>
                          <span>Start a task to begin tracking your time</span>
                        </div>
                      </td>
                    </tr>
                  ) : entries.map((e, i) => (
                    <tr key={i} className="new-row" style={{ animationDelay: `${i * 0.04}s` }}>
                      <td className="mono">{e.start}</td>
                      <td className="mono">{e.end}</td>
                      <td><StatusBadge status={e.status} /></td>
                      <td className="job-no">{e.jobNo}</td>
                      <td className="truncate">{e.jobDesc}</td>
                      <td className="truncate muted">{e.comments}</td>
                      <td className="mono">{hm(e.duration)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* ── TOTALS ── */}
          <div className="totals-row">
            <TotalCard label="Work Total"  secs={totalWorkSecs}                   variant="work" />
            <TotalCard label="Break Total" secs={totalBreakSecs}                  variant="brk" />
            <TotalCard label="Grand Total" secs={totalWorkSecs + totalBreakSecs}  variant="grand" />
          </div>
        </div>
      </div>

      {/* Notification */}
      {notif && (
        <Notification key={notif.id} notif={notif} onDone={() => setNotif(null)} />
      )}
    </div>
  )
}
