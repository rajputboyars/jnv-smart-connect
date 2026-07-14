import { connectDB } from "@/lib/db/connect";
import { Class } from "@/models/Class";
import { Section } from "@/models/Section";
import { Subject } from "@/models/Subject";

export async function listClassesWithSections(school?: string) {
  await connectDB();

  if (!school) return [];

  const classes = await Class.find({ school }).sort({ numericLevel: 1 }).lean();
  const sections = await Section.find({ school }).sort({ name: 1 }).lean();

  return classes.map((cls) => ({
    id: cls._id.toString(),
    name: cls.name,
    sections: sections
      .filter((s) => s.class.toString() === cls._id.toString())
      .map((s) => ({ id: s._id.toString(), name: s.name })),
  }));
}

export async function listSubjects(school?: string) {
  await connectDB();
  if (!school) return [];

  const subjects = await Subject.find({ school }).sort({ name: 1 }).lean();
  return subjects.map((s) => ({ id: s._id.toString(), name: s.name, code: s.code }));
}
