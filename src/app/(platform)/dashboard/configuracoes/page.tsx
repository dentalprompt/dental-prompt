import { redirect } from "next/navigation";

import { getSession } from "@/lib/auth/session";
import { SettingsWorkspace } from "@/modules/settings/components/settings-workspace";
import { getClinicSettings } from "@/modules/settings/services/settings-service";

export default async function SettingsPage() {
  const session = await getSession();

  if (!session?.tenantId) {
    redirect("/login");
  }

  const initialSettings = await getClinicSettings(session.tenantId);

  return <SettingsWorkspace initialSettings={initialSettings} />;
}
