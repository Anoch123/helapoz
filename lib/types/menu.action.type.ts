import { LucideIcon } from "lucide-react";

export type MenuAction = {
  label: string;
  icon: LucideIcon;
  href?: string;
  onSelect?: () => void;
};