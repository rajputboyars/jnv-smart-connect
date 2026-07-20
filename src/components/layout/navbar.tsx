"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Menu, Search, LogOut, User, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { NAV_ITEMS } from "@/components/layout/nav-config";
import { NotificationBell } from "@/components/layout/notification-bell";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { can, canAny, PERMISSIONS } from "@/lib/auth/rbac";
import { ROLE_LABELS, type Role } from "@/types/roles";
import { useAuth } from "@/hooks/use-auth";
import { initials } from "@/lib/utils";

export function Navbar({ role }: { role: Role }) {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (search.trim()) {
      router.push(`/dashboard/students?search=${encodeURIComponent(search.trim())}`);
    }
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-background/70 px-4 backdrop-blur-xl lg:px-6">
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden"
        aria-label="Open menu"
        onClick={() => setMobileOpen(true)}
      >
        <Menu className="size-5" />
      </Button>

      {/* Only roles that can actually view students get the global student
          search — otherwise submitting it would bounce them to /unauthorized. */}
      {can(role, PERMISSIONS.STUDENTS_VIEW) && (
        <form onSubmit={handleSearch} className="hidden max-w-sm flex-1 items-center gap-2 sm:flex">
          <div className="relative w-full">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search students by name or admission no."
              className="pl-9"
            />
          </div>
        </form>
      )}

      <div className="ml-auto flex items-center gap-1">
        <ThemeToggle />
        <NotificationBell />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="ml-1 flex items-center gap-2 rounded-full pr-1 outline-none focus-visible:ring-4 focus-visible:ring-ring/30">
              <Avatar>
                {user?.avatarUrl ? (
                  <AvatarImage src={user.avatarUrl} alt={user.name} />
                ) : null}
                <AvatarFallback>{user ? initials(user.name) : "?"}</AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <p className="font-medium">{user?.name ?? "Loading…"}</p>
              <p className="text-xs font-normal text-muted-foreground">{ROLE_LABELS[role]}</p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/dashboard/profile">
                <User className="size-4" /> Profile
              </Link>
            </DropdownMenuItem>
            {canAny(role, [NAV_ITEMS.find((n) => n.label === "Settings")!.permission].flat()) && (
              <DropdownMenuItem asChild>
                <Link href="/dashboard/settings">
                  <Settings className="size-4" /> Settings
                </Link>
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" onSelect={() => logout()}>
              <LogOut className="size-4" /> Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Dialog open={mobileOpen} onOpenChange={setMobileOpen}>
        <DialogContent className="left-0 top-0 h-full w-72 max-w-[80vw] -translate-x-0 -translate-y-0 rounded-none rounded-r-2xl data-[state=open]:slide-in-from-left">
          <DialogHeader>
            <DialogTitle>Navigate</DialogTitle>
          </DialogHeader>
          <nav className="flex flex-col gap-1">
            {NAV_ITEMS.filter((item) => canAny(role, [item.permission].flat())).map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent"
              >
                <item.icon className="size-4" />
                {item.label}
              </Link>
            ))}
          </nav>
        </DialogContent>
      </Dialog>
    </header>
  );
}
