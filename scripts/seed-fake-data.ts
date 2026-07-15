import "dotenv/config";
import mongoose from "mongoose";
import { hashPassword } from "../src/lib/auth/password";
import { School } from "../src/models/School";
import { AcademicYear } from "../src/models/AcademicYear";
import { Class } from "../src/models/Class";
import { Section } from "../src/models/Section";
import { Subject } from "../src/models/Subject";
import { User } from "../src/models/User";
import { Teacher } from "../src/models/Teacher";
import { Parent } from "../src/models/Parent";
import { Student } from "../src/models/Student";
import { Attendance } from "../src/models/Attendance";
import { ROLES } from "../src/types/roles";
import { GENDERS, HOUSES, type Gender } from "../src/models/enums";

const DEFAULT_PASSWORD = "Passw0rd!";

const FIRST_NAMES_MALE = [
  "Aarav", "Vivaan", "Aditya", "Vihaan", "Arjun", "Sai", "Reyansh", "Krishna",
  "Ishaan", "Rohan", "Kabir", "Aryan", "Dev", "Yash", "Anirudh", "Karthik",
];
const FIRST_NAMES_FEMALE = [
  "Ananya", "Diya", "Saanvi", "Aadhya", "Myra", "Ira", "Kiara", "Anika",
  "Riya", "Navya", "Pari", "Meera", "Tara", "Isha", "Sneha", "Priya",
];
const LAST_NAMES = [
  "Sharma", "Verma", "Gupta", "Yadav", "Kumar", "Singh", "Patel", "Mishra",
  "Reddy", "Nair", "Joshi", "Chauhan", "Rathore", "Meena", "Choudhary", "Prasad",
];

const TEACHER_QUALIFICATIONS = ["B.Ed, M.A.", "B.Ed, M.Sc.", "B.Ed, M.Com.", "Ph.D.", "B.Ed, B.A."];
const DESIGNATIONS = ["PGT", "TGT", "PRT"];

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomName(gender: Gender): string {
  const first = gender === "female" ? pick(FIRST_NAMES_FEMALE) : pick(FIRST_NAMES_MALE);
  return `${first} ${pick(LAST_NAMES)}`;
}

function randomPhone(): string {
  return `9${randomInt(100000000, 999999999)}`;
}

function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z]+/g, ".");
}

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("Missing MONGODB_URI environment variable");

  await mongoose.connect(uri);
  console.log("Connected to MongoDB");

  const school = await School.findOne({ code: "JNV-DEMO" });
  if (!school) {
    throw new Error("Run `npm run seed` first to create the base school/classes.");
  }

  const academicYear = await AcademicYear.findOne({ school: school._id, isActive: true });
  if (!academicYear) throw new Error("No active academic year found. Run `npm run seed` first.");

  const classes = await Class.find({ school: school._id, academicYear: academicYear._id });
  const subjects = await Subject.find({ school: school._id });
  if (!classes.length || !subjects.length) {
    throw new Error("No classes/subjects found. Run `npm run seed` first.");
  }

  // ---- Teachers ----
  const teacherCount = 14;
  const teachers: Awaited<ReturnType<typeof Teacher.create>>[] = [];
  const teacherPasswordHash = await hashPassword(DEFAULT_PASSWORD);

  for (let i = 1; i <= teacherCount; i++) {
    const employeeId = `JNV-T-${String(i).padStart(3, "0")}`;
    const existing = await Teacher.findOne({ school: school._id, employeeId });
    if (existing) {
      teachers.push(existing);
      continue;
    }

    const gender: Gender = pick(GENDERS);
    const name = randomName(gender);
    const email = `${slugify(name)}${i}@jnvsmartconnect.in`;

    const user = await User.create({
      name,
      email,
      password: teacherPasswordHash,
      role: ROLES.TEACHER,
      phone: randomPhone(),
      school: school._id,
      isActive: true,
      isEmailVerified: true,
    });

    const teacherSubjects = [pick(subjects), pick(subjects)];

    const teacher = await Teacher.create({
      user: user._id,
      employeeId,
      name,
      email,
      phone: user.phone,
      qualification: pick(TEACHER_QUALIFICATIONS),
      designation: pick(DESIGNATIONS),
      subjects: [...new Set(teacherSubjects.map((s) => s._id.toString()))],
      experienceYears: randomInt(1, 20),
      joiningDate: new Date(2015 + randomInt(0, 9), randomInt(0, 11), randomInt(1, 28)),
      status: "active",
      school: school._id,
    });

    teachers.push(teacher);
  }
  console.log(`Ensured ${teachers.length} teachers`);

  // Assign a class teacher to each section that doesn't have one yet.
  const sections = await Section.find({ school: school._id, academicYear: academicYear._id }).populate("class");
  let teacherIdx = 0;
  for (const section of sections) {
    if (!section.classTeacher) {
      const teacher = teachers[teacherIdx % teachers.length];
      section.classTeacher = teacher._id;
      await section.save();
      teacherIdx++;
    }
  }
  console.log(`Assigned class teachers to ${sections.length} sections`);

  // ---- Students + Parents ----
  const studentsPerSection = 6;
  const studentPasswordHash = await hashPassword(DEFAULT_PASSWORD);
  const parentPasswordHash = await hashPassword(DEFAULT_PASSWORD);
  const createdStudents: Awaited<ReturnType<typeof Student.create>>[] = [];
  let admissionSeq = 1;

  for (const section of sections) {
    const cls = section.class as unknown as { _id: mongoose.Types.ObjectId; numericLevel: number };
    const existingCount = await Student.countDocuments({ section: section._id });
    const toCreate = Math.max(0, studentsPerSection - existingCount);

    for (let i = 0; i < toCreate; i++) {
      const gender: Gender = pick(GENDERS);
      const name = randomName(gender);
      const admissionNumber = `JNV2026${String(admissionSeq).padStart(4, "0")}`;
      admissionSeq++;

      const age = cls.numericLevel - 1;
      const dob = new Date(2026 - age, randomInt(0, 11), randomInt(1, 28));

      const fatherName = randomName("male");
      const motherName = randomName("female");
      const parentEmail = `${slugify(fatherName)}.${admissionSeq}@example.com`;

      const parentUser = await User.create({
        name: fatherName,
        email: parentEmail,
        password: parentPasswordHash,
        role: ROLES.PARENT,
        phone: randomPhone(),
        school: school._id,
        isActive: true,
        isEmailVerified: true,
      });

      const studentUser = await User.create({
        name,
        email: `${slugify(name)}.${admissionSeq}@jnvsmartconnect.in`,
        password: studentPasswordHash,
        role: ROLES.STUDENT,
        school: school._id,
        isActive: true,
        isEmailVerified: true,
      });

      const student = await Student.create({
        user: studentUser._id,
        admissionNumber,
        rollNumber: String(i + 1),
        name,
        dob,
        gender,
        bloodGroup: pick(["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"] as const),
        address: {
          village: pick(["Rampur", "Shivpuri", "Lakshmipur", "Ganeshpura", "Devnagar"]),
          district: school.district,
          state: school.state,
          pincode: String(randomInt(100000, 999999)),
        },
        guardianDetails: {
          fatherName,
          fatherPhone: randomPhone(),
          fatherOccupation: pick(["Farmer", "Teacher", "Shopkeeper", "Government Service", "Driver"]),
          motherName,
          motherPhone: randomPhone(),
          motherOccupation: pick(["Homemaker", "Teacher", "Farmer", "Tailor"]),
        },
        emergencyContact: {
          name: fatherName,
          relation: "Father",
          phone: randomPhone(),
        },
        currentClass: cls._id,
        section: section._id,
        house: pick(HOUSES),
        isHosteller: Math.random() > 0.3,
        parents: [],
        academicYear: academicYear._id,
        school: school._id,
        status: "active",
        admissionDate: new Date(2026, 3, randomInt(1, 20)),
      });

      const parent = await Parent.create({
        user: parentUser._id,
        name: fatherName,
        email: parentEmail,
        phone: parentUser.phone,
        occupation: pick(["Farmer", "Teacher", "Shopkeeper", "Government Service"]),
        address: `${student.address?.village}, ${school.district}, ${school.state}`,
        children: [student._id],
        school: school._id,
      });

      student.parents = [parent._id];
      await student.save();

      createdStudents.push(student);
    }
  }
  console.log(`Created ${createdStudents.length} new students with parents`);

  // ---- Attendance for the last 14 days ----
  const allStudents = await Student.find({ school: school._id }).select(
    "_id currentClass section"
  );
  const markedBy = await User.findOne({ role: ROLES.SUPER_ADMIN, school: school._id });
  if (markedBy && allStudents.length) {
    let attendanceCount = 0;
    const today = new Date();

    for (let dayOffset = 13; dayOffset >= 0; dayOffset--) {
      const date = new Date(today);
      date.setDate(today.getDate() - dayOffset);
      date.setHours(0, 0, 0, 0);

      const day = date.getDay();
      if (day === 0) continue; // skip Sundays

      for (const student of allStudents) {
        const roll = Math.random();
        const status = roll > 0.92 ? "absent" : roll > 0.87 ? "late" : "present";

        try {
          await Attendance.findOneAndUpdate(
            { entityType: "student", student: student._id, date },
            {
              $setOnInsert: {
                school: school._id,
                academicYear: academicYear._id,
                date,
                entityType: "student",
                student: student._id,
                class: student.currentClass,
                section: student.section,
                status,
                markedBy: markedBy._id,
                method: "manual",
              },
            },
            { upsert: true }
          );
          attendanceCount++;
        } catch {
          // duplicate key on re-run, ignore
        }
      }
    }
    console.log(`Ensured ~${attendanceCount} attendance records over the last 14 days`);
  }

  console.log("Fake data seed complete.");
  console.log(`All fake teacher/parent/student logins use the password: ${DEFAULT_PASSWORD}`);
  await mongoose.disconnect();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
