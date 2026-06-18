import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import type { CollectionOption } from "@/lib/db/collections";

export function useCollectionsList() {
  return useQuery({
    queryKey: ["collections", "list"],
    queryFn: () => axios.get<CollectionOption[]>("/api/collections").then((res) => res.data),
    staleTime: 30_000,
  });
}
