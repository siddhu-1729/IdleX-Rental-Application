"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Bell, MessageCircle, Search, MapPin, Menu, X, User, LogOut, Settings, ChevronDown, LayoutDashboard, Home, Heart,
} from "@/components/ui/icons";
import { PUBLIC_NAV } from "@/config/site";
import { ROUTES } from "@/lib/constants";
import { useAuth } from "@/lib/auth";
import { getToken } from "@/lib/api-client";
import { useHostStatus } from "@/lib/use-host-status";

export function Navbar() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { hasListings } = useHostStatus();
  const [open, setOpen] = React.useState(false);
  const [menu, setMenu] = React.useState(false);

  // localStorage is not available during SSR, so the auth state can only
  // be trusted after mount — avoids a hydration mismatch on public pages.
  const mounted = React.useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
  const signedIn = mounted && (!!user || !!getToken());
  const isHost = mounted && signedIn && hasListings;

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-border">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 h-16 flex items-center gap-4">
        {/* Logo */}
        
          <div className="h-8 w-8 rounded-md bg-primary flex items-center justify-center text-white font-bold text-sm">
            iX
          </div>
          <span className="text-lg font-bold text-foreground tracking-tight">
            Idle<span className="text-primary">X</span>
          </span>
       

        {/* Home (desktop) */}
        <Link href={ROUTES.HOME} className="hidden sm:flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
          <Home size={16} />
          Home
        </Link>

        {/* Location (desktop) */}
        <button className="hidden lg:flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <MapPin size={16} />
          India
          <ChevronDown size={14} />
        </button>

        {/* Search (desktop) */}
        <div className="hidden md:flex flex-1 max-w-xl mx-4">
          <form action={ROUTES.SEARCH} className="relative w-full">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              name="q"
              type="text"
              placeholder="Search for items (camera, tent, bike...)"
              className="w-full h-10 pl-10 pr-4 rounded-lg border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            />
          </form>
        </div>

        {/* Right side */}
        <div className="ml-auto flex items-center gap-2">
          {signedIn && (
            <>
              <Link href={ROUTES.MESSAGES} className="hidden sm:inline-flex relative h-10 w-10 items-center justify-center rounded-full hover:bg-muted">
                <MessageCircle size={20} />
              </Link>
              <Link href={ROUTES.NOTIFICATIONS} className="hidden sm:inline-flex relative h-10 w-10 items-center justify-center rounded-full hover:bg-muted">
                <Bell size={20} />
              </Link>
            </>
          )}
          <Link href={isHost ? ROUTES.LISTING_NEW : ROUTES.BECOME_HOST} className="hidden md:inline-flex">
            <Button variant="primary" size="sm">{isHost ? "Add another listing" : "Become a Host"}</Button>
          </Link>

          {/* User menu */}
          {signedIn ? (
            <div className="relative">
              <button
                onClick={() => setMenu((m) => !m)}
                className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-full border border-border hover:shadow-md transition-shadow"
              >
                <Menu size={16} />
                <Avatar name={user?.name ?? "User"} size="sm" />
              </button>
              {menu && (
                <div
                  className="absolute right-0 mt-2 w-64 rounded-xl border border-border bg-card shadow-lg p-2 z-50"
                  onClick={() => setMenu(false)}
                >
                  <div className="p-3 border-b border-border mb-2">
                    <p className="text-sm font-semibold">{user?.name ?? "Account"}</p>
                    <p className="text-xs text-muted-foreground">{user?.email}</p>
                  </div>
                  <MenuLink href={ROUTES.DASHBOARD} icon={<LayoutDashboard size={16} />}>Dashboard</MenuLink>
                  <MenuLink href={ROUTES.WISHLIST} icon={<Heart size={16} />}>Wishlist</MenuLink>
                  <MenuLink href={ROUTES.MY_LISTINGS} icon={<Settings size={16} />}>My Listings</MenuLink>
                  <MenuLink href={ROUTES.MY_RENTALS} icon={<User size={16} />}>My Bookings</MenuLink>
                  <MenuLink href={ROUTES.PROFILE} icon={<User size={16} />}>Profile</MenuLink>
                  <MenuLink href={ROUTES.SETTINGS} icon={<Settings size={16} />}>Settings</MenuLink>
                  <hr className="my-2 border-border" />
                  <button
                    className="flex w-full items-center gap-3 px-3 py-2 rounded-md text-sm text-foreground hover:bg-muted"
                    onClick={() => { logout(); router.push(ROUTES.HOME); }}
                  >
                    <span className="text-muted-foreground"><LogOut size={16} /></span>
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link href={ROUTES.LOGIN}>
              <Button variant="outline" size="sm">Sign in</Button>
            </Link>
          )}
        </div>

        {/* Mobile menu toggle */}
        <button
          onClick={() => setOpen((o) => !o)}
          className="md:hidden h-10 w-10 inline-flex items-center justify-center rounded-md hover:bg-muted"
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile dropdown nav */}
      {open && (
        <div className="md:hidden border-t border-border bg-white px-4 py-3 space-y-2">
          <form action={ROUTES.SEARCH} className="relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              name="q"
              type="text"
              placeholder="Search for items..."
              className="w-full h-10 pl-10 pr-4 rounded-lg border border-border text-sm"
            />
          </form>
          <Link
            href={ROUTES.HOME}
            className="flex items-center gap-2 px-3 py-2 text-sm rounded-md text-foreground hover:bg-muted"
          >
            <span className="text-muted-foreground"><Home size={16} /></span>
            Home
          </Link>
          {PUBLIC_NAV.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="block px-3 py-2 text-sm rounded-md text-foreground hover:bg-muted"
            >
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}

function MenuLink({
  href, icon, children,
}: { href: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-foreground hover:bg-muted"
    >
      <span className="text-muted-foreground">{icon}</span>
      {children}
    </Link>
  );
}
