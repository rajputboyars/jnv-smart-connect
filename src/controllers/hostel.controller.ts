import { connectDB } from "@/lib/db/connect";
import { HostelBuilding } from "@/models/HostelBuilding";
import { HostelRoom } from "@/models/HostelRoom";
import { HostelAllocation } from "@/models/HostelAllocation";
import { Student } from "@/models/Student";
import { Parent } from "@/models/Parent";
import { ActivityLog } from "@/models/ActivityLog";
import { ApiError } from "@/lib/utils/api-error";
import { assertStudentInSchool } from "@/lib/auth/student-scope";
import { ROLES } from "@/types/roles";
import type { AccessTokenPayload } from "@/lib/auth/jwt";
import type {
  CreateHostelBuildingInput,
  UpdateHostelBuildingInput,
  CreateHostelRoomInput,
  UpdateHostelRoomInput,
  CreateAllocationInput,
} from "@/validators/hostel.validator";

async function resolveActiveAcademicYear(school: string) {
  const { School } = await import("@/models/School");
  const { AcademicYear } = await import("@/models/AcademicYear");

  const schoolDoc = await School.findById(school).select("activeAcademicYear");
  if (schoolDoc?.activeAcademicYear) return schoolDoc.activeAcademicYear;

  const latest = await AcademicYear.findOne({ school }).sort({ startDate: -1 });
  if (!latest) throw ApiError.badRequest("No academic year configured for your school yet");
  return latest._id;
}

// --- Buildings ---

export async function listHostelBuildings(school?: string) {
  await connectDB();
  if (!school) return [];

  const buildings = await HostelBuilding.find({ school })
    .sort({ name: 1 })
    .populate("warden", "name employeeId")
    .lean();

  const roomCounts = await HostelRoom.aggregate([
    { $match: { school } },
    { $group: { _id: "$building", count: { $sum: 1 }, beds: { $sum: "$bedCount" } } },
  ]);
  const countMap = new Map(roomCounts.map((r) => [r._id.toString(), r]));

  return buildings.map((b) => ({
    id: b._id.toString(),
    name: b.name,
    code: b.code,
    gender: b.gender,
    warden: b.warden,
    totalFloors: b.totalFloors,
    roomCount: countMap.get(b._id.toString())?.count ?? 0,
    bedCount: countMap.get(b._id.toString())?.beds ?? 0,
  }));
}

export async function createHostelBuilding(
  input: CreateHostelBuildingInput,
  actor: { id: string; school?: string }
) {
  await connectDB();
  if (!actor.school) throw ApiError.badRequest("Your account is not linked to a school");

  const existing = await HostelBuilding.findOne({ school: actor.school, code: input.code.toUpperCase() });
  if (existing) throw ApiError.conflict("A hostel building with this code already exists");

  const building = await HostelBuilding.create({
    ...input,
    code: input.code.toUpperCase(),
    warden: input.warden || undefined,
    school: actor.school,
  });

  await ActivityLog.create({
    user: actor.id,
    action: "hostel_building.create",
    entityType: "HostelBuilding",
    entityId: building._id,
    school: actor.school,
  });

  return building;
}

export async function updateHostelBuilding(
  id: string,
  input: UpdateHostelBuildingInput,
  actor: { id: string; school?: string }
) {
  await connectDB();
  const building = await HostelBuilding.findOne({ _id: id, ...(actor.school ? { school: actor.school } : {}) });
  if (!building) throw ApiError.notFound("Hostel building not found");

  Object.assign(building, {
    ...input,
    code: input.code ? input.code.toUpperCase() : building.code,
    warden: input.warden !== undefined ? input.warden || undefined : building.warden,
  });
  await building.save();

  await ActivityLog.create({
    user: actor.id,
    action: "hostel_building.update",
    entityType: "HostelBuilding",
    entityId: building._id,
    school: actor.school,
  });

  return building;
}

export async function deleteHostelBuilding(id: string, actor: { id: string; school?: string }) {
  await connectDB();
  const building = await HostelBuilding.findOne({ _id: id, ...(actor.school ? { school: actor.school } : {}) });
  if (!building) throw ApiError.notFound("Hostel building not found");

  const roomCount = await HostelRoom.countDocuments({ building: building._id });
  if (roomCount > 0) throw ApiError.conflict("Remove all rooms from this building first");

  await building.deleteOne();

  await ActivityLog.create({
    user: actor.id,
    action: "hostel_building.delete",
    entityType: "HostelBuilding",
    entityId: building._id,
    school: actor.school,
  });

  return { id: building._id.toString() };
}

// --- Rooms ---

export async function listHostelRooms(school?: string) {
  await connectDB();
  if (!school) return [];

  const rooms = await HostelRoom.find({ school }).sort({ roomNumber: 1 }).populate("building", "name code").lean();

  const occupancy = await HostelAllocation.aggregate([
    { $match: { school, status: "active" } },
    { $group: { _id: "$room", count: { $sum: 1 } } },
  ]);
  const occupancyMap = new Map(occupancy.map((o) => [o._id.toString(), o.count]));

  return rooms.map((r) => ({
    id: r._id.toString(),
    roomNumber: r.roomNumber,
    floor: r.floor,
    bedCount: r.bedCount,
    building: r.building,
    occupied: occupancyMap.get(r._id.toString()) ?? 0,
  }));
}

export async function createHostelRoom(
  input: CreateHostelRoomInput,
  actor: { id: string; school?: string }
) {
  await connectDB();
  if (!actor.school) throw ApiError.badRequest("Your account is not linked to a school");

  const existing = await HostelRoom.findOne({ building: input.building, roomNumber: input.roomNumber });
  if (existing) throw ApiError.conflict("This room number already exists in the building");

  const room = await HostelRoom.create({ ...input, school: actor.school });

  await ActivityLog.create({
    user: actor.id,
    action: "hostel_room.create",
    entityType: "HostelRoom",
    entityId: room._id,
    school: actor.school,
  });

  return room;
}

export async function updateHostelRoom(
  id: string,
  input: UpdateHostelRoomInput,
  actor: { id: string; school?: string }
) {
  await connectDB();
  const room = await HostelRoom.findOne({ _id: id, ...(actor.school ? { school: actor.school } : {}) });
  if (!room) throw ApiError.notFound("Room not found");

  Object.assign(room, input);
  await room.save();

  await ActivityLog.create({
    user: actor.id,
    action: "hostel_room.update",
    entityType: "HostelRoom",
    entityId: room._id,
    school: actor.school,
  });

  return room;
}

export async function deleteHostelRoom(id: string, actor: { id: string; school?: string }) {
  await connectDB();
  const room = await HostelRoom.findOne({ _id: id, ...(actor.school ? { school: actor.school } : {}) });
  if (!room) throw ApiError.notFound("Room not found");

  const activeCount = await HostelAllocation.countDocuments({ room: room._id, status: "active" });
  if (activeCount > 0) throw ApiError.conflict("This room has active occupants");

  await room.deleteOne();

  await ActivityLog.create({
    user: actor.id,
    action: "hostel_room.delete",
    entityType: "HostelRoom",
    entityId: room._id,
    school: actor.school,
  });

  return { id: room._id.toString() };
}

// --- Allocation ---

export async function listHostelAllocations(school?: string) {
  await connectDB();
  if (!school) return [];

  const allocations = await HostelAllocation.find({ school, status: "active" })
    .sort({ allocatedAt: -1 })
    .populate("student", "name admissionNumber photoUrl")
    .populate({ path: "room", select: "roomNumber floor building", populate: { path: "building", select: "name code" } })
    .lean();

  return allocations.map((a) => ({
    id: a._id.toString(),
    student: a.student,
    room: a.room,
    bedNumber: a.bedNumber,
    allocatedAt: a.allocatedAt,
  }));
}

export async function allocateBed(input: CreateAllocationInput, actor: { id: string; school?: string }) {
  await connectDB();
  if (!actor.school) throw ApiError.badRequest("Your account is not linked to a school");
  await assertStudentInSchool(input.student, actor.school);

  const room = await HostelRoom.findOne({ _id: input.room, school: actor.school });
  if (!room) throw ApiError.badRequest("Room not found");
  if (input.bedNumber > room.bedCount) {
    throw ApiError.badRequest(`This room only has ${room.bedCount} beds`);
  }

  const existingBed = await HostelAllocation.findOne({
    room: input.room,
    bedNumber: input.bedNumber,
    status: "active",
  });
  if (existingBed) throw ApiError.conflict("This bed is already occupied");

  const existingStudentAllocation = await HostelAllocation.findOne({
    student: input.student,
    status: "active",
  });
  if (existingStudentAllocation) {
    throw ApiError.conflict("This student already has an active room allocation");
  }

  const academicYear = await resolveActiveAcademicYear(actor.school);

  const allocation = await HostelAllocation.create({
    student: input.student,
    room: input.room,
    bedNumber: input.bedNumber,
    academicYear,
    school: actor.school,
    status: "active",
  });

  await Student.findByIdAndUpdate(input.student, { isHosteller: true });

  await ActivityLog.create({
    user: actor.id,
    action: "hostel_allocation.create",
    entityType: "HostelAllocation",
    entityId: allocation._id,
    school: actor.school,
  });

  return allocation;
}

export async function vacateBed(id: string, actor: { id: string; school?: string }) {
  await connectDB();

  const allocation = await HostelAllocation.findOne({
    _id: id,
    ...(actor.school ? { school: actor.school } : {}),
  });
  if (!allocation) throw ApiError.notFound("Allocation not found");

  allocation.status = "vacated";
  allocation.vacatedAt = new Date();
  await allocation.save();

  await ActivityLog.create({
    user: actor.id,
    action: "hostel_allocation.vacate",
    entityType: "HostelAllocation",
    entityId: allocation._id,
    school: actor.school,
  });

  return { id: allocation._id.toString() };
}

/** Self-serve view: a student's own allocation, or a parent's child's. */
export async function getMyHostelAllocation(session: AccessTokenPayload, studentIdParam?: string) {
  await connectDB();

  let studentId = studentIdParam;

  if (session.role === ROLES.STUDENT) {
    const own = await Student.findOne({ user: session.sub }).select("_id");
    if (!own) throw ApiError.notFound("Your student profile hasn't been linked yet");
    studentId = own._id.toString();
  } else if (session.role === ROLES.PARENT) {
    if (!studentId) throw ApiError.badRequest("studentId is required");
    const parent = await Parent.findOne({ user: session.sub, children: studentId });
    if (!parent) throw ApiError.forbidden("This student isn't linked to your account");
  } else {
    throw ApiError.forbidden("Only students and parents can use this endpoint");
  }

  const allocation = await HostelAllocation.findOne({ student: studentId, status: "active" })
    .populate({
      path: "room",
      select: "roomNumber floor building",
      populate: { path: "building", select: "name code warden", populate: { path: "warden", select: "name phone" } },
    })
    .lean();

  return allocation
    ? {
        room: allocation.room,
        bedNumber: allocation.bedNumber,
        allocatedAt: allocation.allocatedAt,
      }
    : null;
}
