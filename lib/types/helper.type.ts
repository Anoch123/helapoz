import { AlertCircle, LucideIcon } from "lucide-react";

export type Tone = "success" | "info" | "warning" | "danger" | "neutral";

export type TabKey = "overview" | "subscription" | "permissions";

export type SubscriptionAccessScreenProps = {
  code: string;
};

export type MessageConfig = {
  title: string;
  description: string;
  detail: string;
  icon: LucideIcon;
  status: string;
  tone: Tone;
  canRetry?: boolean;
};

export type ShopAccessScreenProps = {
  code: string;
};

export type AccessMessage = {
  title: string;
  description: string;
  action: string;
  icon: typeof AlertCircle;
};