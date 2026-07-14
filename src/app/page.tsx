import Link from "next/link";
import { redirect } from "next/navigation";
import { GraduationCap, ShieldCheck, Users, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getSession } from "@/lib/auth/dal";

export default async function HomePage() {
  const session = await getSession();
  if (session) {
    redirect("/dashboard");
  }

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-background">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-40 left-1/2 h-[36rem] w-[48rem] -translate-x-1/2 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-accent/30 blur-3xl" />
      </div>

      <header className="flex items-center justify-between px-6 py-6 lg:px-12">
        <div className="flex items-center gap-2">
          <div className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <GraduationCap className="size-5" />
          </div>
          <span className="text-sm font-semibold">JNV Smart Connect</span>
        </div>
        <Button asChild>
          <Link href="/login">Sign in</Link>
        </Button>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center px-6 py-16 text-center">
        <h1 className="max-w-2xl text-4xl font-semibold tracking-tight sm:text-5xl">
          One connected campus for every Jawahar Navodaya Vidyalaya
        </h1>
        <p className="mt-4 max-w-xl text-balance text-muted-foreground">
          Students, teachers, parents and staff — one secure, role-aware home for admissions,
          attendance, academics and communication.
        </p>
        <div className="mt-8 flex gap-3">
          <Button asChild size="lg">
            <Link href="/login">Sign in to your dashboard</Link>
          </Button>
        </div>

        <div className="mt-20 grid w-full max-w-4xl gap-4 sm:grid-cols-3">
          {[
            {
              icon: ShieldCheck,
              title: "Role-based access",
              desc: "Nine roles, each with the exact permissions they need — nothing more.",
            },
            {
              icon: Users,
              title: "Every stakeholder",
              desc: "Principals, teachers, wardens, accountants, parents and students in one app.",
            },
            {
              icon: BarChart3,
              title: "Real dashboards",
              desc: "Live attendance, academics and activity — not static reports.",
            },
          ].map((f) => (
            <div key={f.title} className="glass rounded-2xl p-6 text-left">
              <div className="mb-3 flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <f.icon className="size-5" />
              </div>
              <h3 className="text-sm font-semibold">{f.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
