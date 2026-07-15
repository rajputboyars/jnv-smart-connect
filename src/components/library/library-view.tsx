"use client";

import { useAuth } from "@/hooks/use-auth";
import { can, PERMISSIONS } from "@/lib/auth/rbac";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { BookCatalog } from "@/components/library/book-catalog";
import { IssueReturnPanel } from "@/components/library/issue-return-panel";

export function LibraryView() {
  const { user, isLoading } = useAuth();

  if (isLoading || !user) return <Skeleton className="h-96 w-full rounded-xl" />;

  const canManage = can(user.role, PERMISSIONS.LIBRARY_MANAGE);

  if (!canManage) {
    return <BookCatalog />;
  }

  return (
    <Tabs defaultValue="catalog">
      <TabsList>
        <TabsTrigger value="catalog">Catalog</TabsTrigger>
        <TabsTrigger value="issues">Issue / Return</TabsTrigger>
      </TabsList>
      <TabsContent value="catalog">
        <BookCatalog />
      </TabsContent>
      <TabsContent value="issues">
        <IssueReturnPanel />
      </TabsContent>
    </Tabs>
  );
}
