import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { useFavoriteOverridesStore } from "@/lib/stores/favorite-overrides-store";

type ToggleResult = { success: true } | { success: false; error?: string };

export function useOptimisticToggle(
  key: string | undefined,
  initial: boolean,
  action: (next: boolean) => Promise<ToggleResult>,
) {
  // Shared across every component instance keyed by the same id, so toggling
  // in one place (e.g. the drawer) is reflected everywhere else (e.g. its card).
  const override = useFavoriteOverridesStore((s) => (key ? s.overrides[key] : undefined));
  const setOverride = useFavoriteOverridesStore((s) => s.setOverride);
  const value = override ?? initial;

  const mutation = useMutation({
    mutationFn: (next: boolean) =>
      action(next).then((result) => {
        if (!result.success) throw new Error(result.error ?? "Failed to update");
        return next;
      }),
    onError: (err: Error, next) => {
      if (key) setOverride(key, !next);
      toast.error(err.message);
    },
  });

  function toggle() {
    if (!key) return;
    const next = !value;
    setOverride(key, next);
    mutation.mutate(next);
  }

  return { value, toggle, pending: mutation.isPending };
}
