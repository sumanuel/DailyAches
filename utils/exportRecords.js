// Turns records into files someone can open elsewhere (a spreadsheet, a PDF to
// show a doctor). Pure functions: writing and sharing the file is exportService.js.

import { normalizeText } from "./recordFilters";
import { getPeriodRange } from "./periodStats";

const pad2 = (n) => String(n).padStart(2, "0");

const MONTHS_ES = [
  "ene",
  "feb",
  "mar",
  "abr",
  "may",
  "jun",
  "jul",
  "ago",
  "sep",
  "oct",
  "nov",
  "dic",
];

export const CSV_HEADER = [
  "Fecha",
  "Hora",
  "Persona",
  "Parentesco",
  "Dolor",
  "Intensidad",
  "Notas",
];

const isoDate = (value) => {
  const d = new Date(value);
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
};

const clock = (value) => {
  const d = new Date(value);
  return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
};

const longDate = (value) => {
  const d = new Date(value);
  return `${pad2(d.getDate())} ${MONTHS_ES[d.getMonth()]} ${d.getFullYear()}`;
};

// Oldest first: it reads like a diary.
const chronological = (records) =>
  [...(records || [])].sort(
    (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
  );

// A cell that starts with = + - @ would be run as a formula by Excel or
// Sheets, so notes typed by anyone cannot execute anything.
const neutralizeFormula = (text) => (/^[=+\-@\t\r]/.test(text) ? `'${text}` : text);

const csvCell = (value) => {
  const text = neutralizeFormula(String(value ?? ""));
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
};

const relationshipOf = (record, people) =>
  (people || []).find((person) => person.id === record.personId)
    ?.relationship || "";

export const buildCsv = (records, people) => {
  const rows = chronological(records).map((record) => [
    isoDate(record.createdAt),
    clock(record.createdAt),
    record.personName,
    relationshipOf(record, people),
    record.pain,
    record.painLevel ?? "",
    record.notes,
  ]);
  const lines = [CSV_HEADER, ...rows].map((row) => row.map(csvCell).join(","));
  // The BOM makes Excel read the accents as UTF-8.
  return `﻿${lines.join("\r\n")}\r\n`;
};

const escapeHtml = (value) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const averageLevel = (records) => {
  const levels = records
    .map((record) => Number(record.painLevel))
    .filter((level) => Number.isFinite(level) && level > 0);
  if (levels.length === 0) return null;
  return Math.round((levels.reduce((sum, n) => sum + n, 0) / levels.length) * 10) / 10;
};

export const buildReportHtml = (
  records,
  people,
  { rangeLabel = "", personLabel = "Todas las personas", generatedAt = new Date() } = {},
) => {
  const sorted = chronological(records);
  const average = averageLevel(sorted);
  const rows = sorted
    .map(
      (record) => `<tr>
  <td>${escapeHtml(longDate(record.createdAt))}<br /><span class="muted">${escapeHtml(clock(record.createdAt))}</span></td>
  <td>${escapeHtml(record.personName)}<br /><span class="muted">${escapeHtml(relationshipOf(record, people))}</span></td>
  <td>${escapeHtml(record.pain)}</td>
  <td class="center">${escapeHtml(record.painLevel ?? "–")}</td>
  <td>${escapeHtml(record.notes)}</td>
</tr>`,
    )
    .join("\n");

  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="utf-8" />
<title>Historial de DailyAches</title>
<style>
  body { font-family: -apple-system, Helvetica, Arial, sans-serif; color: #2b2b2b; padding: 24px; }
  h1 { font-size: 22px; margin: 0 0 4px; }
  .muted { color: #777; font-size: 12px; }
  .summary { margin: 16px 0; font-size: 14px; }
  table { width: 100%; border-collapse: collapse; font-size: 13px; }
  th, td { text-align: left; padding: 8px; border-bottom: 1px solid #e3e3e3; vertical-align: top; }
  th { background: #f6f1ef; }
  .center { text-align: center; }
</style>
</head>
<body>
<h1>Historial de dolores</h1>
<div class="muted">${escapeHtml(personLabel)}${rangeLabel ? ` · ${escapeHtml(rangeLabel)}` : ""}</div>
<div class="summary">
  <strong>${sorted.length}</strong> ${sorted.length === 1 ? "registro" : "registros"}${
    average === null ? "" : ` · intensidad media <strong>${escapeHtml(String(average).replace(".", ","))}</strong> de 10`
  }
</div>
${
  sorted.length === 0
    ? "<p>No hay registros en este periodo.</p>"
    : `<table>
<thead><tr><th>Fecha</th><th>Persona</th><th>Dolor</th><th class="center">Intensidad</th><th>Notas</th></tr></thead>
<tbody>
${rows}
</tbody>
</table>`
}
<p class="muted">Generado con DailyAches el ${escapeHtml(longDate(generatedAt))}. Registro personal: no sustituye una valoración médica.</p>
</body>
</html>`;
};

const slug = (text) =>
  normalizeText(text)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

export const exportFileName = (extension, { personLabel, date = new Date() } = {}) => {
  const who = personLabel ? slug(personLabel) : "";
  return ["dailyaches", who, isoDate(date)].filter(Boolean).join("-") + `.${extension}`;
};

export const EXPORT_PERIODS = [
  { key: "month", label: "Este mes" },
  { key: "prev_month", label: "Mes anterior" },
  { key: "year", label: "Este año" },
  { key: "all", label: "Todo" },
];

// start/end are undefined for "all", which filterRecords reads as no limit.
export const getExportRange = (periodKey, now = new Date()) => {
  if (periodKey === "all") return { label: "Todo el historial" };
  if (periodKey === "prev_month") {
    const { start, end, label } = getPeriodRange("month", -1, now);
    return { start, end, label };
  }
  const { start, end, label } = getPeriodRange(
    periodKey === "year" ? "year" : "month",
    0,
    now,
  );
  return { start, end, label };
};
