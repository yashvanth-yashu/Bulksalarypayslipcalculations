import { useState, useEffect } from "react";
import { generatePayslipPDF } from "./Payslippdf";
import "./PayslipModal.css";

const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];
const LS_EXTRA = "payroll_emp_extra";
const loadAllExtra = () => {
  try { return JSON.parse(localStorage.getItem(LS_EXTRA) || "{}"); } catch { return {}; }
};
const BLANK = { bankName:"", accountNumber:"", designation:"", dateOfJoining:"", otHours:0 };
const fmtINR = (v) => (Number(v) || 0).toLocaleString("en-IN");

export default function PayslipModal({ employees, onClose }) {
  const [empId,    setEmpId]    = useState(employees[0]?.empId || "");
  const [month,    setMonth]    = useState(new Date().getMonth());
  const [year,     setYear]     = useState(new Date().getFullYear());
  const [allExtra, setAllExtra] = useState(loadAllExtra);
  const [extra,    setExtra]    = useState({ ...BLANK });
  const [busy,     setBusy]     = useState(false);

  const emp = employees.find((e) => e.empId === empId);

  useEffect(() => {
    setExtra({ ...BLANK, ...(allExtra[empId] || {}) });
  }, [empId]);

  const onField = (k, v) => {
    const updated = { ...extra, [k]: v };
    setExtra(updated);
    const ua = { ...allExtra, [empId]: updated };
    setAllExtra(ua);
    try { localStorage.setItem(LS_EXTRA, JSON.stringify(ua)); } catch {}
  };

  const handleGenerate = () => {
    if (!emp || busy) return;
    setBusy(true);
    setTimeout(() => {
      try { generatePayslipPDF(emp, `${MONTHS[month]} ${year}`, extra); }
      catch (e) { alert("PDF error: " + e.message); }
      setBusy(false);
    }, 60);
  };

  const years = Array.from({ length: 6 }, (_, i) => new Date().getFullYear() - 2 + i);

  return (
    <div className="ps-overlay" onClick={onClose}>
      <div className="ps-modal" onClick={(e) => e.stopPropagation()}>

        {/* ── MODAL HEADER ── */}
        <div className="ps-mhd">
          <div className="ps-mhd__left">
            <div className="ps-mhd__icon">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
              </svg>
            </div>
            <div>
              <h2 className="ps-mhd__title">Generate Pay Slip</h2>
              <p className="ps-mhd__sub">Select employee &amp; pay period, then download PDF</p>
            </div>
          </div>
          <button className="ps-mhd__close" onClick={onClose}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* ── BODY ── */}
        <div className="ps-body">

          {/* Employee + Period */}
          <div className="ps-sec">
            <p className="ps-sec__label">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>
              Employee &amp; Pay Period
            </p>
            <div className="ps-row">
              <div className="ps-f ps-f--grow">
                <label>Employee</label>
                <select value={empId} onChange={(e) => setEmpId(e.target.value)}>
                  {employees.map((e) => (
                    <option key={e.empId} value={e.empId}>
                      {e.empId}{e.name ? `  —  ${e.name}` : ""}
                    </option>
                  ))}
                </select>
              </div>
              <div className="ps-f">
                <label>Month</label>
                <select value={month} onChange={(e) => setMonth(Number(e.target.value))}>
                  {MONTHS.map((m, i) => <option key={m} value={i}>{m}</option>)}
                </select>
              </div>
              <div className="ps-f ps-f--xs">
                <label>Year</label>
                <select value={year} onChange={(e) => setYear(Number(e.target.value))}>
                  {years.map((yr) => <option key={yr} value={yr}>{yr}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Live summary */}
          {emp && (
            <div className="ps-summary">
              <div className="ps-summary__kv">
                <span>Monthly Gross</span>
                <span>₹{fmtINR(emp.monthlyGross)}</span>
              </div>
              <div className="ps-summary__kv">
                <span>Earned Gross</span>
                <span>₹{fmtINR(emp.earnedGross)}</span>
              </div>
              <div className="ps-summary__kv">
                <span>Basic / HRA / DA</span>
                <span>₹{fmtINR(emp.basic)} / ₹{fmtINR(emp.hra)} / ₹{fmtINR(emp.da)}</span>
              </div>
              <div className="ps-summary__kv">
                <span>Total Deductions</span>
                <span className="ps-summary__red">₹{fmtINR(emp.totalDeductions)}</span>
              </div>
              <div className="ps-summary__kv ps-summary__kv--net">
                <span>Net Pay</span>
                <span className="ps-summary__green">₹{fmtINR(emp.netPay)}</span>
              </div>
            </div>
          )}

          {/* Extra fields */}
          <div className="ps-sec">
            <p className="ps-sec__label">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
              Additional Details
              <span className="ps-sec__hint">— saved per employee</span>
            </p>
            <div className="ps-row">
              <div className="ps-f">
                <label>Bank Name</label>
                <input value={extra.bankName || ""} onChange={(e) => onField("bankName", e.target.value)} placeholder="e.g. ICICI BANK"/>
              </div>
              <div className="ps-f">
                <label>Account Number</label>
                <input value={extra.accountNumber || ""} onChange={(e) => onField("accountNumber", e.target.value)} placeholder="e.g. 002001604959"/>
              </div>
            </div>
            <div className="ps-row">
              <div className="ps-f">
                <label>Designation</label>
                <input value={extra.designation || ""} onChange={(e) => onField("designation", e.target.value)} placeholder="e.g. E3D Structural Designer"/>
              </div>
              <div className="ps-f">
                <label>Date of Joining</label>
                <input value={extra.dateOfJoining || ""} onChange={(e) => onField("dateOfJoining", e.target.value)} placeholder="e.g. 18-Dec-25"/>
              </div>
            </div>
            <div className="ps-row">
              <div className="ps-f ps-f--xs">
                <label>OT Hours / Days</label>
                <input type="number" min="0" value={extra.otHours ?? 0} onChange={(e) => onField("otHours", Number(e.target.value))}/>
              </div>
            </div>
          </div>

        </div>

        {/* ── FOOTER ── */}
        <div className="ps-mft">
          <span className="ps-mft__note">PDF will include all salary breakdown columns</span>
          <div className="ps-mft__btns">
            <button className="ps-btn ps-btn--cancel" onClick={onClose}>Cancel</button>
            <button className="ps-btn ps-btn--dl" onClick={handleGenerate} disabled={!emp || busy}>
              {busy ? (
                <><span className="ps-spin" /> Generating…</>
              ) : (
                <>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                    <polyline points="7 10 12 15 17 10"/>
                    <line x1="12" y1="15" x2="12" y2="3"/>
                  </svg>
                  Download PDF
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
