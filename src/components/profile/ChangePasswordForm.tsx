"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PasswordInput } from "@/components/ui/password-input";
import { changePasswordSchema, type ChangePasswordInput } from "@/lib/schemas/auth";
import { useChangePassword } from "@/lib/mutations/profile";

export function ChangePasswordForm() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ChangePasswordInput>({
    resolver: zodResolver(changePasswordSchema),
  });

  const { mutate, isPending } = useChangePassword(reset);

  return (
    <form onSubmit={handleSubmit((data) => mutate(data))} className="space-y-4">
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-foreground">Current password</label>
        <PasswordInput {...register("currentPassword")} placeholder="••••••••" />
        {errors.currentPassword && (
          <p className="text-xs text-destructive">{errors.currentPassword.message}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium text-foreground">New password</label>
        <PasswordInput {...register("newPassword")} placeholder="••••••••" />
        {errors.newPassword && (
          <p className="text-xs text-destructive">{errors.newPassword.message}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium text-foreground">Confirm new password</label>
        <PasswordInput {...register("confirmPassword")} placeholder="••••••••" />
        {errors.confirmPassword && (
          <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>
        )}
      </div>

      <Button type="submit" disabled={isPending} className="w-full">
        {isPending && <Loader2 className="size-4 animate-spin" />}
        Change password
      </Button>
    </form>
  );
}
