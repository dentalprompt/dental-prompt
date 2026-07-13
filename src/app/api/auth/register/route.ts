import { NextResponse } from "next/server";

import { createTenantAdminUser } from "@/lib/auth/provisioning";
import { issueSessionResponse } from "@/lib/auth/session-issuer";
import { prisma } from "@/lib/db/prisma";
import { registerSchema } from "@/modules/auth/schemas/register-schema";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const values = registerSchema.parse(body);

    const existingUser = await prisma.user.findUnique({
      where: { email: values.email }
    });

    if (existingUser) {
      return NextResponse.json({ message: "Ja existe uma conta com este e-mail." }, { status: 409 });
    }
    const created = await createTenantAdminUser({
      name: values.name,
      email: values.email,
      phone: values.phone,
      password: values.password
    });

    const { tenant, user, roles } = created;

    await issueSessionResponse({
      userId: user.id,
      tenantId: tenant.id,
      email: user.email,
      isSuperAdmin: false,
      roles,
      persistSession: true
    });

    return NextResponse.json({
      ok: true,
      data: {
        userId: user.id,
        tenantId: tenant.id
      }
    });
  } catch {
    return NextResponse.json({ message: "Nao foi possivel concluir o cadastro." }, { status: 400 });
  }
}
