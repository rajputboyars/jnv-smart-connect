import { connectDB } from "@/lib/db/connect";
import { MedicineLog } from "@/models/MedicineLog";
import { DoctorVisit } from "@/models/DoctorVisit";
import { Student } from "@/models/Student";
import { Parent } from "@/models/Parent";
import { Notification } from "@/models/Notification";
import { ActivityLog } from "@/models/ActivityLog";
import { ApiError } from "@/lib/utils/api-error";
import { ROLES } from "@/types/roles";
import type { AccessTokenPayload } from "@/lib/auth/jwt";
import type {
  CreateMedicineLogInput,
  CreateDoctorVisitInput,
} from "@/validators/health.validator";

async function assertCanViewStudent(studentId: string, session: AccessTokenPayload) {
  if (session.role === ROLES.STUDENT) {
    const own = await Student.findOne({ user: session.sub }).select("_id");
    if (!own || own._id.toString() !== studentId) {
      throw ApiError.forbidden("You can only view your own medical records");
    }
    return;
  }

  if (session.role === ROLES.PARENT) {
    const parent = await Parent.findOne({ user: session.sub, children: studentId });
    if (!parent) throw ApiError.forbidden("This student isn't linked to your account");
  }
}

export async function getStudentMedicalReport(
  studentId: string,
  session: AccessTokenPayload
) {
  await connectDB();
  await assertCanViewStudent(studentId, session);

  const student = await Student.findOne({
    _id: studentId,
    ...(session.school ? { school: session.school } : {}),
  })
    .select("name admissionNumber bloodGroup medicalInfo emergencyContact photoUrl")
    .lean();

  if (!student) throw ApiError.notFound("Student not found");

  const [medicines, visits] = await Promise.all([
    MedicineLog.find({ student: studentId }).sort({ givenAt: -1 }).limit(50).populate("givenBy", "name").lean(),
    DoctorVisit.find({ student: studentId }).sort({ visitDate: -1 }).limit(50).lean(),
  ]);

  return {
    student: {
      id: student._id.toString(),
      name: student.name,
      admissionNumber: student.admissionNumber,
      bloodGroup: student.bloodGroup,
      medicalInfo: student.medicalInfo,
      emergencyContact: student.emergencyContact,
      photoUrl: student.photoUrl,
    },
    medicines: medicines.map((m) => ({
      id: m._id.toString(),
      medicineName: m.medicineName,
      dosage: m.dosage,
      route: m.route,
      givenAt: m.givenAt,
      givenBy: m.givenBy,
      notes: m.notes,
    })),
    visits: visits.map((v) => ({
      id: v._id.toString(),
      visitDate: v.visitDate,
      reason: v.reason,
      diagnosis: v.diagnosis,
      prescription: v.prescription,
      doctorName: v.doctorName,
      followUpDate: v.followUpDate,
    })),
  };
}

export async function createMedicineLog(
  input: CreateMedicineLogInput,
  actor: { id: string; school?: string }
) {
  await connectDB();
  if (!actor.school) throw ApiError.badRequest("Your account is not linked to a school");

  const log = await MedicineLog.create({
    ...input,
    notes: input.notes || undefined,
    givenBy: actor.id,
    school: actor.school,
  });

  await ActivityLog.create({
    user: actor.id,
    action: "medicine_log.create",
    entityType: "MedicineLog",
    entityId: log._id,
    school: actor.school,
  });

  return log;
}

export async function createDoctorVisit(
  input: CreateDoctorVisitInput,
  actor: { id: string; school?: string }
) {
  await connectDB();
  if (!actor.school) throw ApiError.badRequest("Your account is not linked to a school");

  const visit = await DoctorVisit.create({
    student: input.student,
    reason: input.reason,
    diagnosis: input.diagnosis || undefined,
    prescription: input.prescription || undefined,
    doctorName: input.doctorName,
    followUpDate: input.followUpDate ? new Date(input.followUpDate) : undefined,
    loggedBy: actor.id,
    school: actor.school,
  });

  if (input.notifyParent) {
    const student = await Student.findById(input.student).select("name parents");
    if (student?.parents?.length) {
      const parents = await Parent.find({ _id: { $in: student.parents } }).select("user");
      const parentUserIds = parents.map((p) => p.user);

      if (parentUserIds.length > 0) {
        await Notification.create({
          title: `Health update for ${student.name}`,
          message: `${student.name} was seen by ${input.doctorName} for: ${input.reason}.`,
          type: "warning",
          audienceScope: "users",
          audienceUsers: parentUserIds,
          sender: actor.id,
          school: actor.school,
        });
      }
    }
  }

  await ActivityLog.create({
    user: actor.id,
    action: "doctor_visit.create",
    entityType: "DoctorVisit",
    entityId: visit._id,
    school: actor.school,
  });

  return visit;
}
