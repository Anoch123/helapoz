"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Inbox,
  Loader2,
  RefreshCw,
  Search,
  Trash2,
  TriangleAlert,
  X,
  type LucideIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

/* -------------------------------------------------------------------------- */
/*  PageContainer: outer shell every signed-in page sits in                    */
/* -------------------------------------------------------------------------- */

const WIDTHS = {
  md: "max-w-3xl",
  lg: "max-w-5xl",
  xl: "max-w-6xl",
  "2xl": "max-w-7xl",
  full: "max-w-none",
} as const;

export function PageContainer({
  children,
  width = "full",
  className,
}: {
  children: ReactNode;
  width?: keyof typeof WIDTHS;
  className?: string;
}) {
  return (
    <main
      className={cn(
        "mx-auto w-full space-y-4 p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] sm:space-y-6 sm:p-6 lg:p-8",
        WIDTHS[width],
        className,
      )}
    >
      {children}
    </main>
  );
}

/* -------------------------------------------------------------------------- */
/*  PageHeader: title, description, optional back link + actions               */
/* -------------------------------------------------------------------------- */

export function PageHeader({
  title,
  description,
  icon: Icon,
  backHref,
  backLabel = "Back",
  actions,
}: {
  title: string;
  description?: string;
  icon?: LucideIcon;
  backHref?: string;
  backLabel?: string;
  actions?: ReactNode;
}) {
  return (
    <header className="space-y-3">
      {backHref && (
        <Link
          href={backHref}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          {backLabel}
        </Link>
      )}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-3.5">
          {Icon && (
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary sm:size-11">
              <Icon className="size-5" />
            </span>
          )}
          <div className="min-w-0">
            <h1 className="text-xl font-semibold tracking-tight sm:truncate sm:text-2xl">
              {title}
            </h1>
            {description && (
              <p className="mt-0.5 text-sm text-muted-foreground">
                {description}
              </p>
            )}
          </div>
        </div>

        {actions && (
          <div className="flex w-full shrink-0 flex-wrap items-center gap-2 sm:w-auto [&>*]:flex-1 sm:[&>*]:flex-none">
            {actions}
          </div>
        )}
      </div>
    </header>
  );
}

/* -------------------------------------------------------------------------- */
/*  Stats                                                                      */
/* -------------------------------------------------------------------------- */

export function StatGrid({
  children,
  columns = 2,
}: {
  children: ReactNode;
  columns?: 2 | 3 | 4;
}) {
  return (
    <div
      className={cn(
        "grid gap-4",
        columns === 2 && "grid-cols-1 sm:grid-cols-2",
        columns === 3 && "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
        columns === 4 && "grid-cols-2 lg:grid-cols-4",
      )}
    >
      {children}
    </div>
  );
}

export function StatCard({
  label,
  value,
  icon: Icon,
  loading,
  tone = "primary",
}: {
  label: string;
  value: ReactNode;
  icon: LucideIcon;
  loading?: boolean;
  tone?: "primary" | "muted";
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border bg-card p-4 sm:gap-4 sm:p-5">
      <span
        className={cn(
          "flex size-10 shrink-0 items-center justify-center rounded-xl sm:size-12",
          tone === "primary"
            ? "bg-primary/10 text-primary"
            : "bg-muted text-muted-foreground",
        )}
      >
        <Icon className="size-5" />
      </span>
      <div className="min-w-0">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="text-2xl font-semibold tabular-nums">
          {loading ? "—" : value}
        </p>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Panel: the main content card (title + toolbar + body + footer)             */
/* -------------------------------------------------------------------------- */

export function Panel({
  title,
  description,
  toolbar,
  footer,
  padded = false,
  children,
  className,
}: {
  title?: string;
  description?: string;
  toolbar?: ReactNode;
  footer?: ReactNode;
  /** Adds inner padding. Leave off for edge-to-edge lists. */
  padded?: boolean;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn("overflow-hidden rounded-2xl border bg-card", className)}
    >
      {(title || toolbar) && (
        <div className="flex flex-col gap-3 border-b p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
          <div>
            {title && <h2 className="font-semibold">{title}</h2>}
            {description && (
              <p className="text-sm text-muted-foreground">{description}</p>
            )}
          </div>
          {toolbar && (
            <div className="flex w-full items-center gap-2 sm:w-auto">
              {toolbar}
            </div>
          )}
        </div>
      )}

      <div className={cn(padded && "p-4 sm:p-5")}>{children}</div>

      {footer && <div className="border-t p-3 sm:p-4">{footer}</div>}
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*  Toolbar pieces                                                             */
/* -------------------------------------------------------------------------- */

export function SearchField({
  value,
  onChange,
  placeholder = "Search...",
  ariaLabel = "Search",
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  ariaLabel?: string;
}) {
  return (
    <div className="relative min-w-0 flex-1 sm:w-64 sm:flex-none lg:w-72">
      <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={ariaLabel}
        className="px-9"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          aria-label="Clear search"
          className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground hover:bg-muted"
        >
          <X className="size-3.5" />
        </button>
      )}
    </div>
  );
}

/** Custom on/off switch (no native checkbox). Supports a "mixed" state. */
export function ToggleSwitch({
  checked,
  onChange,
  disabled,
  label,
  indeterminate,
}: {
  checked: boolean;
  onChange: () => void;
  disabled?: boolean;
  label: string;
  indeterminate?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={indeterminate ? "mixed" : checked}
      aria-label={label}
      disabled={disabled}
      onClick={(e) => {
        e.stopPropagation();
        onChange();
      }}
      className={cn(
        "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full border transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        "disabled:cursor-not-allowed disabled:opacity-50",
        checked || indeterminate
          ? "border-primary bg-primary"
          : "border-border bg-muted",
      )}
    >
      <span
        className={cn(
          "pointer-events-none block size-4 rounded-full bg-background shadow-sm transition-transform",
          checked
            ? "translate-x-6"
            : indeterminate
              ? "translate-x-[14px]"
              : "translate-x-1",
        )}
      />
    </button>
  );
}

/** Circular progress with "value of total" in the middle. */
export function ProgressRing({
  value,
  total,
  size = 120,
}: {
  value: number;
  total: number;
  size?: number;
}) {
  const stroke = 10;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = total > 0 ? Math.min(1, value / total) : 0;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={stroke}
          className="stroke-muted"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - pct)}
          className="stroke-primary transition-[stroke-dashoffset] duration-500"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-semibold tabular-nums">{value}</span>
        <span className="text-xs text-muted-foreground">of {total}</span>
      </div>
    </div>
  );
}

export function RefreshButton({
  onClick,
  loading,
  label = "Refresh",
}: {
  onClick: () => void;
  loading?: boolean;
  label?: string;
}) {
  return (
    <Button
      variant="outline"
      size="icon"
      onClick={onClick}
      disabled={loading}
      aria-label={label}
    >
      <RefreshCw className={loading ? "animate-spin" : ""} />
    </Button>
  );
}

/* -------------------------------------------------------------------------- */
/*  States: loading / error / empty, plus DataState that picks one             */
/* -------------------------------------------------------------------------- */

export function LoadingState({ label = "Loading..." }: { label?: string }) {
  return (
    <div className="flex min-h-56 items-center justify-center gap-2 text-sm text-muted-foreground">
      <Loader2 className="size-5 animate-spin" />
      {label}
    </div>
  );
}

export function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex min-h-56 flex-col items-center justify-center gap-3 p-6 text-center">
      <span className="flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
        <TriangleAlert className="size-6" />
      </span>
      <p className="text-sm text-destructive">{message}</p>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}

export function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  action,
}: {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex min-h-56 flex-col items-center justify-center gap-3 p-6 text-center">
      <span className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <Icon className="size-6" />
      </span>
      <div>
        <p className="font-medium">{title}</p>
        {description && (
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {action}
    </div>
  );
}

/**
 * One wrapper for the loading -> error -> empty -> content decision.
 *
 *   <DataState isLoading={isLoading} error={error} isEmpty={rows.length === 0}
 *              onRetry={refresh} empty={{ title: "No orders yet" }}>
 *     ...rows
 *   </DataState>
 */
export function DataState({
  isLoading,
  error,
  isEmpty,
  onRetry,
  loadingLabel,
  empty,
  children,
}: {
  isLoading: boolean;
  error?: string | null;
  isEmpty: boolean;
  onRetry?: () => void;
  loadingLabel?: string;
  empty: {
    icon?: LucideIcon;
    title: string;
    description?: string;
    action?: ReactNode;
  };
  children: ReactNode;
}) {
  if (isLoading) return <LoadingState label={loadingLabel} />;
  if (error) return <ErrorState message={error} onRetry={onRetry} />;
  if (isEmpty) return <EmptyState {...empty} />;
  return <>{children}</>;
}

/* -------------------------------------------------------------------------- */
/*  List rows                                                                  */
/* -------------------------------------------------------------------------- */

export function ListItemLink({
  href,
  icon: Icon,
  title,
  subtitle,
  caption,
  badge,
  meta,
}: {
  href: string;
  icon: LucideIcon;
  title: string;
  subtitle?: string;
  caption?: string;
  badge?: ReactNode;
  meta?: string;
}) {
  return (
    <Link
      href={href}
      className="group flex flex-col gap-3 px-4 py-4 transition-colors sm:px-5 hover:bg-muted/40 sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="flex min-w-0 items-center gap-3.5">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <Icon className="size-5" />
        </span>
        <div className="min-w-0">
          <p className="truncate font-medium">{title}</p>
          {subtitle && (
            <p className="truncate text-sm text-muted-foreground">{subtitle}</p>
          )}
          {caption && (
            <p className="text-xs text-muted-foreground">{caption}</p>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between gap-4 sm:justify-end">
        <div className="text-left sm:text-right">
          {badge}
          {meta && <p className="mt-1 text-xs text-muted-foreground">{meta}</p>}
        </div>
        <ArrowRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
      </div>
    </Link>
  );
}

/* -------------------------------------------------------------------------- */
/*  StatusBadge                                                                */
/* -------------------------------------------------------------------------- */

type Tone = "success" | "neutral" | "warning" | "danger" | "info";

const TONE_STYLES: Record<Tone, string> = {
  success: "bg-green-500/10 text-green-700 dark:text-green-400",
  neutral: "bg-muted text-muted-foreground",
  warning: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
  danger: "bg-destructive/10 text-destructive",
  info: "bg-primary/10 text-primary",
};

const TONE_DOTS: Record<Tone, string> = {
  success: "bg-green-500",
  neutral: "bg-muted-foreground/60",
  warning: "bg-amber-500",
  danger: "bg-destructive",
  info: "bg-primary",
};

// Extend with your own status values.
const STATUS_TONES: Record<string, Tone> = {
  ACTIVE: "success",
  PAID: "success",
  COMPLETED: "success",
  PENDING: "warning",
  TRIAL: "info",
  INACTIVE: "neutral",
  DISABLED: "neutral",
  SUSPENDED: "danger",
  CANCELLED: "danger",
  EXPIRED: "danger",
  FAILED: "danger",
};

export function StatusBadge({
  status,
  tone,
}: {
  status: string;
  tone?: Tone;
}) {
  const resolved = tone ?? STATUS_TONES[status.toUpperCase()] ?? "neutral";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
        TONE_STYLES[resolved],
      )}
    >
      <span className={cn("size-1.5 rounded-full", TONE_DOTS[resolved])} />
      {status}
    </span>
  );
}

/* -------------------------------------------------------------------------- */
/*  Detail pages: DetailGrid, DetailItem, InfoRow                              */
/* -------------------------------------------------------------------------- */

export function DetailGrid({
  children,
  columns = "auto",
}: {
  children: ReactNode;
  /** "auto" fills the available width, adding columns as space allows */
  columns?: "auto" | 1 | 2 | 3;
}) {
  return (
    <div
      className={cn(
        "grid w-full gap-5",
        columns === "auto" &&
          "grid-cols-[repeat(auto-fit,minmax(min(100%,16rem),1fr))]",
        columns === 1 && "grid-cols-1",
        columns === 2 && "grid-cols-1 sm:grid-cols-2",
        columns === 3 && "grid-cols-1 sm:grid-cols-2 xl:grid-cols-3",
      )}
    >
      {children}
    </div>
  );
}

/**
 * Default layout for every details page. Always takes the full available
 * width. Pass `aside` for an optional right-hand column on large screens;
 * without it, `main` spans everything.
 */
export function DetailLayout({
  main,
  aside,
  asideFirstOnMobile = false,
}: {
  main: ReactNode;
  aside?: ReactNode;
  /** Show the aside above main on small screens (e.g. a save bar) */
  asideFirstOnMobile?: boolean;
}) {
  return (
    <div
      className={cn(
        "grid w-full gap-4 sm:gap-6",
        aside && "lg:grid-cols-[minmax(0,1fr)_20rem]",
      )}
    >
      <div className="min-w-0 space-y-4 sm:space-y-6">{main}</div>
      {aside && (
        <div
          className={cn(
            "min-w-0 space-y-4 sm:space-y-6",
            asideFirstOnMobile && "order-first lg:order-none",
          )}
        >
          {aside}
        </div>
      )}
    </div>
  );
}

export function DetailItem({
  icon: Icon,
  label,
  value,
  breakAll,
}: {
  icon: LucideIcon;
  label: string;
  value: ReactNode;
  breakAll?: boolean;
}) {
  return (
    <div className="flex min-w-0 items-start gap-3">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
        <Icon className="size-4" />
      </span>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className={cn("text-sm font-medium", breakAll && "break-all")}>
          {value}
        </p>
      </div>
    </div>
  );
}

export function InfoRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium">{value}</span>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  InlineAlert                                                                */
/* -------------------------------------------------------------------------- */

export function InlineAlert({
  tone = "error",
  children,
}: {
  tone?: "error" | "success";
  children: ReactNode;
}) {
  const isError = tone === "error";

  return (
    <div
      role={isError ? "alert" : "status"}
      className={cn(
        "flex items-start gap-2 rounded-xl border p-3 text-sm",
        isError
          ? "border-destructive/30 bg-destructive/5 text-destructive"
          : "border-green-500/30 bg-green-500/5 text-green-700 dark:text-green-400",
      )}
    >
      {isError ? (
        <TriangleAlert className="mt-0.5 size-4 shrink-0" />
      ) : (
        <CheckCircle2 className="mt-0.5 size-4 shrink-0" />
      )}
      <div className="min-w-0">{children}</div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  ConfirmDanger: destructive action with an inline confirm step              */
/* -------------------------------------------------------------------------- */

export function ConfirmDanger({
  title,
  description,
  triggerLabel,
  question,
  note,
  confirmLabel = "Confirm",
  pendingLabel = "Working...",
  loading,
  onConfirm,
  icon: Icon = Trash2,
}: {
  title: string;
  description: string;
  triggerLabel: string;
  question: string;
  note?: string;
  confirmLabel?: string;
  pendingLabel?: string;
  loading?: boolean;
  onConfirm: () => void | Promise<void>;
  icon?: LucideIcon;
}) {
  const [confirming, setConfirming] = useState(false);

  return (
    <Panel className="border-destructive/30" padded>
      <div className="space-y-4">
        <div>
          <h2 className="text-base font-semibold text-destructive">{title}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        </div>

        {!confirming ? (
          <Button variant="destructive" onClick={() => setConfirming(true)}>
            <Icon />
            {triggerLabel}
          </Button>
        ) : (
          <div className="space-y-3 rounded-xl border border-destructive/30 bg-destructive/5 p-4">
            <p className="text-sm font-medium">{question}</p>
            {note && <p className="text-xs text-muted-foreground">{note}</p>}

            <div className="flex flex-col gap-2 sm:flex-row">
              <Button
                variant="destructive"
                onClick={onConfirm}
                disabled={loading}
                className="sm:w-auto"
              >
                {loading ? <Loader2 className="animate-spin" /> : <Icon />}
                {loading ? pendingLabel : confirmLabel}
              </Button>
              <Button
                variant="outline"
                onClick={() => setConfirming(false)}
                disabled={loading}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </div>
    </Panel>
  );
}

/* -------------------------------------------------------------------------- */
/*  Pagination                                                                 */
/* -------------------------------------------------------------------------- */

export function Pagination({
  page,
  totalPages,
  total,
  itemLabel = "items",
  loading,
  onPrev,
  onNext,
}: {
  page: number;
  totalPages: number;
  total: number;
  itemLabel?: string;
  loading?: boolean;
  onPrev: () => void;
  onNext: () => void;
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-center text-sm text-muted-foreground sm:text-left">
        Page {page} of {Math.max(totalPages, 1)}
        {" · "}
        {total} {itemLabel}
      </p>

      <div className="flex w-full items-center gap-2 sm:w-auto">
        <Button
          variant="outline"
          size="sm"
          onClick={onPrev}
          className="flex-1 sm:flex-none"
          disabled={page <= 1 || loading}
        >
          <ArrowLeft />
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onNext}
          className="flex-1 sm:flex-none"
          disabled={page >= totalPages || loading || totalPages === 0}
        >
          Next
          <ArrowRight />
        </Button>
      </div>
    </div>
  );
}