import { Platform } from "react-native";
import { File, Paths } from "expo-file-system";
import * as Sharing from "expo-sharing";
import * as Print from "expo-print";
import { buildCsv, buildReportHtml, exportFileName } from "./exportRecords";

export const FORMATS = {
  csv: { mimeType: "text/csv", uti: "public.comma-separated-values-text", title: "Exportar historial (CSV)" },
  pdf: { mimeType: "application/pdf", uti: "com.adobe.pdf", title: "Exportar historial (PDF)" },
};

export const NO_RECORDS_MESSAGE = "No hay registros para exportar con esta selección.";
export const PDF_ON_WEB_MESSAGE = "El PDF solo se puede crear desde la app del móvil. Usa CSV en el navegador.";
export const SHARING_UNAVAILABLE_MESSAGE = "Este dispositivo no permite compartir archivos.";
export const EXPORT_FAILED_MESSAGE = "No se pudo crear el archivo. Inténtalo de nuevo.";

export const isPdfSupported = () => Platform.OS !== "web";

// In the browser there is no share sheet: the file is simply downloaded.
const downloadInBrowser = (content, fileName, mimeType) => {
  const blob = new Blob([content], { type: `${mimeType};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};

const writeCacheFile = (fileName, content) => {
  const file = new File(Paths.cache, fileName);
  file.create({ overwrite: true });
  file.write(content);
  return file.uri;
};

// Builds the file for `format` ("csv" | "pdf") and hands it to the user:
// downloaded on web, shared through the system sheet on the phone.
// Returns { success, error, fileName } with the error ready to show.
export const exportRecords = async ({
  format,
  records,
  people,
  personLabel,
  rangeLabel,
}) => {
  if (!records || records.length === 0) {
    return { success: false, error: NO_RECORDS_MESSAGE };
  }
  const meta = FORMATS[format];
  if (!meta) return { success: false, error: EXPORT_FAILED_MESSAGE };

  try {
    const fileName = exportFileName(format, { personLabel });

    if (Platform.OS === "web") {
      if (format === "pdf") return { success: false, error: PDF_ON_WEB_MESSAGE };
      downloadInBrowser(buildCsv(records, people), fileName, meta.mimeType);
      return { success: true, fileName };
    }

    if (!(await Sharing.isAvailableAsync())) {
      return { success: false, error: SHARING_UNAVAILABLE_MESSAGE };
    }

    let uri;
    if (format === "csv") {
      uri = writeCacheFile(fileName, buildCsv(records, people));
    } else {
      const html = buildReportHtml(records, people, { rangeLabel, personLabel });
      ({ uri } = await Print.printToFileAsync({ html }));
    }

    await Sharing.shareAsync(uri, {
      mimeType: meta.mimeType,
      UTI: meta.uti,
      dialogTitle: meta.title,
    });
    return { success: true, fileName };
  } catch (error) {
    console.error("Error exporting records:", error);
    return { success: false, error: EXPORT_FAILED_MESSAGE };
  }
};
