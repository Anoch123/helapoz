"use client";

import { useState } from "react";
import { KeyRound, Loader2, Lock } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { InlineAlert } from "../widgets/layouts/page-kit";

type PasswordResetModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Called with the validated new password. Return a truthy value on success. */
  onSubmit: (password: string) => Promise<unknown> | unknown;
  isSubmitting?: boolean;
  /** Shown in the description, e.g. "Set a new password for John." */
  targetName?: string;
  minLength?: number;
  title?: string;
  submitLabel?: string;
};

export default function PasswordResetModal({
  open,
  onOpenChange,
  onSubmit,
  isSubmitting = false,
  targetName,
  minLength = 8,
  title = "Reset Password",
  submitLabel = "Reset Password",
}: PasswordResetModalProps) {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  function close() {
    onOpenChange(false);
    setNewPassword("");
    setConfirmPassword("");
    setError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (newPassword.length < minLength) {
      setError(`Password must be at least ${minLength} characters.`);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    const result = await onSubmit(newPassword);

    if (result) {
      close();
    } else {
      setError("Couldn't reset the password. Please try again.");
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => (next ? onOpenChange(true) : close())}
    >
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit} className="space-y-4">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>
              {targetName
                ? `Set a new password for ${targetName}.`
                : "Set a new password."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <div className="space-y-1.5">
              <label htmlFor="new-password" className="text-sm font-medium">
                New password
              </label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="new-password"
                  type="password"
                  autoComplete="new-password"
                  className="pl-9"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder={`At least ${minLength} characters`}
                  disabled={isSubmitting}
                  autoFocus
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="confirm-password" className="text-sm font-medium">
                Confirm password
              </label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="confirm-password"
                  type="password"
                  autoComplete="new-password"
                  className="pl-9"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  disabled={isSubmitting}
                />
              </div>
            </div>

            {error && <InlineAlert>{error}</InlineAlert>}
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={close}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !newPassword || !confirmPassword}
            >
              {isSubmitting ? (
                <Loader2 className="animate-spin" />
              ) : (
                <KeyRound />
              )}
              {isSubmitting ? "Resetting..." : submitLabel}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}