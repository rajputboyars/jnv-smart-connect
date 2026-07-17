import { Types } from "mongoose";
import { connectDB } from "@/lib/db/connect";
import { InventoryRequest } from "@/models/InventoryRequest";
import { ActivityLog } from "@/models/ActivityLog";
import { ApiError } from "@/lib/utils/api-error";
import type { AccessTokenPayload } from "@/lib/auth/jwt";
import { can, PERMISSIONS } from "@/lib/auth/rbac";
import type {
  CreateInventoryRequestInput,
  ReviewInventoryRequestInput,
} from "@/validators/inventory.validator";

export async function listInventoryRequests(session: AccessTokenPayload, status?: string) {
  await connectDB();
  if (!session.school) return [];

  const canManage = can(session.role, PERMISSIONS.INVENTORY_MANAGE);
  const filter: Record<string, unknown> = {
    school: session.school,
    ...(status ? { status } : {}),
    // Staff without manage rights only ever see their own requests — this
    // endpoint doubles as "my requests" for regular staff and "all requests"
    // for inventory managers.
    ...(canManage ? {} : { requestedBy: session.sub }),
  };

  return InventoryRequest.find(filter)
    .sort({ createdAt: -1 })
    .populate("requestedBy", "name")
    .populate("approvedBy", "name")
    .lean();
}

export async function createInventoryRequest(
  input: CreateInventoryRequestInput,
  actor: { id: string; school?: string }
) {
  await connectDB();
  if (!actor.school) throw ApiError.badRequest("Your account is not linked to a school");

  const request = await InventoryRequest.create({
    ...input,
    category: input.category || undefined,
    requestedBy: actor.id,
    school: actor.school,
  });

  await ActivityLog.create({
    user: actor.id,
    action: "inventory_request.create",
    entityType: "InventoryRequest",
    entityId: request._id,
    school: actor.school,
  });

  return request;
}

export async function reviewInventoryRequest(
  id: string,
  input: ReviewInventoryRequestInput,
  actor: { id: string; school?: string }
) {
  await connectDB();

  const request = await InventoryRequest.findOne({ _id: id, ...(actor.school ? { school: actor.school } : {}) });
  if (!request) throw ApiError.notFound("Inventory request not found");

  request.status = input.status;
  request.approvedBy = new Types.ObjectId(actor.id);
  request.reviewNote = input.reviewNote || undefined;
  if (input.status === "fulfilled") request.fulfilledAt = new Date();
  await request.save();

  await ActivityLog.create({
    user: actor.id,
    action: "inventory_request.review",
    entityType: "InventoryRequest",
    entityId: request._id,
    metadata: { status: input.status },
    school: actor.school,
  });

  return request;
}
