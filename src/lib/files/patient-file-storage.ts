import { mkdir, writeFile } from "fs/promises";
import path from "path";

type SavePatientFileInput = {
  patientId: string;
  fileName: string;
  base64Content: string;
};

function sanitizeFileName(fileName: string) {
  return fileName.replace(/[^a-zA-Z0-9._-]/g, "-");
}

export async function savePatientFile({ patientId, fileName, base64Content }: SavePatientFileInput) {
  const uploadsRoot = path.join(process.cwd(), "public", "uploads", "patients", patientId);
  await mkdir(uploadsRoot, { recursive: true });

  const normalizedName = sanitizeFileName(fileName);
  const finalFileName = `${Date.now()}-${normalizedName}`;
  const absolutePath = path.join(uploadsRoot, finalFileName);
  const fileBuffer = Buffer.from(base64Content, "base64");

  await writeFile(absolutePath, fileBuffer);

  return {
    fileName: finalFileName,
    publicUrl: `/uploads/patients/${patientId}/${finalFileName}`
  };
}
