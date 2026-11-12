import { AlertCircle, ArrowLeftRight, BarChart3, Building2, CalendarX, Clock, CreditCard, KeyRound, LayoutDashboard, LockKeyhole, LogIn, Mail, MessageCircle, Phone, Printer, Receipt, Settings, ShieldAlert, ShieldQuestion, Store, UserCircle, UserRound, UserRoundX, Users, UserX, Wallet } from "lucide-react";
import { MenuAction } from "../types/menu.action.type";
import { AccessMessage, MessageConfig, Tone } from "../types/helper.type";

export const BASICSYSTEMDATA = {
    'appTitle': 'Helapoz - Pos System',
    'appName': 'HELAPOZ',
    'appNameCapitalize': 'Helapoz',
    'appDescription': 'HELAPOZ is a modern and efficient point-of-sale (POS) system designed to streamline business operations and enhance customer experiences. With its user-friendly interface and powerful features, HELAPOZ empowers businesses to manage sales, inventory, and customer interactions seamlessly.',
    'appKeywords': 'HELAPOZ, POS, point-of-sale, business management, inventory control, customer engagement, sales tracking, modern POS system, efficient business operations, user-friendly interface',
    'email': 'support@helapoz.com',
    'phone': "+94 76 344 3826",
    'whatsapp': "94770000000",
    'hours': "Mon–Fri, 9:00 AM – 6:00 PM (GMT+5:30)",
}

export const navigationItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Staff Management",
    href: "/staff",
    icon: Users,
  },
  {
    title: "Sales",
    href: "/sales",
    icon: Users,
  },
];

export const channels = [
  {
    icon: Mail,
    title: "Email",
    value: BASICSYSTEMDATA.email,
    hint: "We reply within one business day",
    href: `mailto:${BASICSYSTEMDATA.email}?subject=Sign-in%20help`,
  },
  {
    icon: Phone,
    title: "Phone",
    value: BASICSYSTEMDATA.phone,
    hint: "Fastest for urgent access issues",
    href: `tel:${BASICSYSTEMDATA.phone.replace(/\s/g, "")}`,
  },
  {
    icon: MessageCircle,
    title: "WhatsApp",
    value: "Chat with us",
    hint: "Quick answers, screenshots welcome",
    href: `https://wa.me/${BASICSYSTEMDATA.whatsapp}`,
  },
];

export const tips = [
  {
    icon: Store,
    title: "Forgot your shop code?",
    body: "Ask your shop administrator, or contact us with your shop name.",
  },
  {
    icon: KeyRound,
    title: "Can't sign in?",
    body: "Double-check all three fields. If it still fails, your account may be locked.",
  },
];

export const features = [
  { label: "Fast billing", icon: Receipt },
  { label: "Staff management", icon: Users },
  { label: "Business insights", icon: BarChart3 },
];

export const issues = [
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

export const inputClass =
  "h-12 rounded-xl px-4 focus-visible:border-indigo-500 focus-visible:ring-4 focus-visible:ring-indigo-500/15";

export const inputGroupClass =
  "h-12 rounded-xl has-[[data-slot=input-group-control]:focus-visible]:border-indigo-500 has-[[data-slot=input-group-control]:focus-visible]:ring-4 has-[[data-slot=input-group-control]:focus-visible]:ring-indigo-500/15";

export const iconBtn =
    "relative flex size-10 items-center justify-center rounded-xl border bg-background text-muted-foreground transition hover:bg-muted hover:text-foreground";

export const notifications = [
  { id: 1, title: "Low stock: Milk packet 1L", meta: "4 left · 5 min ago", tone: "bg-amber-500" },
  { id: 2, title: "Order #1044 refunded", meta: "Approved by manager · 41 min ago", tone: "bg-red-500" },
  { id: 3, title: "Card terminal reconnected", meta: "Terminal 2 · 1 hr ago", tone: "bg-emerald-500" },
];

export const shiftActions: MenuAction[] = [
    { label: "Cash in / out", icon: Wallet, onSelect: () => {} },
    { label: "Print last receipt", icon: Printer, onSelect: () => {} },
    { label: "Shift summary", icon: Receipt, href: "/dashboard/shifts" },
  ];

export const accountActions: MenuAction[] = [
    { label: "My profile", icon: UserCircle, href: "/helapoz-profile" },
    { label: "Settings", icon: Settings, href: "/helapoz-settings" },
    { label: "Switch cashier", icon: ArrowLeftRight, onSelect: () => {} },
    { label: "Lock screen", icon: LockKeyhole, onSelect: () => {} },
  ];


export const BILLING_CYCLE_DAYS = 30; // used for the renewal progress bar
  
export const toneClasses: Record<Tone, string> = {
    success:
      "bg-emerald-500/10 text-emerald-400 ring-emerald-500/25 dark:text-emerald-400",
    info: "bg-indigo-500/10 text-indigo-700 ring-indigo-500/25 dark:text-indigo-300",
    warning:
      "bg-amber-500/10 text-amber-700 ring-amber-500/25 dark:text-amber-400",
    danger: "bg-red-500/10 text-red-700 ring-red-500/25 dark:text-red-400",
    neutral: "bg-muted text-muted-foreground ring-border",
  };
  
export const dotClasses: Record<Tone, string> = {
    success: "bg-emerald-500",
    info: "bg-indigo-500",
    warning: "bg-amber-500",
    danger: "bg-red-500",
    neutral: "bg-muted-foreground",
  };
  
export const statusTone = (status?: string | null): Tone => {
    switch ((status ?? "").toLowerCase()) {
      case "active":
        return "success";
      case "trialing":
      case "trial":
        return "info";
      case "past_due":
      case "pending":
      case "invited":
        return "warning";
      case "canceled":
      case "cancelled":
      case "expired":
      case "suspended":
      case "inactive":
        return "danger";
      default:
        return "neutral";
    }
  };

  export const accessMessages: Record<string, AccessMessage> = {
  SHOP_SESSION_CHECK_FAILED: {
    title: "Unable to Verify Your Session",
    description:
      "We couldn't verify your shop session right now.",
    action:
      "Please try logging in again. If this continues, contact Helapoz support.",
    icon: ShieldAlert,
  },

  SHOP_UNAVAILABLE: {
    title: "Shop Unavailable",
    description:
      "Your shop is currently unavailable. Access to the POS system has been restricted.",
    action:
      "Please contact Helapoz support for assistance.",
    icon: Building2,
  },

  SHOP_LOOKUP_FAILED: {
    title: "Unable to Verify Shop",
    description:
      "We couldn't verify your shop information right now.",
    action:
      "Please try again later. Contact Helapoz support if the issue continues.",
    icon: AlertCircle,
  },

  MEMBERSHIP_INACTIVE: {
    title: "Account Access Restricted",
    description:
      "Your membership in this shop is inactive or unavailable.",
    action:
      "Please contact your Shop Admin or Helapoz support.",
    icon: UserRoundX,
  },

  MEMBERSHIP_LOOKUP_FAILED: {
    title: "Unable to Verify Membership",
    description:
      "We couldn't verify your shop membership right now.",
    action:
      "Please try again later. Contact Helapoz support if the issue continues.",
    icon: AlertCircle,
  },

  INVALID_MEMBERSHIP_ROLE: {
    title: "Account Configuration Error",
    description:
      "Your account has an invalid shop membership role.",
    action:
      "Please contact Helapoz support to resolve this issue.",
    icon: ShieldAlert,
  },

  EXPIRED: {
    title: "Subscription Expired",
    description:
      "Your shop subscription has expired. Access to Helapoz POS is currently unavailable.",
    action:
      "Please contact Helapoz support to renew your subscription.",
    icon: CalendarX,
  },

  PAYMENT_REQUIRED: {
    title: "Payment Required",
    description:
      "Your shop subscription is awaiting its initial payment confirmation.",
    action:
      "Please complete your subscription payment and contact Helapoz support.",
    icon: CreditCard,
  },

  SUSPENDED: {
    title: "Subscription Suspended",
    description:
      "Your shop subscription has been suspended. POS access is temporarily unavailable.",
    action:
      "Please contact Helapoz support for assistance.",
    icon: ShieldAlert,
  },

  CANCELLED: {
    title: "Subscription Cancelled",
    description:
      "Your shop subscription has been cancelled. You currently cannot access the POS system.",
    action:
      "Please contact Helapoz support if you would like to reactivate your subscription.",
    icon: CalendarX,
  },

  NO_SUBSCRIPTION: {
    title: "No Active Subscription",
    description:
      "We couldn't find a subscription associated with your shop.",
    action:
      "Please contact Helapoz support to set up your subscription.",
    icon: CreditCard,
  },

  SUBSCRIPTION_CHECK_FAILED: {
    title: "Unable to Verify Subscription",
    description:
      "We couldn't verify your subscription status right now.",
    action:
      "Please try again later. Contact Helapoz support if the issue continues.",
    icon: AlertCircle,
  },


  // login required codes
  UNAUTHENTICATED: {
    title: "Sign In to Continue",
    description:
      "You're not signed in, or your session has expired.",
    action:
      "Please sign in again to open your shop. Contact Helapoz support if you keep being signed out.",
    icon: LogIn,
  },
 
  SHOP_SESSION_MISSING: {
    title: "No Shop Selected",
    description:
      "We couldn't find an active shop session for your account.",
    action:
      "Please sign in again and choose your shop. Contact Helapoz support if the shop doesn't appear.",
    icon: Store,
  },
 
  INVALID_SHOP_SESSION: {
    title: "Session No Longer Valid",
    description:
      "Your shop session is invalid or has expired for security reasons.",
    action:
      "Please sign in again to start a new session. Contact Helapoz support if this keeps happening.",
    icon: ShieldAlert,
  },
 
  SESSION_USER_MISMATCH: {
    title: "Account Mismatch",
    description:
      "This shop session belongs to a different account than the one you're signed in with.",
    action:
      "Please sign out, then sign in with the account that owns this shop. Contact Helapoz support if you need help.",
    icon: UserX,
  },
};

export const fallbackMessage: AccessMessage = {
  title: "Access Restricted",
  description:
    "Your account cannot currently access the Helapoz POS system.",
  action:
    "Please contact Helapoz support for assistance.",
  icon: ShieldAlert,
};

export const toneStyles: Record<Tone, { icon: string; iconWrap: string; badge: string }> = {
  danger: {
    icon: "text-red-600",
    iconWrap: "bg-red-500/10",
    badge: "bg-red-500/10 text-red-700",
  },
  warning: {
    icon: "text-amber-600",
    iconWrap: "bg-amber-500/10",
    badge: "bg-amber-500/10 text-amber-700",
  },
  info: {
    icon: "text-indigo-600",
    iconWrap: "bg-indigo-500/10",
    badge: "bg-indigo-500/10 text-indigo-700",
  },
  success: {
    icon: "text-green-600",
    iconWrap: "bg-green-500/10",
    badge: "bg-green-500/10 text-green-700",
  },
  neutral: {
    icon: "text-slate-600",
    iconWrap: "bg-slate-500/10",
    badge: "bg-slate-500/10 text-slate-700",
  },
};