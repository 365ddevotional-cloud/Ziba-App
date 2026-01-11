import { Star } from "lucide-react";

interface StarRatingProps {
  rating: number;
  size?: "xs" | "sm" | "md";
  showNumeric?: boolean;
}

export function StarRating({ rating, size = "sm", showNumeric = true }: StarRatingProps) {
  const sizeClasses = {
    xs: "h-2.5 w-2.5",
    sm: "h-3 w-3",
    md: "h-4 w-4",
  };
  
  const sizeClass = sizeClasses[size];
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  
  return (
    <div className="flex items-center gap-0.5" title={`${rating.toFixed(1)} stars`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`${sizeClass} ${
            star <= fullStars
              ? "fill-yellow-500 text-yellow-500"
              : star === fullStars + 1 && hasHalfStar
              ? "fill-yellow-500/50 text-yellow-500"
              : "text-muted-foreground"
          }`}
        />
      ))}
      {showNumeric && (
        <span className="text-xs text-muted-foreground ml-1">({rating.toFixed(1)})</span>
      )}
    </div>
  );
}
