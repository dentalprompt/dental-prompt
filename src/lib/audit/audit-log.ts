import { AuditAction } from "@prisma/client";

import { prisma } from "@/lib/db/prisma";
import type { AuthTokenPayload } from "@/lib/auth/types";

type RecordAuditLogInput = {
  session?: AuthTokenPayload | null;
  request?: Request;
  module: string;
  action: AuditAction;
  recordType: string;
  recordId?: string | null;
  previous?: unknown;
  next?: unknown;
  result?: string | null;
};

export async function recordAuditLog({
  session,
  request,
  module,
  action,
  recordType,
  recordId,
  previous,
  next,
  result
}: RecordAuditLogInput) {
  if (!process.env.DATABASE_URL || !session) {
    return;
  }

  try {
    await prisma.auditLog.create({
      data: {
        tenantId: session.tenantId ?? null,
        userId: session.sub,
        module,
        action,
        recordType,
        recordId: recordId ?? null,
        ipAddress: request?.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null,
        userAgent: request?.headers.get("user-agent") ?? null,
        previous: previous ? JSON.parse(JSON.stringify(previous)) : undefined,
        next: next ? JSON.parse(JSON.stringify(next)) : undefined,
        result: result ?? "success"
      }
    });
  } catch {
    // Auditoria nunca deve bloquear a operacao principal.
  }
}
