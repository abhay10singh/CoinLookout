import { cn } from "@/lib/utils"

function Skeleton({
  className,
  children, // Add children prop
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { children?: React.ReactNode }) { // Add children to props type
  return (
    <div
      className={cn("animate-pulse rounded-md bg-muted", className)}
      {...props}
    >
      {/* Render children if provided, otherwise it's just a blank skeleton */}
      {children ? children : <>&nbsp;</>}
    </div>
  )
}

export { Skeleton }
