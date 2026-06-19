import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { createCheckoutSession, createBillingPortalSession } from "@/actions/billing";

export function useCreateCheckoutSession() {
  return useMutation({
    mutationFn: (plan: "monthly" | "yearly") =>
      createCheckoutSession(plan).then((result) => {
        if (!result.success) throw new Error(result.error);
        return result.data;
      }),
    onSuccess: (data) => {
      window.location.href = data.url;
    },
    onError: (err: Error) => {
      toast.error(err.message ?? "Failed to start checkout");
    },
  });
}

export function useCreateBillingPortalSession() {
  return useMutation({
    mutationFn: () =>
      createBillingPortalSession().then((result) => {
        if (!result.success) throw new Error(result.error);
        return result.data;
      }),
    onSuccess: (data) => {
      window.location.href = data.url;
    },
    onError: (err: Error) => {
      toast.error(err.message ?? "Failed to open billing portal");
    },
  });
}
