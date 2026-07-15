import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = { title: "Sign in — JNV Smart Connect" };

export default function LoginPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-1 text-center">
        <h2 className="text-lg font-semibold">Sign in to your account</h2>
        <p className="text-sm text-muted-foreground">Enter your credentials to continue</p>
      </div>
      <Suspense>
        <LoginForm />
      </Suspense>
    </div>
  );
}
