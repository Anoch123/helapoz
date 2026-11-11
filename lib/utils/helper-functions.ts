export function nameInitialLetters(text:any) {
    return text.split(" ").map((w:string) => w[0]).join("");
}

export function replaceUnderscoresWithSpaces(role:String){
    return role.replace("_", " ");
}

export function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-LK", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(value));
}

export function formatLabel(value: string) {
  return value
    .split("_")
    .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
    .join(" ");
}

export const formatMoney = (value?: number | null) =>
  typeof value === "number"
    ? new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "LKR",
        currencyDisplay: "code",
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      })
        .format(value)
        .replace("LKR", "Rs.")
    : "—";

export const getInitials = (name?: string | null) =>
  (name ?? "")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "U";

export const daysUntil = (date?: string | Date | null) => {
  if (!date) return null;
  const diff = new Date(date).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
};