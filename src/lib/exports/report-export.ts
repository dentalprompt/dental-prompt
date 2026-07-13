import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import * as XLSX from "xlsx";

export type ExportFormat = "csv" | "xlsx" | "pdf";

type ExportColumn<T> = {
  key: keyof T;
  label: string;
};

function toCsvValue(value: unknown) {
  const text = String(value ?? "");
  return `"${text.replace(/"/g, '""')}"`;
}

export function buildCsv<T extends Record<string, unknown>>(rows: T[], columns: ReadonlyArray<ExportColumn<T>>) {
  const header = columns.map((column) => toCsvValue(column.label)).join(";");
  const body = rows
    .map((row) => columns.map((column) => toCsvValue(row[column.key])).join(";"))
    .join("\n");

  return `${header}\n${body}`;
}

export function buildXlsx<T extends Record<string, unknown>>(rows: T[], columns: ReadonlyArray<ExportColumn<T>>) {
  const worksheetRows = rows.map((row) =>
    Object.fromEntries(columns.map((column) => [column.label, row[column.key] ?? ""]))
  );
  const worksheet = XLSX.utils.json_to_sheet(worksheetRows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Relatorio");
  return XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });
}

export async function buildPdf<T extends Record<string, unknown>>(
  title: string,
  rows: T[],
  columns: ReadonlyArray<ExportColumn<T>>
) {
  const pdf = await PDFDocument.create();
  const page = pdf.addPage([842, 595]);
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdf.embedFont(StandardFonts.HelveticaBold);

  let y = 560;
  page.drawText(title, {
    x: 32,
    y,
    size: 20,
    font: boldFont,
    color: rgb(0.05, 0.25, 0.6)
  });

  y -= 32;
  page.drawText(columns.map((column) => column.label).join(" | "), {
    x: 32,
    y,
    size: 10,
    font: boldFont
  });

  y -= 18;

  for (const row of rows.slice(0, 30)) {
    const line = columns.map((column) => String(row[column.key] ?? "")).join(" | ");
    page.drawText(line.slice(0, 130), {
      x: 32,
      y,
      size: 9,
      font
    });
    y -= 16;

    if (y < 48) {
      break;
    }
  }

  return Buffer.from(await pdf.save());
}

export function getContentType(format: ExportFormat) {
  switch (format) {
    case "csv":
      return "text/csv; charset=utf-8";
    case "xlsx":
      return "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
    case "pdf":
      return "application/pdf";
  }
}

export function getFileExtension(format: ExportFormat) {
  switch (format) {
    case "csv":
      return "csv";
    case "xlsx":
      return "xlsx";
    case "pdf":
      return "pdf";
  }
}
