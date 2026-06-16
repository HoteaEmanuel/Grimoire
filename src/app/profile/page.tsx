export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CalendarDays, Layers, Hash } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getSession } from "@/lib/session";
import { getProfileData } from "@/lib/db/profile";
import { ICON_MAP } from "@/lib/item-types";
import { ChangePasswordForm } from "@/components/profile/ChangePasswordForm";
import { DeleteAccountDialog } from "@/components/profile/DeleteAccountDialog";

export default async function ProfilePage() {
  const session = await getSession();
  if (!session?.user?.id) redirect("/sign-in");

  const profile = await getProfileData(session.user.id);
  if (!profile) redirect("/sign-in");

  const name = session.user.name ?? "";
  const email = session.user.email ?? "";
  const image = session.user.image;

  const initials = name
    ? name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : email.slice(0, 2).toUpperCase();

  const joined = new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(profile.createdAt);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        {/* Back nav */}
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="size-4" />
          Back to dashboard
        </Link>

        {/* User info */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <Avatar className="size-16 shrink-0">
                <AvatarImage src={image ?? undefined} alt={name} />
                <AvatarFallback className="text-lg font-semibold bg-primary/20 text-primary">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                {name && (
                  <p className="text-xl font-semibold text-foreground truncate">{name}</p>
                )}
                <p className="text-sm text-muted-foreground truncate">{email}</p>
                <div className="flex items-center gap-1.5 mt-1 text-xs text-muted-foreground">
                  <CalendarDays className="size-3.5" />
                  Joined {joined}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Usage stats */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Usage</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg border border-border bg-muted/30 p-4 flex items-center gap-3">
                <Hash className="size-5 text-blue-400 shrink-0" />
                <div>
                  <p className="text-2xl font-bold text-foreground">{profile.totalItems}</p>
                  <p className="text-xs text-muted-foreground">Total items</p>
                </div>
              </div>
              <div className="rounded-lg border border-border bg-muted/30 p-4 flex items-center gap-3">
                <Layers className="size-5 text-purple-400 shrink-0" />
                <div>
                  <p className="text-2xl font-bold text-foreground">{profile.totalCollections}</p>
                  <p className="text-xs text-muted-foreground">Collections</p>
                </div>
              </div>
            </div>

            {profile.itemsByType.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  By type
                </p>
                <div className="space-y-1.5">
                  {profile.itemsByType.map((entry) => {
                    const Icon = ICON_MAP[entry.typeIcon];
                    return (
                      <div key={entry.typeName} className="flex items-center gap-3">
                        <div className="flex items-center gap-2 w-28 shrink-0">
                          {Icon && <Icon className="size-3.5" style={{ color: entry.typeColor }} />}
                          <span className="text-sm text-muted-foreground capitalize">
                            {entry.typeName}
                          </span>
                        </div>
                        <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${Math.min(100, (entry.count / profile.totalItems) * 100)}%`,
                              backgroundColor: entry.typeColor,
                            }}
                          />
                        </div>
                        <span className="text-sm font-medium text-foreground w-6 text-right shrink-0">
                          {entry.count}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Change password */}
        {profile.hasPassword && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Change password</CardTitle>
            </CardHeader>
            <CardContent>
              <ChangePasswordForm />
            </CardContent>
          </Card>
        )}

        {/* Danger zone */}
        <Card className="border-destructive/40">
          <CardHeader className="pb-3">
            <CardTitle className="text-base text-destructive">Danger zone</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Permanently delete your account and all associated data. This cannot be undone.
            </p>
            <DeleteAccountDialog />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
