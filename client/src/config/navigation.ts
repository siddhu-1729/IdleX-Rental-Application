import { ROUTES, type UserRole } from "@/lib/constants";

/** Renter sidebar items (matches the renter dashboard screenshot). */
export const RENTER_SIDEBAR: Array<{ label: string; href: string; icon: string; badge?: number | string }> = [
  { label: "Dashboard", href: ROUTES.DASHBOARD, icon: "Home" },
  { label: "Browse Items", href: ROUTES.SEARCH, icon: "Search" },
  { label: "My Bookings", href: ROUTES.MY_RENTALS, icon: "CalendarCheck" },
  { label: "Extension Requests", href: `${ROUTES.MY_RENTALS}?tab=extensions`, icon: "Repeat" },
  { label: "My Payments", href: ROUTES.PAYMENTS, icon: "Wallet" },
  { label: "Wishlist", href: ROUTES.WISHLIST, icon: "Heart" },
  { label: "Messages", href: ROUTES.MESSAGES, icon: "MessageCircle" },
  { label: "Reviews", href: ROUTES.REVIEWS, icon: "Star" },
  { label: "My Profile", href: ROUTES.PROFILE, icon: "User" },
  { label: "KYC Verification", href: ROUTES.KYC_VERIFICATION, icon: "ShieldCheck", badge: "Verified" },
  { label: "Settings", href: ROUTES.SETTINGS, icon: "Settings" },
  { label: "Help & Support", href: ROUTES.HELP, icon: "HelpCircle" },
];

/** Owner sidebar (overlaps with renter; owner-specific entries come first). */
export const OWNER_SIDEBAR: Array<{ label: string; href: string; icon: string; badge?: number | string }> = [
  { label: "Dashboard", href: ROUTES.DASHBOARD, icon: "Home" },
  { label: "My Listings", href: ROUTES.MY_LISTINGS, icon: "Package" },
  { label: "Bookings", href: `${ROUTES.DASHBOARD}?view=bookings`, icon: "CalendarCheck" },
  { label: "Wishlist", href: ROUTES.WISHLIST, icon: "Heart" },
  { label: "Messages", href: ROUTES.MESSAGES, icon: "MessageCircle" },
  { label: "Reviews", href: ROUTES.REVIEWS, icon: "Star" },
  { label: "Payouts", href: ROUTES.PAYMENTS, icon: "Banknote" },
  { label: "KYC Verification", href: ROUTES.KYC_VERIFICATION, icon: "ShieldCheck", badge: "Verified" },
  { label: "Profile Settings", href: ROUTES.PROFILE, icon: "User" },
  { label: "Help & Support", href: ROUTES.HELP, icon: "HelpCircle" },
];

/** Admin sidebar (matches the admin dashboard screenshot). */
export const ADMIN_SIDEBAR: Array<{ label: string; href: string; icon: string; badge?: number | string }> = [
  { label: "Dashboard", href: ROUTES.ADMIN, icon: "LayoutDashboard" },
  { label: "Users", href: ROUTES.ADMIN_USERS, icon: "Users" },
  { label: "Listings", href: ROUTES.ADMIN_LISTINGS, icon: "Package" },
  { label: "Bookings", href: ROUTES.ADMIN_BOOKINGS, icon: "CalendarCheck" },
  { label: "Payments & Payouts", href: ROUTES.ADMIN_PAYMENTS, icon: "Wallet" },
  { label: "KYC Verification", href: ROUTES.ADMIN_KYC, icon: "ShieldCheck", badge: 12 },
  { label: "Disputes", href: ROUTES.ADMIN_DISPUTES, icon: "AlertTriangle" },
  { label: "Reviews & Reports", href: ROUTES.ADMIN_REPORTS, icon: "Flag" },
  { label: "Extension Requests", href: ROUTES.ADMIN_EXTENSION_REQUESTS, icon: "Repeat", badge: 6 },
  { label: "Messages", href: ROUTES.ADMIN_MESSAGES, icon: "MessageCircle" },
  { label: "Categories & Attributes", href: ROUTES.ADMIN_CATEGORIES, icon: "Tags" },
  { label: "Offers & Promotions", href: ROUTES.ADMIN_OFFERS, icon: "Tag" },
  { label: "System Settings", href: ROUTES.ADMIN_SYSTEM, icon: "Settings" },
  { label: "Audit Logs", href: ROUTES.ADMIN_AUDIT, icon: "ScrollText" },
  { label: "Support Tickets", href: ROUTES.ADMIN_SUPPORT, icon: "LifeBuoy" },
];

/** Mobile bottom nav — varies by role. */
export const BOTTOM_NAV: Record<UserRole, Array<{ label: string; href: string; icon: string }>> = {
  guest: [
    { label: "Home", href: ROUTES.HOME, icon: "Home" },
    { label: "Browse", href: ROUTES.SEARCH, icon: "Search" },
    { label: "Bookings", href: ROUTES.MY_RENTALS, icon: "CalendarCheck" },
    { label: "Inbox", href: ROUTES.MESSAGES, icon: "MessageCircle" },
    { label: "Profile", href: ROUTES.PROFILE, icon: "User" },
  ],
  renter: [
    { label: "Home", href: ROUTES.DASHBOARD, icon: "Home" },
    { label: "Browse", href: ROUTES.SEARCH, icon: "Search" },
    { label: "Bookings", href: ROUTES.MY_RENTALS, icon: "CalendarCheck" },
    { label: "Inbox", href: ROUTES.MESSAGES, icon: "MessageCircle" },
    { label: "Profile", href: ROUTES.PROFILE, icon: "User" },
  ],
  owner: [
    { label: "Home", href: ROUTES.DASHBOARD, icon: "Home" },
    { label: "Listings", href: ROUTES.MY_LISTINGS, icon: "Package" },
    { label: "Bookings", href: `${ROUTES.DASHBOARD}?view=bookings`, icon: "CalendarCheck" },
    { label: "Inbox", href: ROUTES.MESSAGES, icon: "MessageCircle" },
    { label: "Profile", href: ROUTES.PROFILE, icon: "User" },
  ],
  admin: [
    { label: "Home", href: ROUTES.ADMIN, icon: "LayoutDashboard" },
    { label: "Users", href: ROUTES.ADMIN_USERS, icon: "Users" },
    { label: "Listings", href: ROUTES.ADMIN_LISTINGS, icon: "Package" },
    { label: "Inbox", href: ROUTES.ADMIN_MESSAGES, icon: "MessageCircle" },
    { label: "Profile", href: ROUTES.ADMIN, icon: "User" },
  ],
};
