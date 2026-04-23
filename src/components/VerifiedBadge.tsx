import { BadgeCheck } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

type Size = "sm" | "md" | "lg";

const SIZES: Record<Size, string> = {
  sm: "h-3.5 w-3.5",
  md: "h-4 w-4",
  lg: "h-5 w-5",
};

export function VerifiedBadge({ size = "md", className }: { size?: Size; className?: string }) {
  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <span
            aria-label="Verified by CareLink India"
            className={cn("inline-flex items-center justify-center text-primary", className)}
          >
            <BadgeCheck className={cn(SIZES[size], "fill-primary text-primary-foreground")} strokeWidth={2.5} />
          </span>
        </TooltipTrigger>
        <TooltipContent>Verified by CareLink India</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
