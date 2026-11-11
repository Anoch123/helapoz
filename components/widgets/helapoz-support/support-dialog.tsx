"use client";

import {
  ArrowUpRight,
  Clock,
  KeyRound,
  LifeBuoy,
  Mail,
  MessageCircle,
  Phone,
  Store,
} from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { BASICSYSTEMDATA, channels, tips } from "@/lib/constants/helper-constants";

export function SupportDialog() {
  return (
    <Dialog>
      {/* Base UI's DialogTrigger already renders a <button>, so style it directly. */}
      <DialogTrigger className="group relative mt-4 flex w-full items-center gap-4 overflow-hidden rounded-2xl border bg-gradient-to-br from-indigo-500/[0.07] via-transparent to-transparent p-4 text-left transition-all hover:border-indigo-500/50 hover:shadow-lg hover:shadow-indigo-500/10 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-500/15">
        <span
          aria-hidden
          className="pointer-events-none absolute -right-8 -top-8 size-28 rounded-full bg-indigo-500/10 blur-2xl"
        />

        <span className="relative flex size-11 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-600/30">
          <LifeBuoy className="size-5" />
        </span>

        <span className="relative min-w-0 flex-1">
          <span className="block text-sm font-semibold text-foreground">
            Contact {BASICSYSTEMDATA.appNameCapitalize} support
          </span>
          <span className="mt-0.5 block text-xs text-muted-foreground">
            Locked out or can&apos;t find your shop code?
          </span>
        </span>

        <span className="relative flex size-8 shrink-0 items-center justify-center rounded-full border bg-background text-muted-foreground transition-all group-hover:border-indigo-600 group-hover:bg-indigo-600 group-hover:text-white">
          <ArrowUpRight className="size-4" />
        </span>
      </DialogTrigger>

      <DialogContent className="gap-0 overflow-hidden rounded-2xl p-0 sm:max-w-md">
        {/* Header */}
        <DialogHeader className="relative overflow-hidden border-b bg-gradient-to-br from-indigo-500/10 via-transparent to-transparent p-6 text-left">
          <span
            aria-hidden
            className="pointer-events-none absolute -right-10 -top-10 size-32 rounded-full bg-indigo-500/15 blur-2xl"
          />

          <span className="relative flex size-11 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-600/30">
            <LifeBuoy className="size-5" />
          </span>

          <DialogTitle className="relative mt-4 text-xl font-semibold tracking-tight">
            How can we help?
          </DialogTitle>

          <DialogDescription className="relative">
            Reach the {BASICSYSTEMDATA.appNameCapitalize} team through any channel below.
          </DialogDescription>

          <p className="relative mt-1 inline-flex w-fit items-center gap-2 rounded-full border bg-background px-3 py-1 text-xs text-muted-foreground">
            <Clock className="size-3.5 text-indigo-600" />
            {BASICSYSTEMDATA.hours}
          </p>
        </DialogHeader>

        <div className="space-y-6 p-6">
          {/* Channels */}
          <div className="space-y-2">
            {channels.map(({ icon: Icon, title, value, href }) => (
              <a
                key={title}
                href={href}
                target={href.startsWith("http") ? "_blank" : undefined}
                rel={href.startsWith("http") ? "noreferrer" : undefined}
                className="group flex items-center gap-3 rounded-xl border p-3 transition-all hover:border-indigo-500/50 hover:bg-indigo-500/5 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-500/15"
              >
                <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-600 transition-colors group-hover:bg-indigo-600 group-hover:text-white">
                  <Icon className="size-4" />
                </span>

                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-medium">{title}</span>
                  <span className="block truncate text-xs text-muted-foreground">
                    {value}
                  </span>
                </span>

                <ArrowUpRight className="size-4 text-muted-foreground transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-indigo-600" />
              </a>
            ))}
          </div>

          {/* Quick tips */}
          <div>
            <p className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
              Quick fixes
            </p>

            <ul className="mt-3 space-y-3">
              {tips.map(({ icon: Icon, title, body }) => (
                <li key={title} className="flex gap-3">
                  <Icon className="mt-0.5 size-4 shrink-0 text-indigo-600" />
                  <div>
                    <p className="text-sm font-medium">{title}</p>
                    <p className="text-xs leading-relaxed text-muted-foreground">
                      {body}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}