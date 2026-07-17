"use client";

import { jsPDF } from "jspdf";
import { autoTable } from "jspdf-autotable";

export interface ReceiptDetails {
  schoolName: string;
  schoolAddress?: string;
  documentTitle: string;
  documentNumber: string;
  date: string;
  billedTo: { label: string; value: string }[];
  lineItems: { label: string; amount: number }[];
  totalLabel?: string;
  footerNote?: string;
}

/** Formatted single-document receipt/invoice — not a table dump, a real printable document. */
export function exportReceiptPdf(filename: string, details: ReceiptDetails) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const marginX = 14;

  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text(details.schoolName, marginX, 18);
  doc.setFont("helvetica", "normal");
  if (details.schoolAddress) {
    doc.setFontSize(9);
    doc.setTextColor(120);
    doc.text(details.schoolAddress, marginX, 24);
    doc.setTextColor(0);
  }

  doc.setDrawColor(210);
  doc.line(marginX, 28, pageWidth - marginX, 28);

  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.text(details.documentTitle, marginX, 38);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(`No: ${details.documentNumber}`, pageWidth - marginX, 34, { align: "right" });
  doc.text(`Date: ${details.date}`, pageWidth - marginX, 40, { align: "right" });

  let y = 48;
  doc.setFontSize(10);
  for (const row of details.billedTo) {
    doc.setFont("helvetica", "bold");
    doc.text(`${row.label}:`, marginX, y);
    doc.setFont("helvetica", "normal");
    doc.text(row.value, marginX + 32, y);
    y += 6;
  }

  autoTable(doc, {
    startY: y + 4,
    head: [["Description", "Amount"]],
    body: details.lineItems.map((item) => [item.label, item.amount.toFixed(2)]),
    foot: [[details.totalLabel ?? "Total", details.lineItems.reduce((s, i) => s + i.amount, 0).toFixed(2)]],
    headStyles: { fillColor: [29, 78, 216] },
    footStyles: { fillColor: [241, 245, 249], textColor: 20, fontStyle: "bold" },
    styles: { fontSize: 9 },
    columnStyles: { 1: { halign: "right" } },
  });

  const finalY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY;
  if (details.footerNote) {
    doc.setFontSize(8);
    doc.setTextColor(120);
    doc.text(details.footerNote, marginX, finalY + 12);
  }

  doc.save(`${filename}.pdf`);
}

export interface CertificateDetails {
  schoolName: string;
  certificateTitle: string;
  recipientName: string;
  eventTitle: string;
  achievementLine?: string;
  date: string;
  issuedBy?: string;
}

/** A landscape, bordered certificate — not a table dump, a printable award document. */
export function exportCertificatePdf(filename: string, details: CertificateDetails) {
  const doc = new jsPDF({ orientation: "landscape" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const center = pageWidth / 2;

  doc.setDrawColor(29, 78, 216);
  doc.setLineWidth(1.5);
  doc.rect(8, 8, pageWidth - 16, pageHeight - 16);
  doc.setLineWidth(0.4);
  doc.rect(12, 12, pageWidth - 24, pageHeight - 24);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(90);
  doc.text(details.schoolName, center, 30, { align: "center" });

  doc.setFontSize(28);
  doc.setTextColor(29, 78, 216);
  doc.text(details.certificateTitle, center, 50, { align: "center" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);
  doc.setTextColor(90);
  doc.text("This certificate is proudly presented to", center, 68, { align: "center" });

  doc.setFont("helvetica", "bold");
  doc.setFontSize(24);
  doc.setTextColor(20);
  doc.text(details.recipientName, center, 84, { align: "center" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(13);
  doc.setTextColor(60);
  doc.text(details.achievementLine ?? `for participation in ${details.eventTitle}`, center, 98, {
    align: "center",
    maxWidth: pageWidth - 60,
  });

  doc.setFontSize(10);
  doc.setTextColor(120);
  doc.text(`Date: ${details.date}`, 24, pageHeight - 20);
  if (details.issuedBy) {
    doc.text(details.issuedBy, pageWidth - 24, pageHeight - 20, { align: "right" });
    doc.line(pageWidth - 70, pageHeight - 24, pageWidth - 24, pageHeight - 24);
  }

  doc.save(`${filename}.pdf`);
}

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
