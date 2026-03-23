import { useState, useCallback, useEffect, useRef } from "react";
import * as XLSX from "xlsx";
import PayslipModal from "./PayslipModal";
import "./SalarySheet.css";

// ─── Formula Engine ───────────────────────────────────────────────────────────
const round   = (n) => Math.round(n);
const roundUp = (n) => Math.ceil(n);

function calculate(row) {
  const totalDays       = Number(row.totalDays)       || 0;
  const payableDays     = Number(row.payableDays)     || 0;
  const monthlyGross    = Number(row.monthlyGross)    || 0;
  const foodAllowance   = Number(row.foodAllowance)   || 0;
  const insurance       = Number(row.insurance)       || 0;
  const bonus           = Number(row.bonus)           || 0;
  const groupInsurance  = Number(row.groupInsurance)  || 0;
  const workmenComp     = Number(row.workmenComp)     || 0;
  const otherDeductions = Number(row.otherDeductions) || 0;

  const earnedGross      = totalDays > 0 ? round((monthlyGross / totalDays) * payableDays) : 0;
  const basic            = round(earnedGross * 0.4);
  const hra              = round(basic * 0.4);
  const da               = round(basic * 0.4);
  const specialAllowance = roundUp(earnedGross - (basic + hra + foodAllowance + da));
  const pf               = roundUp(Math.min(basic, 15000) * 0.12 * 2);
  const pt               = monthlyGross <= 15000 ? 0 : monthlyGross <= 20000 ? 150 : 200;
  const totalDeductions  = roundUp(pf + pt + insurance + bonus + groupInsurance + workmenComp + otherDeductions);
  const netPay           = roundUp(earnedGross - totalDeductions);

  return { earnedGross, basic, hra, da, specialAllowance, pf, pt, totalDeductions, netPay };
}

// ─── Seed data ────────────────────────────────────────────────────────────────
const SEED = [
  { id:1,  empId:"EMP1002", name:"Employee 1",  totalDays:31, payableDays:31, monthlyGross:180600, foodAllowance:1048, insurance:0, bonus:3000, groupInsurance:1400, workmenComp:1000, otherDeductions:0 },
  { id:2,  empId:"EMP1003", name:"Employee 2",  totalDays:31, payableDays:13, monthlyGross:180600, foodAllowance:1048, insurance:0, bonus:3000, groupInsurance:1400, workmenComp:1000, otherDeductions:0 },
  { id:3,  empId:"EMP1004", name:"Employee 3",  totalDays:31, payableDays:31, monthlyGross:15000,  foodAllowance:1048, insurance:0, bonus:3000, groupInsurance:1400, workmenComp:1000, otherDeductions:0 },
  { id:4,  empId:"EMP1005", name:"Employee 4",  totalDays:31, payableDays:20, monthlyGross:55000,  foodAllowance:1048, insurance:0, bonus:3000, groupInsurance:1400, workmenComp:1000, otherDeductions:0 },
  { id:5,  empId:"EMP1006", name:"Employee 5",  totalDays:31, payableDays:21, monthlyGross:60000,  foodAllowance:1048, insurance:0, bonus:3000, groupInsurance:1400, workmenComp:1000, otherDeductions:0 },
  { id:6,  empId:"EMP1007", name:"Employee 6",  totalDays:31, payableDays:22, monthlyGross:65000,  foodAllowance:1048, insurance:0, bonus:3000, groupInsurance:1400, workmenComp:1000, otherDeductions:0 },
  { id:7,  empId:"EMP1008", name:"Employee 7",  totalDays:31, payableDays:23, monthlyGross:70000,  foodAllowance:1048, insurance:0, bonus:3000, groupInsurance:1400, workmenComp:1000, otherDeductions:0 },
  { id:8,  empId:"EMP1009", name:"Employee 8",  totalDays:31, payableDays:24, monthlyGross:75000,  foodAllowance:1048, insurance:0, bonus:3000, groupInsurance:1400, workmenComp:1000, otherDeductions:0 },
  { id:9,  empId:"EMP1010", name:"Employee 9",  totalDays:31, payableDays:25, monthlyGross:80000,  foodAllowance:1048, insurance:0, bonus:3000, groupInsurance:1400, workmenComp:1000, otherDeductions:0 },
  { id:10, empId:"EMP1011", name:"Employee 10", totalDays:31, payableDays:26, monthlyGross:85000,  foodAllowance:1048, insurance:0, bonus:3000, groupInsurance:1400, workmenComp:1000, otherDeductions:0 },
  { id:11, empId:"EMP1012", name:"Employee 11", totalDays:31, payableDays:27, monthlyGross:90000,  foodAllowance:1048, insurance:0, bonus:3000, groupInsurance:1400, workmenComp:1000, otherDeductions:0 },
  { id:12, empId:"EMP1013", name:"Employee 12", totalDays:31, payableDays:28, monthlyGross:95000,  foodAllowance:1048, insurance:0, bonus:3000, groupInsurance:1400, workmenComp:1000, otherDeductions:0 },
  { id:13, empId:"EMP1014", name:"Employee 13", totalDays:31, payableDays:29, monthlyGross:100000, foodAllowance:1048, insurance:0, bonus:3000, groupInsurance:1400, workmenComp:1000, otherDeductions:0 },
  { id:14, empId:"EMP1015", name:"Employee 14", totalDays:31, payableDays:30, monthlyGross:105000, foodAllowance:1048, insurance:0, bonus:3000, groupInsurance:1400, workmenComp:1000, otherDeductions:0 },
  { id:15, empId:"EMP1016", name:"Employee 15", totalDays:31, payableDays:15, monthlyGross:110000, foodAllowance:1048, insurance:0, bonus:3000, groupInsurance:1400, workmenComp:1000, otherDeductions:0 },
];

// Import column map
const HEADER_MAP = {
  "emp id":"empId","empid":"empId","employee id":"empId",
  "name":"name","employee name":"name",
  "total days":"totalDays","totaldays":"totalDays",
  "payable days":"payableDays","payabledays":"payableDays",
  "monthly gross":"monthlyGross","monthlygross":"monthlyGross","gross":"monthlyGross",
  "food allowance":"foodAllowance","food":"foodAllowance",
  "insurance":"insurance","bonus":"bonus",
  "group insurance":"groupInsurance",
  "workmen compensation":"workmenComp","workmen comp":"workmenComp","workmencomp":"workmenComp",
  "other deductions":"otherDeductions","otherdeductions":"otherDeductions",
};

const LS_ROWS   = "payroll_rows";
const LS_NEXTID = "payroll_nextid";
const LS_THEME  = "payroll_theme";

const loadRows   = () => { try { const s=localStorage.getItem(LS_ROWS);   return s?JSON.parse(s):SEED; } catch { return SEED; } };
const loadNextId = () => { try { const s=localStorage.getItem(LS_NEXTID); return s?Number(s):SEED.length+1; } catch { return SEED.length+1; } };
const loadTheme  = () => { try { const s=localStorage.getItem(LS_THEME);  return s!==null?s==="dark":true; } catch { return true; } };

const fmt = (n) => (n===undefined||n===null||isNaN(n) ? "—" : n.toLocaleString("en-IN"));

// ─── Icons ────────────────────────────────────────────────────────────────────
const SUN  = () => (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>);
const MOON = () => (<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>);
const IconImport   = () => (<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>);
const IconExport   = () => (<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>);
const IconPayslip  = () => (<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>);
const IconReset    = () => (<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-4.95"/></svg>);
const IconPlus     = () => (<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>);

// ─── Cells ────────────────────────────────────────────────────────────────────
function EditCell({ value, field, rowId, onChange, type, width }) {
  return (
    <td className="cell cell--input" style={{ minWidth: width }}>
      <input
        className={`cell-input${type==="number"?" cell-input--num":""}`}
        type={type} value={value??""} spellCheck={false}
        onChange={(e)=>onChange(rowId,field,e.target.value)}
      />
    </td>
  );
}
function CalcCell({ value, isHighlight }) {
  return <td className={`cell cell--calc${isHighlight?" cell--highlight":""}`}>{fmt(value)}</td>;
}

function Toast({ msg, type, onDone }) {
  useEffect(() => { const t=setTimeout(onDone,3000); return ()=>clearTimeout(t); }, [onDone]);
  return <div className={`toast toast--${type||"info"}`}>{msg}</div>;
}

// ═════════════════════════════════════════════════════════════════════════════
// MAIN
// ═════════════════════════════════════════════════════════════════════════════
export default function SalarySheet({ user, onLogout }) {
  const [dark,       setDark]       = useState(loadTheme);
  const [rows,       setRows]       = useState(loadRows);
  const [nextId,     setNextId]     = useState(loadNextId);
  const [activeTab,  setActiveTab]  = useState("earnings");
  const [search,     setSearch]     = useState("");
  const [toast,      setToast]      = useState(null);
  const [importing,  setImporting]  = useState(false);
  const [showPayslip,setShowPayslip]= useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => { try{localStorage.setItem(LS_ROWS,   JSON.stringify(rows));}catch{} }, [rows]);
  useEffect(() => { try{localStorage.setItem(LS_NEXTID, String(nextId));}      catch{} }, [nextId]);
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", dark?"dark":"light");
    try{localStorage.setItem(LS_THEME,dark?"dark":"light");}catch{}
  }, [dark]);

  const notify = (msg, type="success") => setToast({ msg, type });

  const handleChange = useCallback((rowId, field, rawVal) => {
    setRows((prev) => prev.map((r) =>
      r.id===rowId ? { ...r, [field]: field==="empId"||field==="name" ? rawVal : rawVal===""?"":Number(rawVal) } : r
    ));
  }, []);

  const addRow = () => {
    setRows((p)=>[...p,{ id:nextId, empId:`EMP${1000+nextId}`, name:"", totalDays:31, payableDays:31, monthlyGross:0, foodAllowance:1048, insurance:0, bonus:3000, groupInsurance:1400, workmenComp:1000, otherDeductions:0 }]);
    setNextId((n)=>n+1); notify("Employee added & saved ✓");
  };
  const deleteRow = (id) => { setRows((p)=>p.filter((r)=>r.id!==id)); notify("Employee removed ✓"); };
  const resetAll  = () => {
    if(!window.confirm("Reset all data to defaults?")) return;
    setRows(SEED); setNextId(SEED.length+1); notify("Data reset ✓");
  };

  // ── IMPORT ────────────────────────────────────────────────────────────────
  const handleImport = (e) => {
    const file = e.target.files?.[0]; if(!file) return;
    e.target.value=""; setImporting(true);
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const wb   = XLSX.read(evt.target.result, { type:"array" });
        const ws   = wb.Sheets[wb.SheetNames[0]];
        const raw  = XLSX.utils.sheet_to_json(ws,{ header:1, defval:"" });
        if(raw.length<2){ notify("No data rows found","error"); setImporting(false); return; }
        const headers  = raw[0].map((h)=>String(h).toLowerCase().trim().replace(/\s+/g," "));
        const fieldMap = headers.map((h)=>HEADER_MAP[h]||null);
        let idCounter  = nextId;
        const imported = [];
        for(let i=1;i<raw.length;i++){
          const dr=raw[i];
          if(dr.every((v)=>v===""||v===null||v===undefined)) continue;
          const obj={ id:idCounter++, empId:"", name:"", totalDays:31, payableDays:31, monthlyGross:0, foodAllowance:1048, insurance:0, bonus:3000, groupInsurance:1400, workmenComp:1000, otherDeductions:0 };
          fieldMap.forEach((field,ci)=>{ if(!field) return; const val=dr[ci]; obj[field]=field==="empId"||field==="name"?String(val??""):isNaN(Number(val))?0:Number(val); });
          imported.push(obj);
        }
        if(!imported.length){ notify("No valid rows found","error"); setImporting(false); return; }
        setRows(imported); setNextId(idCounter);
        notify(`Imported ${imported.length} employees from "${file.name}" ✓`);
      } catch(err) { console.error(err); notify("Failed to read file","error"); }
      setImporting(false);
    };
    reader.onerror=()=>{ notify("File read error","error"); setImporting(false); };
    reader.readAsArrayBuffer(file);
  };

  // ── EXPORT ────────────────────────────────────────────────────────────────
  const handleExport = () => {
    const data = rows.map((r)=>{ const c=calculate(r); return {
      "Emp ID":r.empId,"Name":r.name,"Total Days":r.totalDays,"Payable Days":r.payableDays,
      "Monthly Gross":r.monthlyGross,"Earned Gross":c.earnedGross,"Basic (40%)":c.basic,
      "HRA (40% on Basic)":c.hra,"Food Allowance":r.foodAllowance,"Dearness Allowance":c.da,
      "Special Allowance":c.specialAllowance,"PF":c.pf,"Prof. Tax":c.pt,
      "Insurance":r.insurance,"Bonus":r.bonus,"Group Insurance":r.groupInsurance,
      "Workmen Compensation":r.workmenComp,"Other Deductions":r.otherDeductions,
      "Total Deductions":c.totalDeductions,"Net Pay":c.netPay,
    };});
    const ws=XLSX.utils.json_to_sheet(data);
    ws["!cols"]=[{wch:10},{wch:16},{wch:11},{wch:13},{wch:14},{wch:13},{wch:12},{wch:18},{wch:14},{wch:18},{wch:17},{wch:8},{wch:10},{wch:10},{wch:8},{wch:16},{wch:20},{wch:16},{wch:16},{wch:10}];
    const wb=XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb,ws,"SalarySheet");
    XLSX.writeFile(wb,`Salary_Sheet_${new Date().toISOString().slice(0,10)}.xlsx`);
    notify(`Exported ${rows.length} employees ✓`);
  };

  // ── Computed + filter ─────────────────────────────────────────────────────
  const computed = rows.map((r)=>({ ...r, ...calculate(r) }));
  const filtered = computed.filter((r)=>
    !search || r.empId.toLowerCase().includes(search.toLowerCase()) || r.name.toLowerCase().includes(search.toLowerCase())
  );
  const SUM_KEYS=["monthlyGross","earnedGross","basic","hra","da","specialAllowance","pf","pt","insurance","bonus","groupInsurance","workmenComp","otherDeductions","totalDeductions","netPay","foodAllowance"];
  const totals=computed.reduce((acc,r)=>{ SUM_KEYS.forEach((k)=>{ acc[k]=(acc[k]||0)+(Number(r[k])||0); }); return acc; },{});

  return (
    <div className="ss-root">
      {toast && <Toast msg={toast.msg} type={toast.type} onDone={()=>setToast(null)}/>}
      <input ref={fileInputRef} type="file" accept=".xlsx,.xls,.csv" style={{display:"none"}} onChange={handleImport}/>

      {/* Payslip modal */}
      {showPayslip && (
        <PayslipModal employees={computed} onClose={()=>setShowPayslip(false)}/>
      )}

      {/* ── Header ── */}
      <header className="ss-header">
        <div className="ss-header__left">
          <div className="ss-logo"><span>₹</span></div>
          <div>
            <h1 className="ss-title">Salary Calculator</h1>
            <p className="ss-subtitle">{rows.length} employees · {user?.username}</p>
          </div>
        </div>
        <div className="ss-header__center">
          <div className="search-box">
            <svg className="search-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input className="search-input" placeholder="Search by ID or name…" value={search} onChange={(e)=>setSearch(e.target.value)}/>
            {search && <button className="search-clear" onClick={()=>setSearch("")}>×</button>}
          </div>
        </div>
        <div className="ss-header__right">
          <button className="theme-btn" onClick={()=>setDark((d)=>!d)}>
            <span className="theme-btn__icon">{dark?<SUN/>:<MOON/>}</span>
            <span className="theme-btn__label">{dark?"Light":"Dark"}</span>
          </button>
           <button className="logout-btn" onClick={onLogout} title="Sign out">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2.2"
            strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            <span>Logout</span>
           </button>
          <div className="stat-card">
            <span className="stat-label">Total Gross</span>
            <span className="stat-value">₹{fmt(totals.monthlyGross)}</span>
          </div>
          <div className="stat-card stat-card--green">
            <span className="stat-label">Total Net Pay</span>
            <span className="stat-value stat-value--green">₹{fmt(totals.netPay)}</span>
          </div>
        </div>
      </header>

      {/* ── Toolbar ── */}
      <div className="ss-toolbar">
        <div className="toolbar-tabs">
          <button className={`ss-tab${activeTab==="earnings"?" ss-tab--active":""}`} onClick={()=>setActiveTab("earnings")}>Earnings Breakdown</button>
          <button className={`ss-tab${activeTab==="deductions"?" ss-tab--active":""}`} onClick={()=>setActiveTab("deductions")}>Deductions &amp; Net Pay</button>
        </div>
        <div className="toolbar-actions">
          <button className="action-btn action-btn--import" onClick={()=>fileInputRef.current?.click()} disabled={importing} title="Import Excel / CSV">
            <IconImport/><span>{importing?"Importing…":"Import Excel"}</span>
          </button>
          <button className="action-btn action-btn--export" onClick={handleExport} title="Export to Excel">
            <IconExport/><span>Export Excel</span>
          </button>

          {/* ── GENERATE PAYSLIP BUTTON ── */}
          <button className="action-btn action-btn--payslip" onClick={()=>setShowPayslip(true)} title="Generate employee pay slip PDF">
            <IconPayslip/><span>Generate Payslip</span>
          </button>

          <div className="toolbar-divider"/>
          <button className="action-btn action-btn--reset" onClick={resetAll} title="Reset to defaults"><IconReset/><span>Reset</span></button>
          <button className="action-btn action-btn--add"   onClick={addRow}><IconPlus/><span>Add Employee</span></button>
        </div>
      </div>

      <div className="import-hint">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        Import accepts <strong>.xlsx / .xls / .csv</strong> — columns: <em>Emp ID, Name, Total Days, Payable Days, Monthly Gross, Food Allowance, Insurance, Bonus, Group Insurance, Workmen Comp, Other Deductions</em>
      </div>

      {/* ── Grid ── */}
      <div className="grid-wrap">
        {activeTab==="earnings"
          ? <EarningsGrid   rows={filtered} totals={totals} onDelete={deleteRow} onChange={handleChange}/>
          : <DeductionsGrid rows={filtered} totals={totals} onDelete={deleteRow} onChange={handleChange}/>
        }
        {filtered.length===0&&search&&<div className="empty-state">No employees match "<strong>{search}</strong>"</div>}
      </div>

      <div className="legend">
        <span className="legend-item legend-item--input">Editable input</span>
        <span className="legend-item legend-item--calc">Auto-calculated</span>
        <span className="legend-item legend-item--net">Net Pay</span>
        <span className="legend-count">{filtered.length} of {rows.length} shown · data saved locally</span>
      </div>
    </div>
  );
}

// ─── Earnings Grid ────────────────────────────────────────────────────────────
function EarningsGrid({ rows, totals, onDelete, onChange }) {
  return (
    <table className="ss-table">
      <thead>
        <tr className="thead-group">
          <th colSpan={2} className="tg tg--input">Employee</th>
          <th colSpan={3} className="tg tg--input">Attendance</th>
          <th colSpan={5} className="tg tg--calc">Earnings (Auto-calculated)</th>
          <th className="th-del" rowSpan={2}/>
        </tr>
        <tr className="thead-cols">
          <th className="th th--input">Emp ID</th><th className="th th--input">Name</th>
          <th className="th th--input">Total Days</th><th className="th th--input">Payable Days</th>
          <th className="th th--input">Monthly Gross</th>
          <th className="th th--calc">Earned Gross</th><th className="th th--calc">Basic (40%)</th>
          <th className="th th--calc">HRA</th><th className="th th--calc">DA</th>
          <th className="th th--calc">Special Allow.</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r)=>(
          <tr key={r.id} className="ss-row">
            <EditCell value={r.empId}        field="empId"        rowId={r.id} onChange={onChange} type="text"   width={100}/>
            <EditCell value={r.name}         field="name"         rowId={r.id} onChange={onChange} type="text"   width={128}/>
            <EditCell value={r.totalDays}    field="totalDays"    rowId={r.id} onChange={onChange} type="number" width={76}/>
            <EditCell value={r.payableDays}  field="payableDays"  rowId={r.id} onChange={onChange} type="number" width={88}/>
            <EditCell value={r.monthlyGross} field="monthlyGross" rowId={r.id} onChange={onChange} type="number" width={108}/>
            <CalcCell value={r.earnedGross}/><CalcCell value={r.basic}/><CalcCell value={r.hra}/>
            <CalcCell value={r.da}/><CalcCell value={r.specialAllowance}/>
            <td className="cell cell--del"><button className="btn-del" onClick={()=>onDelete(r.id)}>×</button></td>
          </tr>
        ))}
      </tbody>
      <tfoot>
        <tr className="tfoot-row">
          <td colSpan={2} className="tf-label">TOTALS</td>
          <td className="tf-cell"/><td className="tf-cell"/>
          <td className="tf-cell">{fmt(totals.monthlyGross)}</td>
          <td className="tf-cell">{fmt(totals.earnedGross)}</td>
          <td className="tf-cell">{fmt(totals.basic)}</td>
          <td className="tf-cell">{fmt(totals.hra)}</td>
          <td className="tf-cell">{fmt(totals.da)}</td>
          <td className="tf-cell">{fmt(totals.specialAllowance)}</td>
          <td className="tf-cell"/>
        </tr>
      </tfoot>
    </table>
  );
}

// ─── Deductions Grid ──────────────────────────────────────────────────────────
function DeductionsGrid({ rows, totals, onDelete, onChange }) {
  return (
    <table className="ss-table">
      <thead>
        <tr className="thead-group">
          <th colSpan={2} className="tg tg--input">Employee</th>
          <th colSpan={1} className="tg tg--calc">Earnings</th>
          <th colSpan={2} className="tg tg--calc">Statutory (Auto)</th>
          <th colSpan={5} className="tg tg--input">Fixed Deductions</th>
          <th colSpan={2} className="tg tg--net">Summary</th>
          <th className="th-del" rowSpan={2}/>
        </tr>
        <tr className="thead-cols">
          <th className="th th--input">Emp ID</th><th className="th th--input">Name</th>
          <th className="th th--calc">Earned Gross</th>
          <th className="th th--calc">PF</th><th className="th th--calc">Prof. Tax</th>
          <th className="th th--input">Insurance</th><th className="th th--input">Bonus</th>
          <th className="th th--input">Group Ins.</th><th className="th th--input">Workmen Comp</th>
          <th className="th th--input">Other Ded.</th>
          <th className="th th--calc">Total Ded.</th><th className="th th--net">Net Pay</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r)=>(
          <tr key={r.id} className="ss-row">
            <td className="cell cell--static">{r.empId}</td>
            <td className="cell cell--static">{r.name||"—"}</td>
            <CalcCell value={r.earnedGross}/><CalcCell value={r.pf}/><CalcCell value={r.pt}/>
            <EditCell value={r.insurance}       field="insurance"       rowId={r.id} onChange={onChange} type="number" width={88}/>
            <EditCell value={r.bonus}           field="bonus"           rowId={r.id} onChange={onChange} type="number" width={76}/>
            <EditCell value={r.groupInsurance}  field="groupInsurance"  rowId={r.id} onChange={onChange} type="number" width={100}/>
            <EditCell value={r.workmenComp}     field="workmenComp"     rowId={r.id} onChange={onChange} type="number" width={100}/>
            <EditCell value={r.otherDeductions} field="otherDeductions" rowId={r.id} onChange={onChange} type="number" width={108}/>
            <CalcCell value={r.totalDeductions}/>
            <CalcCell value={r.netPay} isHighlight/>
            <td className="cell cell--del"><button className="btn-del" onClick={()=>onDelete(r.id)}>×</button></td>
          </tr>
        ))}
      </tbody>
      <tfoot>
        <tr className="tfoot-row">
          <td colSpan={2} className="tf-label">TOTALS</td>
          <td className="tf-cell">{fmt(totals.earnedGross)}</td>
          <td className="tf-cell">{fmt(totals.pf)}</td>
          <td className="tf-cell">{fmt(totals.pt)}</td>
          <td className="tf-cell">{fmt(totals.insurance)}</td>
          <td className="tf-cell">{fmt(totals.bonus)}</td>
          <td className="tf-cell">{fmt(totals.groupInsurance)}</td>
          <td className="tf-cell">{fmt(totals.workmenComp)}</td>
          <td className="tf-cell">{fmt(totals.otherDeductions)}</td>
          <td className="tf-cell">{fmt(totals.totalDeductions)}</td>
          <td className="tf-cell tf-cell--net">₹{fmt(totals.netPay)}</td>
          <td className="tf-cell"/>
        </tr>
      </tfoot>
    </table>
  );
}
