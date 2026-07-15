import { connectDB } from "@/lib/db/connect";
import { Attendance } from "@/models/Attendance";
import { HostelBuilding } from "@/models/HostelBuilding";
import { HostelRoom } from "@/models/HostelRoom";
import { HostelAllocation } from "@/models/HostelAllocation";
import { BookIssue } from "@/models/BookIssue";
import { MedicineLog } from "@/models/MedicineLog";
import { DoctorVisit } from "@/models/DoctorVisit";
import { Types } from "mongoose";

const TREND_WINDOW_DAYS = 30;

function daysAgo(days: number): Date {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() - days);
  return date;
}

async function getAttendanceTrend(school: string) {
  const since = daysAgo(TREND_WINDOW_DAYS);

  const rows = await Attendance.aggregate([
    { $match: { school: new Types.ObjectId(school), entityType: "student", date: { $gte: since } } },
    {
      $group: {
        _id: { date: { $dateToString: { format: "%Y-%m-%d", date: "$date" } }, status: "$status" },
        count: { $sum: 1 },
      },
    },
    { $sort: { "_id.date": 1 } },
  ]);

  const byDate = new Map<string, { date: string; present: number; absent: number; late: number; leave: number }>();
  for (const row of rows) {
    const date = row._id.date as string;
    const status = row._id.status as string;
    if (!byDate.has(date)) {
      byDate.set(date, { date, present: 0, absent: 0, late: 0, leave: 0 });
    }
    const bucket = byDate.get(date)!;
    if (status === "present") bucket.present += row.count;
    else if (status === "absent") bucket.absent += row.count;
    else if (status === "late") bucket.late += row.count;
    else if (status === "leave" || status === "half_day") bucket.leave += row.count;
  }

  return [...byDate.values()].sort((a, b) => a.date.localeCompare(b.date));
}

async function getHostelOccupancy(school: string) {
  const schoolId = new Types.ObjectId(school);

  const [buildings, roomTotals, occupied] = await Promise.all([
    HostelBuilding.find({ school: schoolId }).select("name").lean(),
    HostelRoom.aggregate([
      { $match: { school: schoolId } },
      { $group: { _id: "$building", totalBeds: { $sum: "$bedCount" } } },
    ]),
    HostelAllocation.aggregate([
      { $match: { school: schoolId, status: "active" } },
      {
        $lookup: {
          from: "hostelrooms",
          localField: "room",
          foreignField: "_id",
          as: "room",
        },
      },
      { $unwind: "$room" },
      { $group: { _id: "$room.building", occupied: { $sum: 1 } } },
    ]),
  ]);

  const totalsByBuilding = new Map(roomTotals.map((r) => [r._id.toString(), r.totalBeds as number]));
  const occupiedByBuilding = new Map(occupied.map((o) => [o._id.toString(), o.occupied as number]));

  return buildings.map((b) => {
    const id = b._id.toString();
    const totalBeds = totalsByBuilding.get(id) ?? 0;
    const occupiedBeds = occupiedByBuilding.get(id) ?? 0;
    return {
      building: b.name,
      totalBeds,
      occupiedBeds,
      vacantBeds: Math.max(0, totalBeds - occupiedBeds),
      occupancyRate: totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0,
    };
  });
}

async function getLibraryCirculation(school: string) {
  const schoolId = new Types.ObjectId(school);
  const since = daysAgo(TREND_WINDOW_DAYS);

  const [issuesPerDay, topCategories, overdueCount] = await Promise.all([
    BookIssue.aggregate([
      { $match: { school: schoolId, issuedDate: { $gte: since } } },
      { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$issuedDate" } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]),
    BookIssue.aggregate([
      { $match: { school: schoolId } },
      { $lookup: { from: "books", localField: "book", foreignField: "_id", as: "book" } },
      { $unwind: "$book" },
      { $group: { _id: "$book.category", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
    ]),
    BookIssue.countDocuments({ school: schoolId, status: "issued", dueDate: { $lt: new Date() } }),
  ]);

  return {
    issuesPerDay: issuesPerDay.map((r) => ({ date: r._id as string, count: r.count as number })),
    topCategories: topCategories.map((r) => ({ category: (r._id as string) ?? "Uncategorized", count: r.count as number })),
    overdueCount,
  };
}

async function getHealthTrends(school: string) {
  const schoolId = new Types.ObjectId(school);
  const since = daysAgo(TREND_WINDOW_DAYS);

  const [medicineByDay, visitsByDay] = await Promise.all([
    MedicineLog.aggregate([
      { $match: { school: schoolId, givenAt: { $gte: since } } },
      { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$givenAt" } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]),
    DoctorVisit.aggregate([
      { $match: { school: schoolId, visitDate: { $gte: since } } },
      { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$visitDate" } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]),
  ]);

  const byDate = new Map<string, { date: string; medicineLogs: number; doctorVisits: number }>();
  for (const row of medicineByDay) {
    const date = row._id as string;
    byDate.set(date, { date, medicineLogs: row.count as number, doctorVisits: 0 });
  }
  for (const row of visitsByDay) {
    const date = row._id as string;
    const bucket = byDate.get(date) ?? { date, medicineLogs: 0, doctorVisits: 0 };
    bucket.doctorVisits = row.count as number;
    byDate.set(date, bucket);
  }

  return [...byDate.values()].sort((a, b) => a.date.localeCompare(b.date));
}

export async function getAnalyticsOverview(school?: string) {
  await connectDB();

  if (!school) {
    return {
      attendanceTrend: [],
      hostelOccupancy: [],
      libraryCirculation: { issuesPerDay: [], topCategories: [], overdueCount: 0 },
      healthTrends: [],
    };
  }

  const [attendanceTrend, hostelOccupancy, libraryCirculation, healthTrends] = await Promise.all([
    getAttendanceTrend(school),
    getHostelOccupancy(school),
    getLibraryCirculation(school),
    getHealthTrends(school),
  ]);

  return { attendanceTrend, hostelOccupancy, libraryCirculation, healthTrends };
}
