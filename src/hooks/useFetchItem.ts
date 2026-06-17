import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { toast } from "sonner";
import type { ItemDetail } from "@/lib/db/items";

export function useFetchItem(
  id: string | null,
  enabled: boolean,
  onError: () => void,
): { item: ItemDetail | null; setItem: React.Dispatch<React.SetStateAction<ItemDetail | null>>; loading: boolean } {
  const [item, setItem] = useState<ItemDetail | null>(null);
  const [loading, setLoading] = useState(false);
  // Keep onError stable across renders without needing useCallback at the call site
  const onErrorRef = useRef(onError);
  onErrorRef.current = onError;

  useEffect(() => {
    if (!enabled || !id) return;

    let cancelled = false;
    setItem(null);
    setLoading(true);

    axios
      .get<ItemDetail>(`/api/items/${id}`)
      .then(({ data }) => { if (!cancelled) setItem(data); })
      .catch(() => {
        if (!cancelled) {
          toast.error("Failed to load item");
          onErrorRef.current();
        }
      })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [enabled, id]);

  return { item, setItem, loading };
}
