import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface FavoriteStarProps {
  filled: boolean;
  size?: number;
  className?: string;
  emptyClassName?: string;
}

export function FavoriteStar({ filled, size = 12, className, emptyClassName }: FavoriteStarProps) {
  return (
    <Star
      size={size}
      className={cn(filled ? "fill-amber-500 text-amber-500" : emptyClassName, className)}
    />
  );
}
