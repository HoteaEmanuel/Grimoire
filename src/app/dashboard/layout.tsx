import { Search, Plus, BookMarked } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col h-screen bg-background">
      <TopBar />
      <div className="flex flex-1 overflow-hidden">
        <aside className="w-64 shrink-0 border-r border-border bg-sidebar px-4 py-6">
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
            Sidebar
          </h2>
        </aside>
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

function TopBar() {
  return (
    <header className="h-13 shrink-0 border-b border-border bg-background/80 backdrop-blur-sm flex items-center gap-3 px-4">
      <span className="text-sm font-bold tracking-wide text-primary mr-1">GRIMOIRE</span>
      <div className="flex-1 max-w-lg relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
        <Input placeholder="Search commands, snippets, links from your grimoire..." className="pl-9 h-8 text-sm bg-muted/40 border-border/60" />
      </div>
      <div className="ml-auto flex items-center gap-2">
        <Button size="sm" variant="outline" className="gap-1.5 h-8 text-xs border-border/60 text-muted-foreground hover:text-foreground">
          <BookMarked className="size-3.5" />
          New Collection
        </Button>
        <Button size="sm" className="gap-1.5 h-8 text-xs bg-primary text-primary-foreground hover:bg-primary/90">
          <Plus className="size-3.5" />
          New Item
        </Button>
      </div>
    </header>
  );
}
