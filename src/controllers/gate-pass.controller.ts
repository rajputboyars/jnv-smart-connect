import { type QueryFilter } from "mongoose";
import { connectDB } from "@/lib/db/connect";
import { GatePass, type IGatePass } from "@/models/GatePass";
import { ActivityLog } from "@/models/ActivityLog";
import { ApiError } from "@/lib/utils/api-error";
import { assertStudentInSchool } from "@/lib/auth/student-scope";
import type { GatePassStatus } from "@/models/enums";
import type { CreateGatePassInput } from "@/validators/hostel.validator";

export async function listGatePasses(school?: string, status?: GatePassStatus) {
  await connectDB();
  if (!school) return [];

  const filter: QueryFilter<IGatePass> = { school, ...(status ? { status } : {}) };
  const passes = await GatePass.find(filter)
    .sort({ createdAt: -1 })
    .limit(200)
    .populate("student", "name admissionNumber photoUrl")
    .populate("issuedBy", "name")
    .lean();

  return passes.map((p) => ({
    id: p._id.toString(),
    student: p.student,
    purpose: p.purpose,
    outTime: p.outTime,
    expectedInTime: p.expectedInTime,
    actualInTime: p.actualInTime,
    status: p.status,
    issuedBy: p.issuedBy,
  }));
}

export async function issueGatePass(input: CreateGatePassInput, actor: { id: string; school?: string }) {
  await connectDB();
  await assertStudentInSchool(input.student, actor.school);

  const pass = await GatePass.create({
    student: input.student,
    leaveRequest: input.leaveRequest || undefined,
    purpose: input.purpose,
    expectedInTime: new Date(input.expectedInTime),
    issuedBy: actor.id,
    status: "issued",
    school: actor.school,
  });

  await ActivityLog.create({
    user: actor.id,
    action: "gate_pass.issue",
    entityType: "GatePass",
    entityId: pass._id,
    school: actor.school,
  });

  return pass;
}

export async function markGatePassReturned(id: string, actor: { id: string; school?: string }) {
  await connectDB();

  const pass = await GatePass.findOne({ _id: id, ...(actor.school ? { school: actor.school } : {}) });
  if (!pass) throw ApiError.notFound("Gate pass not found");
  if (pass.status === "returned") throw ApiError.conflict("This gate pass is already marked returned");

  pass.status = "returned";
  pass.actualInTime = new Date();
  await pass.save();

  await ActivityLog.create({
    user: actor.id,
    action: "gate_pass.return",
    entityType: "GatePass",
    entityId: pass._id,
    school: actor.school,
  });

  return pass;
}
