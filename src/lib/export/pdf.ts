"use client";

import { jsPDF } from "jspdf";
import { autoTable } from "jspdf-autotable";

export function exportToPdf(
  filename: string,
  title: string,
  head: string[][],
  body: (string | number)[][]
) {
  const doc = new jsPDF();
  doc.setFontSize(14);
  doc.text(title, 14, 16);
  doc.setFontSize(9);
  doc.setTextColor(120);
  doc.text(new Date().toLocaleDateString("en-IN"), 14, 22);

  autoTable(doc, {
    head,
    body,
    startY: 28,
    headStyles: { fillColor: [29, 78, 216] },
    styles: { fontSize: 8 },
  });

  doc.save(`${filename}.pdf`);
}
