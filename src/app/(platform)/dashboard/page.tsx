import { Suspense } from "react";

import {
  DashboardAnalyticsSection,
  DashboardCommercialProgress,
  DashboardDailySummary,
  DashboardGoalSection,
  DashboardGoalSkeleton,
  DashboardHeroCards,
  DashboardSectionSkeleton,
  DashboardSupportGrid,
  DashboardSupportSkeleton,
  DashboardWideSkeleton
} from "@/modules/dashboard/components/dashboard-overview";

export default function DashboardPage() {
  return (
    <div className="space-y-4 lg:space-y-6">
      <Suspense fallback={<DashboardSectionSkeleton cards={4} />}>
        <DashboardHeroCards />
      </Suspense>

      <Suspense fallback={<DashboardWideSkeleton />}>
        <DashboardDailySummary />
      </Suspense>

      <Suspense fallback={<DashboardWideSkeleton />}>
        <DashboardCommercialProgress />
      </Suspense>

      <Suspense fallback={<DashboardSectionSkeleton cards={2} tall />}>
        <DashboardAnalyticsSection />
      </Suspense>

      <Suspense fallback={<DashboardGoalSkeleton />}>
        <DashboardGoalSection />
      </Suspense>

      <Suspense fallback={<DashboardSupportSkeleton />}>
        <DashboardSupportGrid />
      </Suspense>
    </div>
  );
}
