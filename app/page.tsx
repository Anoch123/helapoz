import { BarChart3, Lock, Receipt, Store, Users } from "lucide-react";

import { LoginForm } from "@/components/form/auth/login-form";
import { BASICSYSTEMDATA, features } from "@/lib/constants/helper-constants";

export default function LoginPage() {
  return (
    <main className="grid min-h-dvh lg:h-dvh lg:grid-cols-[1.05fr_1fr] lg:overflow-hidden">
      {/* --------------------------- Brand panel --------------------------- */}
      <aside className="relative hidden flex-col justify-between overflow-hidden bg-gradient-to-br from-indigo-700 via-indigo-600 to-violet-700 p-10 text-white lg:flex xl:p-12">
        <div
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              "radial-gradient(rgba(255,255,255,0.35) 1px, transparent 1px)",
            backgroundSize: "24px 24px",
            maskImage:
              "radial-gradient(ellipse at 30% 40%, black 20%, transparent 75%)",
            WebkitMaskImage:
              "radial-gradient(ellipse at 30% 40%, black 20%, transparent 75%)",
          }}
        />
        <div className="pointer-events-none absolute -right-32 -top-32 size-[26rem] rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-40 -left-20 size-[26rem] rounded-full bg-violet-400/25 blur-3xl" />

        <div className="relative flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-white/15 ring-1 ring-inset ring-white/25">
            <Store className="size-5" />
          </div>
          <span className="text-lg font-semibold tracking-widest">
            {BASICSYSTEMDATA.appName}
          </span>
        </div>

        <div className="relative space-y-8">
          <div className="max-w-lg">
            <h1 className="text-3xl font-semibold leading-tight tracking-tight xl:text-4xl">
              Everything your shop needs, in one place.
            </h1>
            <p className="mt-3 text-sm leading-6 text-indigo-100/85 xl:text-base">
              Manage billing, staff and reporting from a single, secure
              dashboard.
            </p>
          </div>
        </div>

        <ul className="relative flex flex-wrap gap-x-8 gap-y-3 border-t border-white/15 pt-6 text-sm text-indigo-50">
          {features .map((f) => {
            const Icon = f.icon;
            return (
              <li key={f.label} className="flex items-center gap-2.5">
                <Icon className="size-4 text-indigo-200" />
                {f.label}
              </li>
            );
          })}
        </ul>
      </aside>

      {/* ------------------------------ Form ------------------------------ */}
      <section className="flex min-h-0 flex-col bg-background px-5 py-6 sm:px-10 lg:py-7">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-3 lg:invisible">
            <div className="flex size-9 items-center justify-center rounded-xl bg-indigo-600 text-white">
              <Store className="size-5" />
            </div>
            <span className="font-semibold">{BASICSYSTEMDATA.appName}</span>
          </div>

          <span className="inline-flex items-center gap-1.5 rounded-full border bg-muted/40 px-3 py-1.5 text-xs text-muted-foreground">
            <Lock className="size-3.5" />
            Secure sign-in
          </span>
        </header>

        <div className="flex flex-1 items-center justify-center py-6">
          <div className="w-full max-w-md">
            <LoginForm />
          </div>
        </div>
      </section>
    </main>
  );
}