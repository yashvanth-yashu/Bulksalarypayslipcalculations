import jsPDF from "jspdf";

function n(val) {
  const v = Number(val);
  return isNaN(v) || v === 0 ? "0" : v.toLocaleString("en-IN");
}

export function generatePayslipPDF(emp, monthLabel, extra) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const PW = 210;
  const ml = 12, mr = 12;
  const CW = PW - ml - mr; // 186mm
  let y = 0;

  // ── ORANGE HEADER ─────────────────────────────────────────────────────────
  doc.setFillColor(234, 126, 34);
  doc.rect(0, 0, PW, 28, "F");

  // White corner triangles (diagonal cut effect)
  doc.setFillColor(255, 255, 255);
  doc.lines([[0, 10], [26, 0]], 0, 18, [1, 1], "F", true);
  doc.lines([[-26, 10], [26, 0]], 184, 18, [1, 1], "F", true);

  // Company name
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  doc.text("Origine Engineering Tech", PW / 2, 12, { align: "center" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.text("www.origineengtech.com", PW / 2, 19, { align: "center" });

  y = 34;

  // ── COMPANY TITLE ─────────────────────────────────────────────────────────
  doc.setTextColor(30, 30, 30);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text("Origine Engineering Tech Pvt Ltd", PW / 2, y, { align: "center" });
  y += 3;
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.3);
  doc.line(ml, y, PW - mr, y);
  y += 6;

  // ── EMPLOYEE INFO ─────────────────────────────────────────────────────────
  const c1 = 36, c2 = 52, c3 = 42, c4 = CW - c1 - c2 - c3;
  const RH = 7;
  const INFO_ROWS = [
    ["Employee Name",   emp.name || "",               "Bank Name",            extra.bankName || ""],
    ["Employee Code",   emp.empId || "",              "Account Number",       extra.accountNumber || ""],
    ["Designation",     extra.designation || "",       "Total number of Days", String(emp.totalDays || 0)],
    ["Date of Joining", extra.dateOfJoining || "",     "Payable Days",         String(emp.payableDays || 0)],
    ["Gross Pay",       n(emp.monthlyGross),            "OT Hours/Days",        String(extra.otHours || 0)],
  ];

  doc.setFontSize(8.5);
  INFO_ROWS.forEach(([l1, v1, l2, v2], i) => {
    const ry = y + i * RH;
    const x1 = ml, x2 = ml + c1, x3 = ml + c1 + c2, x4 = ml + c1 + c2 + c3;
    doc.setFillColor(246, 246, 246);
    doc.rect(x1, ry, c1, RH, "F");
    doc.rect(x3, ry, c3, RH, "F");
    doc.setDrawColor(185, 185, 185);
    doc.setLineWidth(0.25);
    [[x1, c1], [x2, c2], [x3, c3], [x4, c4]].forEach(([x, w]) => doc.rect(x, ry, w, RH));
    doc.setTextColor(30, 30, 30);
    doc.setFont("helvetica", "normal");
    doc.text(l1, x1 + 2, ry + 4.8);
    doc.text(v1, x2 + 2, ry + 4.8);
    doc.text(l2, x3 + 2, ry + 4.8);
    doc.text(v2, x4 + 2, ry + 4.8);
  });
  y += INFO_ROWS.length * RH + 6;

  // ── PAYSLIP MONTH BANNER ──────────────────────────────────────────────────
  doc.setFillColor(240, 240, 240);
  doc.setDrawColor(185, 185, 185);
  doc.rect(ml, y, CW, 8, "FD");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(30, 30, 30);
  doc.text(`Pay Slip For the Month : ${monthLabel}`, PW / 2, y + 5.5, { align: "center" });
  y += 10;

  // ── EARNINGS / DEDUCTIONS TABLE ───────────────────────────────────────────
  // col widths — total = 186mm
  const EA = 36, EA_A = 20;               // Earnings-A   = 56
  const EB = 28, EB_A = 14;               // Earnings-B   = 42
  const DC = 58, DC_A = CW - EA - EA_A - EB - EB_A - DC; // Deductions = 88

  const X = {
    ea:  ml,
    eaA: ml + EA,
    eb:  ml + EA + EA_A,
    ebA: ml + EA + EA_A + EB,
    dc:  ml + EA + EA_A + EB + EB_A,
    dcA: ml + EA + EA_A + EB + EB_A + DC,
  };

  // Column header
  const TH = 7;
  doc.setFillColor(210, 210, 210);
  [[X.ea, EA + EA_A], [X.eb, EB + EB_A], [X.dc, DC + DC_A]].forEach(([x, w]) =>
    doc.rect(x, y, w, TH, "FD")
  );
  doc.setDrawColor(160, 160, 160);
  [X.eaA, X.ebA, X.dcA].forEach((x) => doc.line(x, y, x, y + TH));

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(30, 30, 30);
  [["Earnings -A", X.ea, EA + EA_A], ["Earnings -B", X.eb, EB + EB_A], ["Deductions -C", X.dc, DC + DC_A]].forEach(
    ([label, x, w]) => doc.text(label, x + w / 2, y + 5, { align: "center" })
  );
  doc.setFontSize(7.5);
  [[X.eaA, EA_A], [X.ebA, EB_A], [X.dcA, DC_A]].forEach(([x, w]) =>
    doc.text("Amount", x + w / 2, y + 5, { align: "center" })
  );
  y += TH;

  // Table data
  const EAR = [
    ["Basic",              n(emp.basic)],
    ["HRA",                n(emp.hra)],
    ["Food Allowance",     n(emp.foodAllowance)],
    ["Dearness Allowance", n(emp.da)],
    ["Special Allowance",  n(emp.specialAllowance)],
    ["Others",             ""],
  ];
  const EBR = [
    ["Overtime",       "0"],
    ["Arrears",        "0"],
    ["Shift Allowance","0"],
  ];
  const DCR = [
    ["PF Employee & Employer", n(emp.pf)],
    ["Professional Tax",       n(emp.pt)],
    ["Insurance",              n(emp.insurance)],
    ["Bonus",                  n(emp.bonus)],
    ["Group Insurance",        n(emp.groupInsurance)],
    ["Workmen Compensation",   n(emp.workmenComp)],
    ["Deductions",             n(emp.otherDeductions)],
  ];

  const MAX_R = Math.max(EAR.length, EBR.length, DCR.length);
  const DR = 6.5;

  for (let i = 0; i < MAX_R; i++) {
    const ry = y + i * DR;
    const [la, va] = EAR[i] || ["", ""];
    const [lb, vb] = EBR[i] || ["", ""];
    const [lc, vc] = DCR[i] || ["", ""];

    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.2);
    [[X.ea, EA], [X.eaA, EA_A], [X.eb, EB], [X.ebA, EB_A], [X.dc, DC], [X.dcA, DC_A]].forEach(
      ([x, w]) => doc.rect(x, ry, w, DR)
    );
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(30, 30, 30);
    doc.text(la, X.ea  + 2, ry + 4.2);
    if (va) doc.text(va, X.eaA + EA_A - 2, ry + 4.2, { align: "right" });
    doc.text(lb, X.eb  + 2, ry + 4.2);
    if (vb) doc.text(vb, X.ebA + EB_A - 2, ry + 4.2, { align: "right" });
    doc.text(lc, X.dc  + 2, ry + 4.2);
    if (vc) doc.text(vc, X.dcA + DC_A - 2, ry + 4.2, { align: "right" });
  }
  y += MAX_R * DR;

  // ── TOTALS ROW ────────────────────────────────────────────────────────────
  const TOT_H = 7;
  doc.setFillColor(230, 230, 230);
  doc.setDrawColor(180, 180, 180);
  [[X.ea, EA + EA_A], [X.eb, EB + EB_A], [X.dc, DC + DC_A]].forEach(([x, w]) =>
    doc.rect(x, y, w, TOT_H, "FD")
  );
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(30, 30, 30);
  doc.text("Total",            X.ea  + 2,           y + 5);
  doc.text(n(emp.earnedGross), X.eaA + EA_A - 2,   y + 5, { align: "right" });
  doc.text("0",                X.ebA + EB_A - 2,   y + 5, { align: "right" });
  doc.text("Total Deductions", X.dc  + 2,           y + 5);
  doc.text(n(emp.totalDeductions), X.dcA + DC_A - 2, y + 5, { align: "right" });
  y += TOT_H;

  // ── NET PAY ROW ───────────────────────────────────────────────────────────
  const NET_H = 9;
  doc.setDrawColor(180, 180, 180);
  doc.rect(X.ea, y, EA + EA_A + EB + EB_A, NET_H);
  doc.setFillColor(245, 245, 245);
  doc.rect(X.dc,  y, DC,   NET_H, "FD");
  doc.setFillColor(255, 255, 255);
  doc.rect(X.dcA, y, DC_A, NET_H, "FD");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(30, 30, 30);
  doc.text("NET PAY", X.dc + DC / 2, y + 6.2, { align: "center" });
  doc.setFontSize(12);
  doc.text(n(emp.netPay), X.dcA + DC_A - 2, y + 6.5, { align: "right" });
  y += NET_H + 12;

  // ── FOOTER ────────────────────────────────────────────────────────────────
  doc.setFont("helvetica", "bolditalic");
  doc.setFontSize(8.5);
  doc.setTextColor(80, 80, 80);
  doc.text(
    "This is a Computer Generated Document. No Signature is required",
    PW / 2, y, { align: "center" }
  );

  doc.save(`Payslip_${emp.empId}_${monthLabel.replace(/\s+/g, "_")}.pdf`);
}
