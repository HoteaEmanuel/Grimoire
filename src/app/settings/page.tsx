export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getSession } from "@/lib/session";
import { getProfileData } from "@/lib/db/profile";
import { getEditorPreferences } from "@/lib/db/editor-preferences";
import { ChangePasswordForm } from "@/components/profile/ChangePasswordForm";
import { DeleteAccountDialog } from "@/components/profile/DeleteAccountDialog";
import { EditorPreferencesHydrator } from "@/components/shared/EditorPreferencesHydrator";
import { EditorPreferencesForm } from "@/components/settings/EditorPreferencesForm";
import { BillingCard } from "@/components/settings/BillingCard";

export default async function SettingsPage() {
  const session = await getSession();
  if (!session?.user?.id) redirect("/sign-in");

  const profile = await getProfileData(session.user.id);
  if (!profile) redirect("/sign-in");

  const editorPreferences = await getEditorPreferences(session.user.id);

  return (
    <div className="min-h-screen bg-background">
      <EditorPreferencesHydrator preferences={editorPreferences} />
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="size-4" />
          Back to dashboard
        </Link>

        <h1 className="text-2xl font-semibold text-foreground">Settings</h1>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Editor preferences</CardTitle>
          </CardHeader>
          <CardContent>
            <EditorPreferencesForm />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Billing</CardTitle>
          </CardHeader>
          <CardContent>
            <BillingCard
              isPro={profile.isPro}
              totalItems={profile.totalItems}
              totalCollections={profile.totalCollections}
            />
          </CardContent>
        </Card>

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
