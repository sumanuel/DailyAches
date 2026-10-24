import {
  CSV_HEADER,
  buildCsv,
  buildReportHtml,
  exportFileName,
  getExportRange,
} from "../exportRecords";

const people = [{ id: "7", name: "Ana", relationship: "hermana" }];
const rec = (id, createdAt, extra = {}) => ({
  id,
  personId: "7",
  personName: "Ana",
  pain: "Cabeza",
  painLevel: 6,
  notes: "",
  createdAt,
  ...extra,
});
const at = (d, h = 10, m = 5) => new Date(2026, 9, d, h, m).toISOString();

describe("buildCsv", () => {
  const lines = (csv) => csv.replace(/^﻿/, "").trimEnd().split("\r\n");

  it("starts with a BOM and the header, and ends each row with CRLF", () => {
    const csv = buildCsv([], people);
    expect(csv.startsWith("﻿")).toBe(true);
    expect(lines(csv)).toEqual([CSV_HEADER.join(",")]);
    expect(csv.endsWith("\r\n")).toBe(true);
  });

  it("writes one row per record, oldest first, with date, time and relationship", () => {
    const csv = buildCsv(
      [rec("2", at(22, 18, 30), { painLevel: 8 }), rec("1", at(20, 9, 5), { notes: "tras el trabajo" })],
      people,
    );
    expect(lines(csv)).toEqual([
      "Fecha,Hora,Persona,Parentesco,Dolor,Intensidad,Notas",
      "2026-10-20,09:05,Ana,hermana,Cabeza,6,tras el trabajo",
      "2026-10-22,18:30,Ana,hermana,Cabeza,8,",
    ]);
  });

  it("quotes cells with commas, quotes and line breaks", () => {
    const csv = buildCsv(
      [rec("1", at(20), { notes: 'Dijo "ya pasó", pero\nvolvió' })],
      people,
    );
    expect(csv).toContain('"Dijo ""ya pasó"", pero\nvolvió"');
  });

  it("keeps accents and leaves empty cells for missing data", () => {
    const csv = buildCsv(
      [rec("1", at(20), { pain: "Migraña", painLevel: undefined, personId: "99" })],
      people,
    );
    expect(lines(csv)[1]).toBe("2026-10-20,10:05,Ana,,Migraña,,");
  });

  it("neutralizes cells a spreadsheet would run as a formula", () => {
    const csv = buildCsv(
      [rec("1", at(20), { notes: "=HYPERLINK(\"http://x\")" }), rec("2", at(21), { notes: "@cmd" }), rec("3", at(22), { notes: "-5 y +3" })],
      people,
    );
    const rows = lines(csv).slice(1);
    expect(rows[0]).toContain("\"'=HYPERLINK");
    expect(rows[1].endsWith(",'@cmd")).toBe(true);
    expect(rows[2].endsWith(",'-5 y +3")).toBe(true);
  });
});

describe("buildReportHtml", () => {
  it("shows the summary and a row per record", () => {
    const html = buildReportHtml([rec("1", at(20), { painLevel: 5 }), rec("2", at(21), { painLevel: 8 })], people, {
      rangeLabel: "octubre 2026",
      personLabel: "Ana",
      generatedAt: new Date(2026, 9, 24),
    });
    expect(html).toContain("<strong>2</strong> registros");
    expect(html).toContain("intensidad media <strong>6,5</strong>");
    expect(html).toContain("Ana · octubre 2026");
    expect(html).toContain("20 oct 2026");
    expect(html).toContain("Generado con DailyAches el 24 oct 2026");
    // body rows start with <td>; the header row has <th>
    expect((html.match(/<tr>\s*<td>/g) || []).length).toBe(2);
  });

  it("escapes anything typed by the user", () => {
    const html = buildReportHtml(
      [rec("1", at(20), { notes: '<script>alert("x")</script> & más', personName: "<b>Ana</b>" })],
      people,
    );
    expect(html).not.toContain("<script>");
    expect(html).not.toContain("<b>Ana</b>");
    expect(html).toContain("&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt; &amp; más");
  });

  it("says so when there is nothing to report", () => {
    const html = buildReportHtml([], people);
    expect(html).toContain("0</strong> registros");
    expect(html).toContain("No hay registros en este periodo.");
    expect(html).not.toContain("<table>");
  });

  it("uses the singular for one record", () => {
    expect(buildReportHtml([rec("1", at(20))], people)).toContain("<strong>1</strong> registro ");
  });
});

describe("exportFileName", () => {
  const date = new Date(2026, 9, 24);

  it("names the file with the date and, when given, the person", () => {
    expect(exportFileName("csv", { date })).toBe("dailyaches-2026-10-24.csv");
    expect(exportFileName("pdf", { personLabel: "Ana Pérez", date })).toBe(
      "dailyaches-ana-perez-2026-10-24.pdf",
    );
  });

  it("drops characters that are not safe in a file name", () => {
    expect(exportFileName("csv", { personLabel: "../Ñandú: ¿qué?", date })).toBe(
      "dailyaches-nandu-que-2026-10-24.csv",
    );
  });
});

describe("getExportRange", () => {
  const now = new Date(2026, 9, 24, 12);

  it("covers the current and the previous month", () => {
    const month = getExportRange("month", now);
    expect(month.label).toBe("octubre 2026");
    expect(month.start.getDate()).toBe(1);
    expect(month.end.getDate()).toBe(31);
    expect(getExportRange("prev_month", now).label).toBe("septiembre 2026");
  });

  it("covers the whole year", () => {
    const year = getExportRange("year", now);
    expect(year.label).toBe("2026");
    expect(year.start.getMonth()).toBe(0);
    expect(year.end.getMonth()).toBe(11);
  });

  it("has no limits for everything", () => {
    expect(getExportRange("all", now)).toEqual({ label: "Todo el historial" });
  });
});
