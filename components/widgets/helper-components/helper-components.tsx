import { dotClasses, toneClasses } from "@/lib/constants/helper-constants";
import { Tone } from "@/lib/types/helper.type";

export function Panel({
  title,
  description,
  icon,
  children,
}: {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-3xl border bg-card p-6 shadow-sm">
      <header className="mb-6 flex items-start gap-3">
        {icon && (
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-600 [&_svg]:size-5">
            {icon}
          </span>
        )}
        <div>
          <h2 className="text-base font-semibold tracking-tight">{title}</h2>
          {description && (
            <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>
          )}
        </div>
      </header>
      {children}
    </section>
  );
}

export function StatTile({
  icon,
  label,
  value,
  hint,
  tone = "neutral",
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  hint?: string;
  tone?: Tone;
}) {
  return (
    <div className="rounded-2xl border bg-card p-4 shadow-sm transition hover:shadow-md">
      <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground [&_svg]:size-4">
        <span className="flex size-8 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-600">
          {icon}
        </span>
        {label}
      </div>
      <p className="mt-3 flex items-center gap-2 text-xl font-semibold tracking-tight">
        {tone !== "neutral" && (
          <span className={`size-2 rounded-full ${dotClasses[tone]}`} />
        )}
        {value}
      </p>
      {hint && <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

export function Pill({
  children,
  tone = "neutral",
  dot,
}: {
  children: React.ReactNode;
  tone?: Tone;
  dot?: boolean;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset ${toneClasses[tone]}`}
    >
      {dot && <span className={`size-1.5 rounded-full ${dotClasses[tone]}`} />}
      {children}
    </span>
  );
}

export function GlassPill({
  children,
  icon,
  dotClass,
}: {
  children: React.ReactNode;
  icon?: React.ReactNode;
  dotClass?: string;
}) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-medium ring-1 ring-white/20 backdrop-blur">
      {dotClass && <span className={`size-1.5 rounded-full ${dotClass}`} />}
      {icon}
      {children}
    </span>
  );
}

export function InfoItem({
  icon,
  label,
  value,
  mono,
}: {
  icon: React.ReactNode;
  label: string;
  value?: string | null;
  mono?: boolean;
}) {
  const empty = !value;

  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground [&_svg]:size-4">
        {icon}
      </div>

      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p
          className={`mt-0.5 break-words text-sm font-medium ${
            empty ? "text-muted-foreground/70" : ""
          } ${mono && !empty ? "font-mono tracking-tight" : ""}`}
        >
          {value || "Not provided"}
        </p>
      </div>
    </div>
  );
}

export function BreakdownRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-semibold">{value}</dd>
    </div>
  );
}

export function EmptyState({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div className="rounded-3xl border border-dashed bg-card/50 p-12 text-center">
      <span className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground [&_svg]:size-6">
        {icon}
      </span>
      <p className="mt-4 text-sm font-semibold">{title}</p>
      <p className="mt-1 text-xs text-muted-foreground">{body}</p>
    </div>
  );
}