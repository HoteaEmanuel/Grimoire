import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import axios, { AxiosError } from "axios";
import type { ChangePasswordInput } from "@/lib/schemas/auth";

export function useChangePassword(onSuccess?: () => void) {
  return useMutation({
    mutationFn: (data: ChangePasswordInput) =>
      axios.post("/api/profile/change-password", data),
    onSuccess: () => {
      toast.success("Password changed successfully");
      onSuccess?.();
    },
    onError: (err: AxiosError<{ error: string }>) => {
      toast.error(err.response?.data?.error ?? "Failed to change password");
    },
  });
}

export function useDeleteAccount(onSuccess?: () => void) {
  return useMutation({
    mutationFn: () => axios.delete("/api/profile/delete-account"),
    onSuccess: () => {
      onSuccess?.();
    },
    onError: (err: AxiosError<{ error: string }>) => {
      toast.error(err.response?.data?.error ?? "Failed to delete account");
    },
  });
}
