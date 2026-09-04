import * as React from "react"
import { cn } from "@/lib/utils"

export function ButtonGroup({
  className,
  orientation = "horizontal",
  children,
  ...props
}) {
  return (
    <div
      role="group"
      className={cn(
        "inline-flex items-center",
        orientation === "horizontal"
          ? "[&>button]:rounded-none [&>button:first-child]:rounded-l-md [&>button:last-child]:rounded-r-md [&>button:not(:first-child)]:-ml-px"
          : "flex-col [&>button]:rounded-none [&>button:first-child]:rounded-t-md [&>button:last-child]:rounded-b-md [&>button:not(:first-child)]:-mt-px",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export default ButtonGroup
