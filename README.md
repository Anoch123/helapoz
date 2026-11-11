This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.






<!-- "use client";

import { LogOut } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useShopLogout } from "@/hooks/useShopLogout";

export function ShopLogoutButton() {
  const { logout, isPending } = useShopLogout();

  return (
    <Button
      variant="outline"
      onClick={logout}
      disabled={isPending}
    >
      <LogOut className="mr-2 h-4 w-4" />
      {isPending ? "Logging out..." : "Logout"}
    </Button>
  );
} -->


<!-- Important: An authenticated user passing through the proxy is not automatically authorized to use the shop. We will implement that separately in the central server-side shop-session validation service. -->

<!-- The next step is to verify the My Profile files and run npx tsc --noEmit, then fix any errors before proceeding.

The current milestone is My Profile implementation. I'll keep track of which files have been provided versus which have actually been created and tested, so we don't accidentally treat unfinished work as completed. -->



const user = useCurrentUser();

// User
user.displayName;
user.email;
user.phone;

// Membership
user.role;
user.membershipStatus;

// Shop
user.shop.name;
user.shop.shopCode;
user.shop.contactEmail;
user.shop.contactPhone;
user.shop.city;
user.shop.businessType;

// Permissions
user.permissions;
user.permissionDetails;

// Subscription
user.subscription.status;
user.subscription.accessType;
user.subscription.currentPeriodEnd;
user.subscription.nextBillingDate;

// Plan
user.subscription.plan.name;
user.subscription.plan.monthlyPrice;
user.subscription.plan.additionalUserPrice;
user.subscription.plan.includedShopUsers;