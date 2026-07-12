import { notFound } from "next/navigation";

import { PlanDetailView } from "@/modules/plans/components/plan-detail-view";
import { getPlanDetail } from "@/modules/plans/services/plan-service";

export default async function PlanDetailPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const plan = await getPlanDetail(id);

  if (!plan) {
    notFound();
  }

  return <PlanDetailView plan={plan} />;
}
