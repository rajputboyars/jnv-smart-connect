"use client";

import { useAuth } from "@/hooks/use-auth";
import { ProfileForm } from "@/components/profile/profile-form";
import { ChangePasswordForm } from "@/components/profile/change-password-form";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProfilePage() {
  const { user, isLoading } = useAuth();

  if (isLoading || !user) {
    return (
      <div className="grid gap-6 lg:grid-cols-2">
        <Skeleton className="h-72 w-full rounded-xl" />
        <Skeleton className="h-72 w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Your profile</h1>
        <p className="text-sm text-muted-foreground">Manage your account details and security.</p>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <ProfileForm user={user} />
        <ChangePasswordForm />
      </div>
    </div>
  );
}
