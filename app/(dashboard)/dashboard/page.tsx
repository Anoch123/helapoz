"use client";

// import { Button } from "@/components/ui/button";
// import { useShopLogout } from "@/hooks/useShopLogout";
// import { LogOut } from "lucide-react";

// export default function Dashboard() {
//     const { logout, isPending } = useShopLogout();
//   return (
//     <main>
//       <Button
//       variant="outline"
//       onClick={logout}
//       disabled={isPending}
//     >
//       <LogOut className="mr-2 h-4 w-4" />
//       {isPending ? "Logging out..." : "Logout"}
//     </Button>
//     {/* const context = await requireShopPermission("products.create"); */}
//     </main>
//   );
// }



// import { NextRequest, NextResponse } from "next/server";

// import { requireShopPermission } from "@/lib/services/require-shop-permission.service";
// import { handleAuthorizationError } from "@/lib/utils/api-authorization";

// export async function POST(request: NextRequest) {
//   try {
//     const context = await requireShopPermission("products.create");

//     // Use context.shopId for all shop-scoped operations.
//     // Validate request data and create the product here.

//     return NextResponse.json({
//       success: true,
//     });
//   } catch (error) {
//     return handleAuthorizationError(error);
//   }
// }


export default function Dashboard() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold">
        Dashboard
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Welcome to helapoz POS.
      </p>
    </div>
  );
}