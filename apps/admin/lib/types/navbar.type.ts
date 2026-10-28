export type NavLink = {
  label: string;
  href: string;
  children?: { label: string; href: string }[];
};