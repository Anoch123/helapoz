import { NavLink } from "../types/navbar.type";

export const NAV_LINKS: NavLink[] = [
  {
    label: "About",
    href: "/about",
  },
  {
    label: "Sermons",
    href: "/pplc-sermons",
  },
  {
    label: "Ministries",
    href: "/ministries",
    children: [
      { label: "Kids", href: "/ministries/kids" },
      { label: "Youth", href: "/ministries/youth" },
      { label: "Outreach", href: "/ministries/outreach" },
    ],
  },
  {
    label: "Events",
    href: "/events",
  },
];

export const SOCIAL_LINKS = [
  { label: "YouTube", href: "https://youtube.com/", icon: "youtube" },
  { label: "Facebook", href: "https://facebook.com/", icon: "facebook" },
  { label: "Instagram", href: "https://instagram.com/", icon: "instagram" },
] as const;

// Short blurbs shown in the About mega menu (keyed by href)
export const DESCRIPTIONS: Record<string, string> = {
  "/about": "Our story, our people and our heart for the community.",
  "/beliefs": "The truths of Scripture that anchor everything we do.",
  "/calendar": "Services, groups and events happening near you.",
};

export const SOCIALS = [
  { name: "youtube", href: "#", label: "YouTube" },
  { name: "facebook", href: "#", label: "Facebook" },
  { name: "instagram", href: "#", label: "Instagram" },
];