export const dynamic = "force-dynamic";

import { Suspense } from "react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { AuthToast } from "@/components/auth/AuthToast";
import { auth } from "@/auth";
import { getSidebarItemTypes } from "@/lib/db/items";
import { getSidebarCollections } from "@/lib/db/collections";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const userId = session?.user?.id ?? "";

  const [itemTypes, collections] = await Promise.all([
    getSidebarItemTypes(userId),
    getSidebarCollections(userId),
  ]);

  return (
    <DashboardShell
      sidebarItemTypes={itemTypes}
      sidebarCollections={collections}
      user={
        session?.user
          ? {
              name: session.user.name ?? "",
              email: session.user.email ?? "",
              image: session.user.image,
            }
          : null
      }
    >
      <Suspense>
        <AuthToast />
      </Suspense>
      {children}
    </DashboardShell>
  );
}
