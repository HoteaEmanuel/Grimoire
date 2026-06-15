export const dynamic = "force-dynamic";

import { DashboardShell } from "@/components/layout/DashboardShell";
import { getDevUser } from "@/lib/db/user";
import { getSidebarItemTypes } from "@/lib/db/items";
import { getSidebarCollections } from "@/lib/db/collections";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getDevUser();
  const userId = user?.id ?? "";

  const [itemTypes, collections] = await Promise.all([
    getSidebarItemTypes(userId),
    getSidebarCollections(userId),
  ]);

  return (
    <DashboardShell
      sidebarItemTypes={itemTypes}
      sidebarCollections={collections}
      user={user ? { name: user.name ?? "", email: user.email, image: user.image } : null}
    >
      {children}
    </DashboardShell>
  );
}
