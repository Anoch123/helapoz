import { Field } from "@workspace/ui/components/ui/field";
import { Input } from "@workspace/ui/components/ui/input";
import { Button } from "@workspace/ui/components/ui/button";

export default function LoginComponent() {
  return (
    <div className="space-y-8 font-sans antialiased">
      <div className="w-full max-w-sm space-y-8">
        <form className="space-y-5">
          <Field className="space-y-2">
            <Input
              id="email"
              type="email"
              placeholder="Email"
              autoComplete="email"
              required
              className="h-12 rounded-xl border-0 bg-muted/60 px-4 shadow-none transition-colors placeholder:text-muted-foreground/60 focus-visible:bg-muted focus-visible:ring-2 focus-visible:ring-primary/30"
            />
          </Field>

          <Field className="space-y-2">
            <Input
              id="password"
              type="password"
              placeholder="Password"
              autoComplete="current-password"
              required
              className="h-12 rounded-xl border-0 bg-muted/60 px-4 shadow-none transition-colors placeholder:text-muted-foreground/60 focus-visible:bg-muted focus-visible:ring-2 focus-visible:ring-primary/30"
            />
          </Field>

          <Button
            type="submit"
            className="h-12 w-full rounded-xl bg-blue-600 text-sm font-semibold text-white shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-xl active:translate-y-0"
          >
            Sign in
          </Button>
        </form>
      </div>
    </div>
  );
}
