import { requirePermission } from "@/lib/auth/dal";
import { PERMISSIONS } from "@/lib/auth/rbac";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AcademicYearsPanel } from "@/components/academics/academic-years-panel";
import { ClassesPanel } from "@/components/academics/classes-panel";
import { SectionsPanel } from "@/components/academics/sections-panel";
import { SubjectsPanel } from "@/components/academics/subjects-panel";
import { AllocationPanel } from "@/components/academics/allocation-panel";

export default async function AcademicsPage() {
  await requirePermission(PERMISSIONS.ACADEMICS_MANAGE);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Academics</h1>
        <p className="text-sm text-muted-foreground">
          Manage academic sessions, classes, sections, subjects and teacher allocations.
        </p>
      </div>

      <Tabs defaultValue="sessions">
        <TabsList className="w-full flex-wrap justify-start">
          <TabsTrigger value="sessions">Academic Sessions</TabsTrigger>
          <TabsTrigger value="classes">Classes</TabsTrigger>
          <TabsTrigger value="sections">Sections</TabsTrigger>
          <TabsTrigger value="subjects">Subjects</TabsTrigger>
          <TabsTrigger value="allocation">Teacher Allocation</TabsTrigger>
        </TabsList>
        <TabsContent value="sessions">
          <AcademicYearsPanel />
        </TabsContent>
        <TabsContent value="classes">
          <ClassesPanel />
        </TabsContent>
        <TabsContent value="sections">
          <SectionsPanel />
        </TabsContent>
        <TabsContent value="subjects">
          <SubjectsPanel />
        </TabsContent>
        <TabsContent value="allocation">
          <AllocationPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
}
