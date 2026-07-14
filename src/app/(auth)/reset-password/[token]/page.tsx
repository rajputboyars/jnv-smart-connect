import type { Metadata } from "next";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";

export const metadata: Metadata = { title: "Reset password — JNV Smart Connect" };

export default async function ResetPasswordPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  return (
    <div className="space-y-6">
      <div className="space-y-1 text-center">
        <h2 className="text-lg font-semibold">Choose a new password</h2>
        <p className="text-sm text-muted-foreground">Make it strong and memorable.</p>
      </div>
      <ResetPasswordForm token={token} />
    </div>
  );
}
