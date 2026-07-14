import { GraduationCap } from "lucide-react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4 py-12">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-32 left-1/2 h-96 w-[42rem] -translate-x-1/2 rounded-full bg-primary/25 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-accent/40 blur-3xl" />
      </div>

      <div className="w-full max-w-md space-y-6">
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg">
            <GraduationCap className="size-6" />
          </div>
          <h1 className="text-xl font-semibold">JNV Smart Connect</h1>
          <p className="text-sm text-muted-foreground">
            School management for Jawahar Navodaya Vidyalayas
          </p>
        </div>

        <div className="glass-strong rounded-2xl p-6 sm:p-8">{children}</div>
      </div>
    </div>
  );
}
