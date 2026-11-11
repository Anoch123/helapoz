import { Building2, Clock, Phone, ShieldCheck } from "lucide-react";

import { ShopAccessScreenProps } from "@/lib/types/helper.type";
import {
  accessMessages,
  BASICSYSTEMDATA,
  fallbackMessage,
} from "@/lib/constants/helper-constants";

export default function ShopAccessScreen({ code }: ShopAccessScreenProps) {
  const message = accessMessages[code] ?? fallbackMessage;
  const Icon = message.icon;

  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/30 px-4 py-10">
      <div className="w-full max-w-md space-y-6">
        {/* Branding */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-2.5">
            <span className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 text-white shadow-md shadow-indigo-600/30">
              <Building2 className="size-5" />
            </span>
            <span className="text-xl font-semibold tracking-tight">
              {BASICSYSTEMDATA.appNameCapitalize}
            </span>
          </div>
        </div>

        {/* Card */}
        <div className="overflow-hidden rounded-3xl border bg-card shadow-xl shadow-slate-900/5">
          <div className="h-1.5 bg-gradient-to-r from-red-500 via-rose-500 to-red-400" />

          <div className="px-6 py-9 text-center sm:px-9">
            <span className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
              <Icon className="size-8" />
            </span>

            <span className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-destructive/10 px-3 py-1 text-xs font-semibold text-destructive">
              <span className="size-1.5 rounded-full bg-destructive" />
              Access Restricted
            </span>

            <h1 className="mt-3 text-2xl font-semibold tracking-tight">
              {message.title}
            </h1>

            <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
              {message.description}
            </p>

            <div className="mt-7 rounded-2xl border bg-muted/40 p-4 text-left">
              <div className="flex gap-3">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-600">
                  <Clock className="size-4" />
                </span>
                <div>
                  <p className="text-sm font-semibold">What should you do?</p>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">
                    {message.action}
                  </p>
                </div>
              </div>
            </div>

            {BASICSYSTEMDATA.phone && (
              <a
                href={`tel:${String(BASICSYSTEMDATA.phone).replace(/\s/g, "")}`}
                className="mt-4 flex items-center gap-3 rounded-2xl border bg-background p-4 text-left transition hover:bg-muted/60"
              >
                <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-sm shadow-indigo-600/30">
                  <Phone className="size-4" />
                </span>
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">Call support</p>
                  <p className="text-sm font-semibold tracking-tight">
                    {BASICSYSTEMDATA.phone}
                  </p>
                </div>
              </a>
            )}

            <div className="mt-7 border-t pt-5">
              <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                <ShieldCheck className="size-4 text-emerald-600" />
                <span>Your shop data remains protected.</span>
              </div>

              <p className="mt-3 text-xs leading-5 text-muted-foreground">
                If you believe this is a mistake, please contact{" "}
                {BASICSYSTEMDATA.appNameCapitalize} support.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}