import Link from "next/link";
import {
  ArrowLeft,
  ArrowUpRight,
  Clock,
  KeyRound,
  LifeBuoy,
  Mail,
  MessageCircle,
  Phone,
  ShieldQuestion,
  Store,
} from "lucide-react";

import { BASICSYSTEMDATA } from "@/lib/constants/helper-constants";

const SUPPORT = {
  email: "support@example.com",
  phone: "+94 77 000 0000",
  whatsapp: "94770000000", // digits only, no "+"
  hours: "Mon–Fri, 9:00 AM – 6:00 PM (GMT+5:30)",
};

const channels = [
  {
    icon: Mail,
    title: "Email",
    value: SUPPORT.email,
    hint: "We reply within one business day",
    href: `mailto:${SUPPORT.email}?subject=Sign-in%20help`,
  },
  {
    icon: Phone,
    title: "Phone",
    value: SUPPORT.phone,
    hint: "Fastest for urgent access issues",
    href: `tel:${SUPPORT.phone.replace(/\s/g, "")}`,
  },
  {
    icon: MessageCircle,
    title: "WhatsApp",
    value: "Chat with us",
    hint: "Quick answers, screenshots welcome",
    href: `https://wa.me/${SUPPORT.whatsapp}`,
  },
];

const issues = [
  {
    icon: Store,
    title: "I forgot my shop code",
    body: "Your shop code was sent when your shop was registered. Ask your shop administrator, or contact us with your shop name and registered email.",
  },
  {
    icon: KeyRound,
    title: "I can't sign in",
    body: "Check that your shop code, email and password are correct. If it still fails, your account may be locked. Contact your shop administrator to reset it.",
  },
  {
    icon: ShieldQuestion,
    title: "My account was disabled",
    body: "Only your shop administrator can re-enable accounts. If you are the administrator, reach out to us and we'll verify and restore access.",
  },
];

export default function HelapozSupport() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-background">
      {/* Ambient glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 left-1/2 size-[36rem] -translate-x-1/2 rounded-full bg-indigo-500/10 blur-3xl"
      />

      <div className="relative mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-16">
        {/* Back link */}
        <Link
          href="/login"
          className="group inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-0.5" />
          Back to sign in
        </Link>

        {/* Hero */}
        <header className="mt-8 max-w-2xl">
          <span className="flex size-12 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/30">
            <LifeBuoy className="size-6" />
          </span>

          <h1 className="mt-6 text-3xl font-semibold tracking-tight sm:text-4xl">
            How can {BASICSYSTEMDATA.appName} help?
          </h1>

          <p className="mt-3 text-base text-muted-foreground">
            Locked out, lost your shop code, or something not working? Reach
            our team through any channel below.
          </p>

          <p className="mt-4 inline-flex items-center gap-2 rounded-full border bg-background px-3 py-1.5 text-xs text-muted-foreground">
            <Clock className="size-3.5 text-indigo-600" />
            {SUPPORT.hours}
          </p>
        </header>

        {/* Contact channels */}
        <section aria-labelledby="contact-heading" className="mt-12">
          <h2
            id="contact-heading"
            className="text-xs font-medium uppercase tracking-widest text-muted-foreground"
          >
            Contact us
          </h2>

          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {channels.map(({ icon: Icon, title, value, hint, href }) => (
              <a
                key={title}
                href={href}
                target={href.startsWith("http") ? "_blank" : undefined}
                rel={href.startsWith("http") ? "noreferrer" : undefined}
                className="group relative flex flex-col overflow-hidden rounded-2xl border bg-gradient-to-br from-indigo-500/[0.07] via-transparent to-transparent p-5 transition-all hover:border-indigo-500/50 hover:shadow-lg hover:shadow-indigo-500/10 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-500/15"
              >
                <div className="flex items-start justify-between">
                  <span className="flex size-10 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-600 transition-colors group-hover:bg-indigo-600 group-hover:text-white">
                    <Icon className="size-5" />
                  </span>

                  <ArrowUpRight className="size-4 text-muted-foreground transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-indigo-600" />
                </div>

                <p className="mt-5 text-sm font-semibold">{title}</p>
                <p className="mt-0.5 truncate text-sm text-foreground/80">
                  {value}
                </p>
                <p className="mt-2 text-xs text-muted-foreground">{hint}</p>
              </a>
            ))}
          </div>
        </section>

        {/* Common issues */}
        <section aria-labelledby="issues-heading" className="mt-12">
          <h2
            id="issues-heading"
            className="text-xs font-medium uppercase tracking-widest text-muted-foreground"
          >
            Common issues
          </h2>

          <div className="mt-4 divide-y overflow-hidden rounded-2xl border">
            {issues.map(({ icon: Icon, title, body }) => (
              <div key={title} className="flex gap-4 p-5">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-600">
                  <Icon className="size-4" />
                </span>

                <div>
                  <h3 className="text-sm font-semibold">{title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                    {body}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Footer CTA */}
        <div className="mt-12 flex flex-col items-start justify-between gap-4 rounded-2xl bg-indigo-600 p-6 text-white shadow-lg shadow-indigo-600/20 sm:flex-row sm:items-center">
          <div>
            <p className="text-base font-semibold">Remembered your details?</p>
            <p className="mt-0.5 text-sm text-white/75">
              Head back and sign in to your shop account.
            </p>
          </div>

          <Link
            href="/login"
            className="inline-flex h-11 items-center gap-2 rounded-xl bg-white px-5 text-sm font-semibold text-indigo-700 transition-colors hover:bg-white/90 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/30"
          >
            Sign in
            <ArrowUpRight className="size-4" />
          </Link>
        </div>
      </div>
    </main>
  );
}