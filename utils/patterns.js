// Simple, honest patterns in a set of records: which weekday, which part of the
// day and which pain come up most. It only reports a pattern when there are
// enough records and one option clearly stands out, and it words it as an
// observation, never as a diagnosis.

import { getPainTypeOptions } from "./recordFilters";

export const MIN_RECORDS_FOR_PATTERNS = 6;
const MIN_COUNT = 3;

const WEEKDAYS = [
  { label: "lunes", plural: "los lunes" },
  { label: "martes", plural: "los martes" },
  { label: "miércoles", plural: "los miércoles" },
  { label: "jueves", plural: "los jueves" },
  { label: "viernes", plural: "los viernes" },
  { label: "sábado", plural: "los sábados" },
  { label: "domingo", plural: "los domingos" },
];

// 0-5 madrugada, 6-11 mañana, 12-18 tarde, 19-23 noche
export const DAY_PARTS = [
  { key: "night", from: 0, to: 5, plural: "de madrugada" },
  { key: "morning", from: 6, to: 11, plural: "por la mañana" },
  { key: "afternoon", from: 12, to: 18, plural: "por la tarde" },
  { key: "evening", from: 19, to: 23, plural: "por la noche" },
];

// Monday = 0 ... Sunday = 6 (JS has Sunday = 0)
const weekdayIndex = (date) => (new Date(date).getDay() + 6) % 7;

const dayPartIndex = (date) => {
  const hour = new Date(date).getHours();
  return DAY_PARTS.findIndex((part) => hour >= part.from && hour <= part.to);
};

const countInto = (size, records, indexOf) => {
  const counts = new Array(size).fill(0);
  for (const record of records) {
    const index = indexOf(record.createdAt);
    if (index >= 0 && !Number.isNaN(index)) counts[index] += 1;
  }
  return counts;
};

export const weekdayDistribution = (records) =>
  countInto(7, records || [], weekdayIndex);

export const dayPartDistribution = (records) =>
  countInto(DAY_PARTS.length, records || [], dayPartIndex);

const topOf = (counts) => {
  let best = 0;
  counts.forEach((count, index) => {
    if (count > counts[best]) best = index;
  });
  return { index: best, count: counts[best] };
};

const isTie = (counts, top) =>
  counts.filter((count) => count === top.count).length > 1;

const percent = (count, total) => Math.round((count / total) * 100);

// minShare is how much of all the records one option must hold to count as a
// pattern: weekdays have 7 options (a fair split is 14%) so they need more
// than the 4 day parts do.
export const findPatterns = (records, { minRecords = MIN_RECORDS_FOR_PATTERNS } = {}) => {
  const list = records || [];
  const total = list.length;
  if (total < minRecords) return [];

  const patterns = [];

  const days = weekdayDistribution(list);
  const topDay = topOf(days);
  if (topDay.count >= MIN_COUNT && topDay.count / total >= 0.4 && !isTie(days, topDay)) {
    patterns.push({
      kind: "weekday",
      count: topDay.count,
      total,
      text: `Suele aparecer ${WEEKDAYS[topDay.index].plural}: ${topDay.count} de ${total} registros (${percent(topDay.count, total)} %).`,
    });
  }

  const parts = dayPartDistribution(list);
  const topPart = topOf(parts);
  if (topPart.count >= MIN_COUNT && topPart.count / total >= 0.5 && !isTie(parts, topPart)) {
    patterns.push({
      kind: "daypart",
      count: topPart.count,
      total,
      text: `Se anota sobre todo ${DAY_PARTS[topPart.index].plural}: ${topPart.count} de ${total} registros (${percent(topPart.count, total)} %).`,
    });
  }

  const topPain = getPainTypeOptions(list)[0];
  if (topPain && topPain.count >= MIN_COUNT && topPain.count / total >= 0.5) {
    patterns.push({
      kind: "pain",
      count: topPain.count,
      total,
      text: `${topPain.name} es el dolor más repetido: ${topPain.count} de ${total} registros (${percent(topPain.count, total)} %).`,
    });
  }

  return patterns;
};

export const PATTERNS_DISCLAIMER =
  "Son observaciones de tus propios registros, no un diagnóstico. Con pocos datos pueden ser casualidad.";

export const describeMissingData = (count, minRecords = MIN_RECORDS_FOR_PATTERNS) =>
  count >= minRecords
    ? "No se ve ningún patrón claro en este periodo."
    : `Aún hay pocos registros para ver patrones (${count} de ${minRecords} necesarios).`;
