import { Platform } from "react-native";
import { File } from "expo-file-system";
import * as Sharing from "expo-sharing";
import * as Print from "expo-print";
import {
  EXPORT_FAILED_MESSAGE,
  NO_RECORDS_MESSAGE,
  PDF_ON_WEB_MESSAGE,
  SHARING_UNAVAILABLE_MESSAGE,
  exportRecords,
} from "../exportService";

const mockFileInstance = { create: jest.fn(), write: jest.fn(), uri: "file:///cache/export.csv" };

jest.mock("expo-file-system", () => ({
  File: jest.fn(() => mockFileInstance),
  Paths: { cache: "file:///cache/" },
}));
jest.mock("expo-sharing", () => ({
  isAvailableAsync: jest.fn(),
  shareAsync: jest.fn(),
}));
jest.mock("expo-print", () => ({ printToFileAsync: jest.fn() }));

const people = [{ id: "7", name: "Ana", relationship: "hermana" }];
const records = [
  { id: "1", personId: "7", personName: "Ana", pain: "Cabeza", painLevel: 6, notes: "n", createdAt: new Date(2026, 9, 20, 10).toISOString() },
];
const args = { records, people, personLabel: "Ana", rangeLabel: "octubre 2026" };

describe("exportRecords", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    Platform.OS = "ios";
    Sharing.isAvailableAsync.mockResolvedValue(true);
    Print.printToFileAsync.mockResolvedValue({ uri: "file:///cache/print.pdf" });
  });

  afterEach(() => {
    Platform.OS = "ios";
    delete global.document;
    delete global.URL.createObjectURL;
    delete global.URL.revokeObjectURL;
  });

  it("refuses to export an empty selection", async () => {
    expect(await exportRecords({ ...args, format: "csv", records: [] })).toEqual({
      success: false,
      error: NO_RECORDS_MESSAGE,
    });
    expect(Sharing.shareAsync).not.toHaveBeenCalled();
  });

  it("writes the CSV to the cache and shares it", async () => {
    const result = await exportRecords({ ...args, format: "csv" });

    expect(result).toMatchObject({ success: true });
    expect(result.fileName).toMatch(/^dailyaches-ana-\d{4}-\d{2}-\d{2}\.csv$/);
    expect(File).toHaveBeenCalledWith("file:///cache/", result.fileName);
    expect(mockFileInstance.create).toHaveBeenCalledWith({ overwrite: true });
    expect(mockFileInstance.write.mock.calls[0][0]).toContain("Fecha,Hora,Persona");
    expect(Sharing.shareAsync).toHaveBeenCalledWith(
      "file:///cache/export.csv",
      expect.objectContaining({ mimeType: "text/csv" }),
    );
  });

  it("prints the report to a PDF and shares that file", async () => {
    const result = await exportRecords({ ...args, format: "pdf" });

    expect(result.success).toBe(true);
    expect(Print.printToFileAsync.mock.calls[0][0].html).toContain("Historial de dolores");
    expect(Sharing.shareAsync).toHaveBeenCalledWith(
      "file:///cache/print.pdf",
      expect.objectContaining({ mimeType: "application/pdf" }),
    );
  });

  it("explains when the device cannot share files", async () => {
    Sharing.isAvailableAsync.mockResolvedValue(false);
    expect(await exportRecords({ ...args, format: "csv" })).toEqual({
      success: false,
      error: SHARING_UNAVAILABLE_MESSAGE,
    });
  });

  it("downloads the CSV in the browser and rejects PDF there", async () => {
    Platform.OS = "web";
    const click = jest.fn();
    const link = { click, remove: jest.fn() };
    global.document = { createElement: jest.fn(() => link), body: { appendChild: jest.fn() } };
    global.URL.createObjectURL = jest.fn(() => "blob:x");
    global.URL.revokeObjectURL = jest.fn();

    const csv = await exportRecords({ ...args, format: "csv" });
    expect(csv.success).toBe(true);
    expect(link.download).toBe(csv.fileName);
    expect(click).toHaveBeenCalled();
    expect(Sharing.shareAsync).not.toHaveBeenCalled();

    expect(await exportRecords({ ...args, format: "pdf" })).toEqual({
      success: false,
      error: PDF_ON_WEB_MESSAGE,
    });
  });

  it("reports an unexpected failure in Spanish", async () => {
    Sharing.shareAsync.mockRejectedValue(new Error("boom"));
    jest.spyOn(console, "error").mockImplementation(() => {});

    expect(await exportRecords({ ...args, format: "csv" })).toEqual({
      success: false,
      error: EXPORT_FAILED_MESSAGE,
    });
  });
});
