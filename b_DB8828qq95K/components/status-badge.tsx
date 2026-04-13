import { cn } from "@/lib/utils"

type Status = 
  | "searching" 
  | "assigned" 
  | "ongoing" 
  | "completed" 
  | "cancelled"
  | "available"
  | "busy"
  | "offline"
  | "requested"
  | "started"
  | "pending"
  | "paid"

interface StatusBadgeProps {
  status: Status
  className?: string
}

const statusConfig: Record<Status, { label: string; className: string }> = {
  searching: {
    label: "Searching",
    className: "bg-amber-100 text-amber-700 border-amber-200",
  },
  assigned: {
    label: "Assigned",
    className: "bg-blue-100 text-blue-700 border-blue-200",
  },
  ongoing: {
    label: "Ongoing",
    className: "bg-indigo-100 text-indigo-700 border-indigo-200",
  },
  completed: {
    label: "Completed",
    className: "bg-emerald-100 text-emerald-700 border-emerald-200",
  },
  cancelled: {
    label: "Cancelled",
    className: "bg-red-100 text-red-700 border-red-200",
  },
  available: {
    label: "Available",
    className: "bg-emerald-100 text-emerald-700 border-emerald-200",
  },
  busy: {
    label: "Busy",
    className: "bg-orange-100 text-orange-700 border-orange-200",
  },
  offline: {
    label: "Offline",
    className: "bg-slate-100 text-slate-700 border-slate-200",
  },
  requested: {
    label: "Requested",
    className: "bg-purple-100 text-purple-700 border-purple-200",
  },
  started: {
    label: "Started",
    className: "bg-cyan-100 text-cyan-700 border-cyan-200",
  },
  pending: {
    label: "Pending",
    className: "bg-amber-100 text-amber-700 border-amber-200",
  },
  paid: {
    label: "Paid",
    className: "bg-emerald-100 text-emerald-700 border-emerald-200",
  },
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status]
  
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors",
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  )
}
