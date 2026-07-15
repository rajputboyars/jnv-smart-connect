"use client";

import { useEffect } from "react";
import Link from "next/link";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { useCheckInWithQr } from "@/hooks/use-attendance";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ApiClientError } from "@/lib/api-client";

export function QrCheckinClient({ token }: { token: string }) {
  const mutation = useCheckInWithQr();

  useEffect(() => {
    mutation.mutate(token);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  return (
    <Card className="mx-auto max-w-sm">
      <CardContent className="flex flex-col items-center gap-4 py-10 text-center">
        {mutation.isPending && (
          <>
            <Loader2 className="size-10 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Checking you in…</p>
          </>
        )}

        {mutation.isSuccess && (
          <>
            <div className="flex size-14 items-center justify-center rounded-full bg-success/15 text-success">
              <CheckCircle2 className="size-7" />
            </div>
            <p className="font-medium">{mutation.data}</p>
          </>
        )}

        {mutation.isError && (
          <>
            <div className="flex size-14 items-center justify-center rounded-full bg-destructive/10 text-destructive">
              <XCircle className="size-7" />
            </div>
            <p className="font-medium">
              {mutation.error instanceof ApiClientError
                ? mutation.error.message
                : "Something went wrong"}
            </p>
          </>
        )}

        <Button asChild variant="outline" size="sm">
          <Link href="/dashboard/attendance">Back to attendance</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
