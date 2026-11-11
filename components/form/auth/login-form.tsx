"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, Eye, EyeOff, Loader2 } from "lucide-react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";

import { shopLoginSchema } from "@/lib/validations/auth.validation";
import { useShopLogin } from "@/hooks/useShopLogin";
import { SupportDialog } from "@/components/widgets/helapoz-support/support-dialog";
import { inputClass, inputGroupClass } from "@/lib/constants/helper-constants";

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

      <form onSubmit={handleSubmit} noValidate className="mt-6">
        <FieldGroup className="gap-4">
          <Field data-invalid={!!errors.shopCode}>
            <FieldLabel htmlFor="shopCode">Shop code</FieldLabel>
            <Input
              id="shopCode"
              placeholder="Enter your shop code"
              value={form.shopCode}
              onChange={(e) => handleChange("shopCode", e.target.value)}
              disabled={isPending}
              aria-invalid={!!errors.shopCode}
              className={`${inputClass} font-mono`}
            />
            <FieldError>{errors.shopCode}</FieldError>
          </Field>

          <Field data-invalid={!!errors.email}>
            <FieldLabel htmlFor="email">Email address</FieldLabel>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              autoComplete="username"
              value={form.email}
              onChange={(e) => handleChange("email", e.target.value)}
              disabled={isPending}
              aria-invalid={!!errors.email}
              className={inputClass}
            />
            <FieldError>{errors.email}</FieldError>
          </Field>

          <Field data-invalid={!!errors.password}>
            <FieldLabel htmlFor="password">Password</FieldLabel>
            <InputGroup className={inputGroupClass}>
              <InputGroupInput
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                autoComplete="current-password"
                value={form.password}
                onChange={(e) => handleChange("password", e.target.value)}
                disabled={isPending}
                aria-invalid={!!errors.password}
                className="px-4"
              />
              <InputGroupAddon align="inline-end">
                <InputGroupButton
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => setShowPassword((previous) => !previous)}
                  disabled={isPending}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="rounded-lg"
                >
                  {showPassword ? <EyeOff /> : <Eye />}
                </InputGroupButton>
              </InputGroupAddon>
            </InputGroup>
            <FieldError>{errors.password}</FieldError>
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
        </FieldGroup>
      </form>

      <div className="mt-8">
        <div className="flex items-center gap-3">
          <span className="h-px flex-1 bg-border" />
          <span className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
            Need help?
          </span>
          <span className="h-px flex-1 bg-border" />
        </div>

        <SupportDialog />
      </div>
    </div>
  );
}