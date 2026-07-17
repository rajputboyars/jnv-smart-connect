import { connectDB } from "@/lib/db/connect";
import { SalaryStructure, type ISalaryComponent } from "@/models/SalaryStructure";
import { Payslip } from "@/models/Payslip";
import { Teacher } from "@/models/Teacher";
import { ActivityLog } from "@/models/ActivityLog";
import { ApiError } from "@/lib/utils/api-error";
import type { AccessTokenPayload } from "@/lib/auth/jwt";
import { can, PERMISSIONS } from "@/lib/auth/rbac";
import { resolveOwnTeacherId } from "@/lib/auth/teacher-scope";
import type {
  CreateSalaryStructureInput,
  GeneratePayslipInput,
  UpdatePayslipStatusInput,
} from "@/validators/hr.validator";

function sumComponents(components: ISalaryComponent[]): number {
  return components.reduce((sum, c) => sum + c.amount, 0);
}

interface SalaryComponents {
  basicPay: number;
  allowances: ISalaryComponent[];
  deductions: ISalaryComponent[];
}

/** Gross/net pay for a salary structure, computed on read — never stored on the structure itself. */
export function computeSalary(structure: SalaryComponents) {
  const grossPay = structure.basicPay + sumComponents(structure.allowances);
  const netPay = grossPay - sumComponents(structure.deductions);
  return { grossPay, netPay };
}

export async function listSalaryStructures(school?: string, teacher?: string) {
  await connectDB();
  if (!school) return [];
  return SalaryStructure.find({ school, ...(teacher ? { teacher } : {}) })
    .sort({ effectiveFrom: -1 })
    .populate("teacher", "name employeeId designation")
    .lean();
}

export async function createSalaryStructure(
  input: CreateSalaryStructureInput,
  actor: { id: string; school?: string }
) {
  await connectDB();
  if (!actor.school) throw ApiError.badRequest("Your account is not linked to a school");

  const teacher = await Teacher.findOne({ _id: input.teacher, school: actor.school });
  if (!teacher) throw ApiError.badRequest("Teacher not found");

  const structure = await SalaryStructure.create({
    teacher: input.teacher,
    basicPay: input.basicPay,
    allowances: input.allowances,
    deductions: input.deductions,
    effectiveFrom: new Date(input.effectiveFrom),
    school: actor.school,
  });

  await ActivityLog.create({
    user: actor.id,
    action: "salary_structure.create",
    entityType: "SalaryStructure",
    entityId: structure._id,
    school: actor.school,
  });

  return structure;
}

export async function listPayslips(
  session: AccessTokenPayload,
  query: { teacher?: string; month?: number; year?: number }
) {
  await connectDB();
  if (!session.school) return [];

  const canManage = can(session.role, PERMISSIONS.HR_MANAGE);
  const teacherFilter = canManage ? query.teacher : await resolveOwnTeacherId(session);

  return Payslip.find({
    school: session.school,
    ...(teacherFilter ? { teacher: teacherFilter } : {}),
    ...(query.month ? { month: query.month } : {}),
    ...(query.year ? { year: query.year } : {}),
  })
    .sort({ year: -1, month: -1 })
    .populate("teacher", "name employeeId designation")
    .lean();
}

export async function generatePayslip(input: GeneratePayslipInput, actor: { id: string; school?: string }) {
  await connectDB();
  if (!actor.school) throw ApiError.badRequest("Your account is not linked to a school");

  const teacher = await Teacher.findOne({ _id: input.teacher, school: actor.school });
  if (!teacher) throw ApiError.badRequest("Teacher not found");

  const existing = await Payslip.findOne({
    school: actor.school,
    teacher: input.teacher,
    month: input.month,
    year: input.year,
  });
  if (existing) throw ApiError.conflict("A payslip for this period already exists");

  const periodEnd = new Date(input.year, input.month, 0, 23, 59, 59, 999);
  const structure = await SalaryStructure.findOne({
    school: actor.school,
    teacher: input.teacher,
    effectiveFrom: { $lte: periodEnd },
  }).sort({ effectiveFrom: -1 });
  if (!structure) throw ApiError.badRequest("No salary structure found for this teacher for the selected period");

  const { grossPay, netPay } = computeSalary(structure);

  const payslip = await Payslip.create({
    teacher: input.teacher,
    month: input.month,
    year: input.year,
    basicPay: structure.basicPay,
    allowances: structure.allowances,
    deductions: structure.deductions,
    grossPay,
    netPay,
    status: "generated",
    generatedAt: new Date(),
    generatedBy: actor.id,
    school: actor.school,
  });

  await ActivityLog.create({
    user: actor.id,
    action: "payslip.generate",
    entityType: "Payslip",
    entityId: payslip._id,
    metadata: { month: input.month, year: input.year },
    school: actor.school,
  });

  return payslip;
}

export async function updatePayslipStatus(
  id: string,
  input: UpdatePayslipStatusInput,
  actor: { id: string; school?: string }
) {
  await connectDB();

  const payslip = await Payslip.findOne({ _id: id, ...(actor.school ? { school: actor.school } : {}) });
  if (!payslip) throw ApiError.notFound("Payslip not found");

  payslip.status = input.status;
  if (input.status === "paid") payslip.paidAt = new Date();
  await payslip.save();

  await ActivityLog.create({
    user: actor.id,
    action: "payslip.status_update",
    entityType: "Payslip",
    entityId: payslip._id,
    metadata: { status: input.status },
    school: actor.school,
  });

  return payslip;
}
