export type ShopRole = "SHOP_ADMIN" | "SHOP_USER";

export type ShopMembershipStatus = "ACTIVE" | "SUSPENDED";

export type ShopStatus =
  | "PROVISIONING"
  | "ACTIVE"
  | "PAST_DUE"
  | "SUSPENDED"
  | "PENDING_PAYMENT"
  | "CANCELLED"
  | "ARCHIVED";

export type ShopBusinessType =
  | "RETAIL"
  | "RESTAURANT"
  | "HARDWARE"
  | "CLOTHING"
  | "PHARMACY"
  | "ELECTRONICS"
  | "OTHER";

export type SubscriptionStatus =
  | "PENDING_PAYMENT"
  | "ACTIVE"
  | "PAST_DUE"
  | "SUSPENDED"
  | "CANCELLED";

export type SubscriptionAccessType = "ACTIVE" | "GRACE_PERIOD";

export type ShopPermissionDetails = {
  permissionKey: string;
  name: string;
  description: string | null;
  category: string;
};

export type CurrentUser = {
  id: string;
  email: string;
  displayName: string;
  phone: string | null;

  role: ShopRole;
  membershipId: string;
  membershipStatus: ShopMembershipStatus;
  membershipCreatedAt: string;
  membershipUpdatedAt: string;

  isShopAdmin: boolean;
  isShopUser: boolean;

  shop: {
    id: string;
    shopCode: string;
    name: string;
    legalName: string | null;
    businessRegistrationNo: string | null;
    contactEmail: string | null;
    contactPhone: string | null;
    addressLine1: string | null;
    addressLine2: string | null;
    city: string | null;
    district: string | null;
    province: string | null;
    postalCode: string | null;
    country: string;
    status: ShopStatus;
    businessType: ShopBusinessType;
    createdAt: string;
    updatedAt: string;
  };

  permissions: string[];
  permissionDetails: ShopPermissionDetails[];

  subscription: {
    id: string;
    status: SubscriptionStatus;
    accessType: SubscriptionAccessType;

    currentPeriodStart: string | null;
    currentPeriodEnd: string | null;
    nextBillingDate: string | null;
    gracePeriodDays: number;

    cancelledAt: string | null;
    suspendedAt: string | null;
    createdAt: string;
    updatedAt: string;

    plan: {
      id: string;
      code: string;
      name: string;
      description: string | null;
      monthlyPrice: number;
      additionalUserPrice: number;
      includedAdminUsers: number;
      includedShopUsers: number;
      currency: string;
    };
  };
};