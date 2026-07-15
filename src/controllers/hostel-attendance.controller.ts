import { type AnyBulkWriteOperation } from "mongoose";
import { connectDB } from "@/lib/db/connect";
import { HostelAttendance, type IHostelAttendance } from "@/models/HostelAttendance";
import { HostelAllocation } from "@/models/HostelAllocation";
import { ApiError } from "@/lib/utils/api-error";
import type { BulkHostelAttendanceInput } from "@/validators/hostel.validator";

function normalizeDate(date: string) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export async function getHostelRosterForAttendance(buildingId: string, date: string, school?: string) {
  await connectDB();

  const allocations = await HostelAllocation.find({
    status: "active",
    ...(school ? { school } : {}),
  })
    .populate({ path: "room", match: { building: buildingId }, select: "roomNumber building" })
    .populate("student", "name admissionNumber photoUrl")
    .lean();

  const relevant = allocations.filter((a) => a.room);

  const day = normalizeDate(date);
  const existing = await HostelAttendance.find({ building: buildingId, date: day }).lean();
  const existingMap = new Map(existing.map((a) => [a.student.toString(), a]));

  return relevant.map((a) => {
    const student = a.student as unknown as {
      _id: { toString(): string };
      name: string;
      admissionNumber: string;
      photoUrl?: string;
    };
    const existingRecord = existingMap.get(student._id.toString());

    return {
      student: {
        id: student._id.toString(),
        name: student.name,
        admissionNumber: student.admissionNumber,
        photoUrl: student.photoUrl,
      },
      room: a.room,
      status: existingRecord?.status ?? "present",
      remarks: existingRecord?.remarks ?? "",
    };
  });
}

export async function bulkMarkHostelAttendance(
  input: BulkHostelAttendanceInput,
  actor: { id: string; school?: string }
) {
  await connectDB();
  if (!actor.school) throw ApiError.badRequest("Your account is not linked to a school");

  const day = normalizeDate(input.date);

  const ops = input.records.map((record) => ({
    updateOne: {
      filter: { student: record.student, date: day },
      update: {
        $set: {
          school: actor.school,
          building: input.building,
          status: record.status,
          remarks: record.remarks || undefined,
          markedBy: actor.id,
        },
        $setOnInsert: { student: record.student, date: day },
      },
      upsert: true,
    },
  })) as unknown as AnyBulkWriteOperation<IHostelAttendance>[];

  await HostelAttendance.bulkWrite(ops);

  return { marked: input.records.length };
}

export async function getStudentHostelAttendanceHistory(
  studentId: string,
  from: string,
  to: string,
  school?: string
) {
  await connectDB();

  const records = await HostelAttendance.find({
    student: studentId,
    ...(school ? { school } : {}),
    date: { $gte: normalizeDate(from), $lte: normalizeDate(to) },
  })
    .sort({ date: 1 })
    .lean();

  const present = records.filter((r) => r.status === "present").length;
  const percentage = records.length > 0 ? Math.round((present / records.length) * 100) : 0;

  return {
    records: records.map((r) => ({ date: r.date, status: r.status, remarks: r.remarks })),
    percentage,
  };
}

