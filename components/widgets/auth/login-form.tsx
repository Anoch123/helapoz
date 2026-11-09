"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, Eye, EyeOff, Loader2 } from "lucide-react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { shopLoginSchema } from "@/lib/validations/auth.validation";
import { useShopLogin } from "@/hooks/useShopLogin";

/* Shared shadcn Input styling: taller, rounded, indigo focus ring. */
const inputClass =
  "h-12 rounded-xl px-4 focus-visible:border-indigo-500 focus-visible:ring-4 focus-visible:ring-indigo-500/15";

function Field({
  label,
  htmlFor,
  error,
  children,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={htmlFor}>{label}</Label>

      {children}

      {error && (
        <p id={`${htmlFor}-error`} className="text-xs text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}

export function LoginForm() {
  const router = useRouter();
  const { login, isPending } = useShopLogin();

  const [form, setForm] = useState({
    shopCode: "",
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  function handleChange(field: keyof typeof form, value: string) {
    setForm((previous) => ({ ...previous, [field]: value }));
    setErrors((previous) => ({ ...previous, [field]: "" }));
    setFormError("");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setErrors({});
    setFormError("");

    const validation = shopLoginSchema.safeParse(form);

    if (!validation.success) {
      const fieldErrors: Record<string, string> = {};

      for (const issue of validation.error.issues) {
        const field = String(issue.path[0]);

        if (!fieldErrors[field]) {
          fieldErrors[field] = issue.message;
        }
      }

      setErrors(fieldErrors);
      return;
    }

    const result = await login(validation.data);

    if (!result.success) {
      setFormError(result.message || "Unable to sign in. Please try again.");
      return;
    }

    router.replace("/dashboard");
    router.refresh();
  }

  return (
    <div>
      <h2 className="text-2xl font-semibold tracking-tight">Welcome back</h2>

      <p className="mt-1.5 text-sm text-muted-foreground">
        Sign in with your shop account to continue.
      </p>

      <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-4">
        <Field label="Shop code" htmlFor="shopCode" error={errors.shopCode}>
          <Input
            id="shopCode"
            placeholder="Enter your shop code"
            value={form.shopCode}
            onChange={(e) => handleChange("shopCode", e.target.value)}
            disabled={isPending}
            aria-invalid={!!errors.shopCode}
            aria-describedby={errors.shopCode ? "shopCode-error" : undefined}
            className={`${inputClass} font-mono`}
          />
        </Field>

        <Field label="Email address" htmlFor="email" error={errors.email}>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            autoComplete="username"
            value={form.email}
            onChange={(e) => handleChange("email", e.target.value)}
            disabled={isPending}
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? "email-error" : undefined}
            className={inputClass}
          />
        </Field>

        <Field label="Password" htmlFor="password" error={errors.password}>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              autoComplete="current-password"
              value={form.password}
              onChange={(e) => handleChange("password", e.target.value)}
              disabled={isPending}
              aria-invalid={!!errors.password}
              aria-describedby={errors.password ? "password-error" : undefined}
              className={`${inputClass} pr-12`}
            />

            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => setShowPassword((previous) => !previous)}
              disabled={isPending}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute right-1.5 top-1/2 size-9 -translate-y-1/2 rounded-lg text-muted-foreground hover:text-foreground"
            >
              {showPassword ? (
                <EyeOff className="size-4" />
              ) : (
                <Eye className="size-4" />
              )}
            </Button>
          </div>
        </Field>

        {formError && (
          <Alert variant="destructive" className="rounded-xl">
            <AlertCircle className="size-4" />
            <AlertDescription>{formError}</AlertDescription>
          </Alert>
        )}

        <Button
          type="submit"
          disabled={isPending}
          className="h-12 w-full rounded-xl bg-indigo-600 text-sm font-semibold hover:bg-indigo-700"
        >
          {isPending ? (
            <>
              <Loader2 className="mr-2 size-4 animate-spin" />
              Signing in
            </>
          ) : (
            "Sign in"
          )}
        </Button>
      </form>

      <div className="mt-6 border-t pt-5 text-center text-sm text-muted-foreground">
        Having trouble signing in? Contact your shop administrator.
      </div>
    </div>
  );
}