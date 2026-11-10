import { KeyRound, LayoutDashboard, Mail, MessageCircle, Phone, Store, UserRound, Users } from "lucide-react";

export const BASICSYSTEMDATA = {
    'appName': 'HELAPOZ',
    'appNameCapitalize': 'Helapoz',
    'appDescription': 'HELAPOZ is a modern and efficient point-of-sale (POS) system designed to streamline business operations and enhance customer experiences. With its user-friendly interface and powerful features, HELAPOZ empowers businesses to manage sales, inventory, and customer interactions seamlessly.',
    'appKeywords': 'HELAPOZ, POS, point-of-sale, business management, inventory control, customer engagement, sales tracking, modern POS system, efficient business operations, user-friendly interface',
    'email': 'support@helapoz.com',
    'phone': "+94 77 000 0000",
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
    title: "My Profile",
    href: "/profile",
    icon: UserRound,
  },
];

export const channels = [
  {
    icon: Mail,
    title: "Email",
    value: BASICSYSTEMDATA.email,
    href: `mailto:${BASICSYSTEMDATA.email}?subject=Sign-in%20help`,
  },
  {
    icon: Phone,
    title: "Phone",
    value: BASICSYSTEMDATA.phone,
    href: `tel:${BASICSYSTEMDATA.phone.replace(/\s/g, "")}`,
  },
  {
    icon: MessageCircle,
    title: "WhatsApp",
    value: "Chat with us",
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