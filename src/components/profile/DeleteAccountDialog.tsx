"use client";

import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { ConfirmDeleteDialog } from "@/components/shared/ConfirmDeleteDialog";
import { useDeleteAccount } from "@/lib/mutations/profile";

export function DeleteAccountDialog() {
  const { mutate, isPending } = useDeleteAccount(() => {
    signOut({ callbackUrl: "/sign-in?toast=account-deleted" });
  });

  return (
    <ConfirmDeleteDialog
      trigger={<Button variant="destructive" className="w-full sm:w-auto" />}
      triggerLabel="Delete account"
      title="Delete your account?"
      description={
        <>
          This will permanently delete your account, all your items,
          collections, and tags.
          <br />
          <span className="font-bold">THIS ACTION CANNOT BE UNDONE.</span>
        </>
      }
      confirmLabel="Yes, delete my account"
      isPending={isPending}
      onConfirm={() => mutate()}
    />
  );
}
