import { DashboardShell } from "@/components/layout/DashboardShell";
import { getSidebarItemTypes } from "@/lib/db/items";
import { getSidebarCollections } from "@/lib/db/collections";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [itemTypes, collections] = await Promise.all([
    getSidebarItemTypes(),
    getSidebarCollections(),
  ]);

  return (
    <DashboardShell sidebarItemTypes={itemTypes} sidebarCollections={collections}>
      {children}
    </DashboardShell>
  );
}
