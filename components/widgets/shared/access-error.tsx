import Link from "next/link";
import { ShieldAlert } from "lucide-react";

type AccessErrorProps = {
  title?: string;
  message: string;
  actionHref?: string;
  actionLabel?: string;
};

export default function AccessError({
  title = "Access Restricted",
  message,
  actionHref = "/dashboard",
  actionLabel = "Back to Dashboard",
}: AccessErrorProps) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center p-6">
      <div className="w-full max-w-md rounded-xl border bg-card p-8 text-center shadow-sm">
        <div className="mx-auto mb-5 flex size-14 items-center justify-center rounded-full bg-destructive/10">
          <ShieldAlert className="size-7 text-destructive" />
        </div>

        <h2 className="text-xl font-semibold tracking-tight">
          {title}
        </h2>

        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          {message}
        </p>

        <Link
          href={actionHref}
          className="mt-6 inline-flex h-10 items-center justify-center rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          {actionLabel}
        </Link>
      </div>
    </div>
  );
}