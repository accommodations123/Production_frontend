import React from "react"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, Clock, XCircle, AlertCircle, ShieldCheck, ShieldAlert, FileText, Ban } from "lucide-react"
import { cn } from "@/lib/utils"

export function StatusBadge({ status, className, showIcon = true }) {
    if (!status && status !== false) return null;

    const normalizedStatus = String(status).toLowerCase().trim();

    let variant = "secondary";
    let label = status;
    let Icon = null;

    switch (normalizedStatus) {
        case "approved":
        case "active":
        case "completed":
        case "verified":
        case "true":
            variant = "success";
            label = normalizedStatus === "true" ? "Verified" : status.charAt(0).toUpperCase() + status.slice(1);
            Icon = CheckCircle2;
            break;

        case "pending":
        case "reviewing":
        case "under_review":
            variant = "warning";
            label = "Pending Review";
            Icon = Clock;
            break;

        case "rejected":
        case "declined":
        case "blocked":
        case "cancelled":
        case "canceled":
            variant = "destructive";
            label = status.charAt(0).toUpperCase() + status.slice(1);
            Icon = XCircle;
            break;

        case "draft":
            variant = "neutral";
            label = "Draft";
            Icon = FileText;
            break;

        case "inactive":
        case "unverified":
        case "false":
            variant = "neutral";
            label = normalizedStatus === "false" ? "Unverified" : status.charAt(0).toUpperCase() + status.slice(1);
            Icon = AlertCircle;
            break;

        default:
            variant = "secondary";
            label = typeof status === "string" ? status.charAt(0).toUpperCase() + status.slice(1) : String(status);
            Icon = AlertCircle;
            break;
    }

    return (
        <Badge variant={variant} className={cn("capitalize font-semibold tracking-wide py-1 px-2.5", className)}>
            {showIcon && Icon && <Icon className="w-3.5 h-3.5 shrink-0 mr-0.5" />}
            <span>{label}</span>
        </Badge>
    );
}
