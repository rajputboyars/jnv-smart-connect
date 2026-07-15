import "dotenv/config";
import mongoose from "mongoose";
import { hashPassword } from "../src/lib/auth/password";
import { User } from "../src/models/User";
import { School } from "../src/models/School";
import { AcademicYear } from "../src/models/AcademicYear";
import { Class } from "../src/models/Class";
import { Section } from "../src/models/Section";
import { Subject } from "../src/models/Subject";
import { ROLES } from "../src/types/roles";

const JNV_CLASSES = [
  { name: "VI", numericLevel: 6 },
  { name: "VII", numericLevel: 7 },
  { name: "VIII", numericLevel: 8 },
  { name: "IX", numericLevel: 9 },
  { name: "X", numericLevel: 10 },
  { name: "XI", numericLevel: 11 },
  { name: "XII", numericLevel: 12 },
];

const CORE_SUBJECTS = [
  { name: "English", code: "ENG" },
  { name: "Hindi", code: "HIN" },
  { name: "Mathematics", code: "MAT" },
  { name: "Science", code: "SCI" },
  { name: "Social Science", code: "SST" },
];

async function seed() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("Missing MONGODB_URI environment variable");

  await mongoose.connect(uri);
  console.log("Connected to MongoDB");

  let school = await School.findOne({ code: "JNV-DEMO" });
  if (!school) {
    school = await School.create({
      name: "Jawahar Navodaya Vidyalaya (Demo)",
      code: "JNV-DEMO",
      district: "Demo District",
      state: "Demo State",
      establishedYear: 1986,
    });
    console.log("Created school:", school.name);
  }

  let academicYear = await AcademicYear.findOne({ school: school._id, isActive: true });
  if (!academicYear) {
    const now = new Date();
    academicYear = await AcademicYear.create({
      name: `${now.getFullYear()}-${now.getFullYear() + 1}`,
      school: school._id,
      startDate: new Date(now.getFullYear(), 3, 1),
      endDate: new Date(now.getFullYear() + 1, 2, 31),
      isActive: true,
    });
    school.activeAcademicYear = academicYear._id;
    await school.save();
    console.log("Created academic year:", academicYear.name);
  }

  const subjectDocs = [];
  for (const subject of CORE_SUBJECTS) {
    const doc = await Subject.findOneAndUpdate(
      { school: school._id, code: subject.code },
      { $setOnInsert: { ...subject, school: school._id, type: "core" } },
      { upsert: true, new: true }
    );
    subjectDocs.push(doc);
  }
  console.log(`Ensured ${subjectDocs.length} subjects`);

  for (const cls of JNV_CLASSES) {
    const classDoc = await Class.findOneAndUpdate(
      { school: school._id, academicYear: academicYear._id, name: cls.name },
      {
        $setOnInsert: {
          ...cls,
          school: school._id,
          academicYear: academicYear._id,
          subjects: subjectDocs.map((s) => s._id),
        },
      },
      { upsert: true, new: true }
    );

    for (const sectionName of ["A", "B"]) {
      await Section.findOneAndUpdate(
        { class: classDoc._id, name: sectionName },
        {
          $setOnInsert: {
            name: sectionName,
            class: classDoc._id,
            school: school._id,
            academicYear: academicYear._id,
            capacity: 40,
          },
        },
        { upsert: true, new: true }
      );
    }
  }
  console.log(`Ensured ${JNV_CLASSES.length} classes with sections A/B`);

  const superAdminEmail = (process.env.SEED_SUPER_ADMIN_EMAIL ?? "superadmin@jnvsmartconnect.in").toLowerCase();
  const existingAdmin = await User.findOne({ email: superAdminEmail });

  if (!existingAdmin) {
    const password = process.env.SEED_SUPER_ADMIN_PASSWORD ?? "ChangeMe123!";
    await User.create({
      name: "Super Admin",
      email: superAdminEmail,
      password: await hashPassword(password),
      role: ROLES.SUPER_ADMIN,
      school: school._id,
      isActive: true,
      isEmailVerified: true,
    });
    console.log(`Created Super Admin login: ${superAdminEmail} / ${password}`);
    console.log("IMPORTANT: change this password immediately after first login.");
  } else {
    console.log("Super Admin already exists, skipping.");
  }

  console.log("Seed complete.");
  await mongoose.disconnect();
}

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
