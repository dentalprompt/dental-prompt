import { NextResponse } from "next/server";

import { getRequestSession } from "@/lib/auth/request-session";
import { prisma } from "@/lib/db/prisma";

export async function GET(request: Request) {
  const session = getRequestSession(request);

  if (!session) {
    return NextResponse.json({ message: "Sessao invalida." }, { status: 401 });
  }

  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ message: "Backup requer banco configurado." }, { status: 400 });
  }

  const where = session.isSuperAdmin ? {} : { id: session.tenantId };

  const tenants = await prisma.tenant.findMany({
    where,
    include: {
      settings: true,
      users: {
        include: {
          roles: {
            include: {
              role: true
            }
          }
        }
      },
      patients: {
        include: {
          appointments: true,
          conversations: {
            include: {
              messages: true
            }
          },
          financialItems: true,
          budgets: true,
          treatments: {
            include: {
              evolutions: true
            }
          },
          anamneses: true,
          files: true
        }
      },
      professionals: true,
      plans: {
        include: {
          procedures: true
        }
      },
      financialItems: true,
      serviceBoards: {
        include: {
          columns: {
            include: {
              cards: true
            }
          }
        }
      },
      agents: true,
      contracts: true,
      anamneses: true,
      accounts: true,
      chairs: true
    }
  });

  return new Response(JSON.stringify({ exportedAt: new Date().toISOString(), tenants }, null, 2), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="backup-${session.isSuperAdmin ? "global" : session.tenantId}.json"`
    }
  });
}
